import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';

// Dev defaults: Keycloak is published on 8180 by infra/compose (realm imported from infra/keycloak).
// Keycloak must allow this origin (webOrigins) for the browser to call the token endpoint.
const KEYCLOAK_TOKEN_BASE = 'http://localhost:8180/realms/minimarket/protocol/openid-connect';
const CLIENT_ID = 'minimarket-front';
const STORAGE_KEY = 'minimarket.session';
const REFRESH_MARGIN_MS = 30_000;

export type Role = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
}

interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // ms epoch (access token)
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/** Message affichable à l'utilisateur. */
export class AuthError extends Error {
  constructor(message: string, readonly fields: Record<string, string> = {}) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private browser = isPlatformBrowser(inject(PLATFORM_ID));
  private refreshing: Promise<boolean> | null = null;

  private session = signal<Session | null>(this.restore());

  readonly user = computed<User | null>(() => {
    const s = this.session();
    return s ? parseUser(s.accessToken) : null;
  });
  readonly authenticated = computed(() => this.user() !== null);
  readonly isAdmin = computed(() => this.user()?.roles.includes('admin') ?? false);
  readonly displayName = computed(() => this.user()?.firstName || this.user()?.email || '');

  /** Connexion email + mot de passe auprès de Keycloak. */
  async login(email: string, password: string): Promise<void> {
    const body = new HttpParams()
      .set('grant_type', 'password').set('client_id', CLIENT_ID)
      .set('username', email.trim().toLowerCase()).set('password', password);
    try {
      this.setSession(await this.tokenRequest(body));
    } catch (e) {
      const status = (e as HttpErrorResponse).status;
      if (status === 401) throw new AuthError('E-mail ou mot de passe incorrect.');
      if (status === 400) throw new AuthError('Connexion refusée. Trop de tentatives ? Réessayez dans quelques minutes.');
      throw new AuthError('Service de connexion indisponible. Réessayez dans un instant.');
    }
  }

  /** Crée le compte via user-service puis connecte l'utilisateur. */
  async register(data: RegisterData): Promise<void> {
    try {
      await firstValueFrom(this.http.post('/api/accounts/register', data));
    } catch (e) {
      const err = e as HttpErrorResponse;
      if (err.status === 400 && err.error?.fields) throw new AuthError('Certains champs sont invalides.', err.error.fields);
      if (err.status === 409 || err.status === 400) throw new AuthError(err.error?.message ?? 'Inscription refusée.');
      throw new AuthError("L'inscription a échoué. Réessayez dans un instant.");
    }
    await this.login(data.email, data.password);
  }

  /** Jeton d'accès valide (rafraîchi si proche de l'expiration), ou null si non connecté / session expirée. */
  async token(): Promise<string | null> {
    const s = this.session();
    if (!s) return null;
    if (Date.now() < s.expiresAt - REFRESH_MARGIN_MS) return s.accessToken;
    return (await this.refresh()) ? this.session()!.accessToken : null;
  }

  async logout(): Promise<void> {
    const s = this.session();
    this.clear();
    if (!s) return;
    try { // révoque la session côté Keycloak; en cas d'échec la session locale est déjà supprimée
      const body = new HttpParams().set('client_id', CLIENT_ID).set('refresh_token', s.refreshToken);
      await firstValueFrom(this.http.post(`${KEYCLOAK_TOKEN_BASE}/logout`, body.toString(), formHeaders()));
    } catch { /* ignoré */ }
  }

  /** Supprime la session locale (ex: 401 reçu). */
  clear() {
    this.session.set(null);
    if (this.browser) {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* stockage indisponible */ }
    }
  }

  private refresh(): Promise<boolean> {
    // une seule requête de rafraîchissement à la fois, même si plusieurs appels API partent ensemble
    this.refreshing ??= this.doRefresh().finally(() => (this.refreshing = null));
    return this.refreshing;
  }

  private async doRefresh(): Promise<boolean> {
    const s = this.session();
    if (!s) return false;
    try {
      const body = new HttpParams().set('grant_type', 'refresh_token').set('client_id', CLIENT_ID).set('refresh_token', s.refreshToken);
      this.setSession(await this.tokenRequest(body));
      return true;
    } catch {
      this.clear(); // refresh token expiré ou révoqué
      return false;
    }
  }

  private async tokenRequest(body: HttpParams): Promise<Session> {
    const res = await firstValueFrom(this.http.post<{ access_token: string; refresh_token: string; expires_in: number }>(
      `${KEYCLOAK_TOKEN_BASE}/token`, body.toString(), formHeaders()));
    return { accessToken: res.access_token, refreshToken: res.refresh_token, expiresAt: Date.now() + res.expires_in * 1000 };
  }

  private setSession(s: Session) {
    this.session.set(s);
    if (this.browser) {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* stockage indisponible */ }
    }
  }

  private restore(): Session | null {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }
}

const formHeaders = () => ({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

function parseUser(jwt: string): User | null {
  try {
    const payload = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
    const c = JSON.parse(new TextDecoder().decode(bytes));
    const roles = ((c.realm_access?.roles ?? []) as string[]).filter((r): r is Role => r === 'admin' || r === 'customer');
    return { id: c.sub, email: c.email ?? '', firstName: c.given_name ?? '', lastName: c.family_name ?? '', roles };
  } catch {
    return null;
  }
}
