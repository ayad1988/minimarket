import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      @if (auth.user(); as u) {
        <h1>Bonjour {{ u.firstName || u.email }}</h1>

        <section class="grid">
          <a class="tile panel" routerLink="/account/orders">
            <span class="material-icons">receipt_long</span>
            <strong>Mes commandes</strong>
            <small>Suivre et consulter vos achats</small>
          </a>
          @if (auth.isAdmin()) {
            <a class="tile panel" routerLink="/admin">
              <span class="material-icons">admin_panel_settings</span>
              <strong>Espace admin</strong>
              <small>Produits, commandes, statistiques</small>
            </a>
          }
          <button type="button" class="tile panel" (click)="logout()">
            <span class="material-icons">logout</span>
            <strong>Se déconnecter</strong>
            <small>Fermer votre session</small>
          </button>
        </section>

        <section class="panel profile">
          <h2>Informations du compte</h2>
          <dl>
            <dt>Nom</dt><dd>{{ u.firstName }} {{ u.lastName }}</dd>
            <dt>E-mail</dt><dd>{{ u.email }}</dd>
            <dt>Type de compte</dt>
            <dd>
              @for (r of u.roles; track r) {
                <span class="role" [class.admin]="r === 'admin'">{{ r === 'admin' ? 'Administrateur' : 'Client' }}</span>
              }
            </dd>
          </dl>
        </section>
      }
    </div>
  `,
  styles: `
    h1 { font-weight: 400; margin: 8px 0 16px; }
    h2 { margin: 0 0 12px; font-size: 18px; font-weight: 500; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-bottom: 16px; }
    .tile { display: flex; flex-direction: column; gap: 4px; text-decoration: none; color: var(--mm-text); text-align: left; font: inherit; cursor: pointer;
      &:hover { box-shadow: 0 4px 14px rgb(0 0 0 / 12%); }
      .material-icons { font-size: 32px; color: var(--mm-navy-2); }
      small { color: var(--mm-muted); } }
    dl { display: grid; grid-template-columns: 140px 1fr; gap: 8px 16px; margin: 0; dt { color: var(--mm-muted); } dd { margin: 0; } }
    .role { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background: #e3f0fb; color: #0b5394; margin-right: 6px;
      &.admin { background: #fff3d6; color: #8a5a00; } }
  `,
})
export class AccountPage {
  auth = inject(AuthService);
  private router = inject(Router);

  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }
}
