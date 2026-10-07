import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type Keycloak from 'keycloak-js';

// Dev defaults: Keycloak is published on 8180 by infra/compose (realm imported from infra/keycloak).
const KEYCLOAK = { url: 'http://localhost:8180', realm: 'minimarket', clientId: 'minimarket-front' };
const ADMIN_ROLE = 'admin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private browser = isPlatformBrowser(inject(PLATFORM_ID));
  private kc?: Keycloak;
  private ready?: Promise<void>;

  readonly authenticated = signal(false);
  readonly isAdmin = signal(false);
  readonly username = signal<string | null>(null);

  /** Initialise Keycloak once (browser only); also completes a login redirect when returning from Keycloak. */
  init(): Promise<void> {
    if (!this.browser) return Promise.resolve();
    this.ready ??= this.doInit();
    return this.ready;
  }

  private async doInit() {
    const { default: KeycloakCtor } = await import('keycloak-js');
    const kc = new KeycloakCtor(KEYCLOAK);
    try {
      await kc.init({ pkceMethod: 'S256', checkLoginIframe: false });
    } catch {
      return; // Keycloak injoignable: l'utilisateur reste non authentifié
    }
    this.kc = kc;
    this.sync();
    kc.onTokenExpired = () => this.token().catch(() => undefined);
  }

  private sync() {
    const kc = this.kc;
    this.authenticated.set(!!kc?.authenticated);
    this.isAdmin.set(!!kc?.authenticated && kc.hasRealmRole(ADMIN_ROLE));
    this.username.set((kc?.tokenParsed?.['preferred_username'] as string | undefined) ?? null);
  }

  login(redirectUri = window.location.href) {
    return this.kc?.login({ redirectUri });
  }

  logout() {
    return this.kc?.logout({ redirectUri: window.location.origin + '/' });
  }

  /** A valid access token (refreshed when close to expiry), or null when not signed in. */
  async token(): Promise<string | null> {
    const kc = this.kc;
    if (!kc?.authenticated) return null;
    try {
      await kc.updateToken(30);
    } catch {
      this.sync();
      this.authenticated.set(false);
      this.isAdmin.set(false);
      return null; // session expirée
    }
    return kc.token ?? null;
  }
}
