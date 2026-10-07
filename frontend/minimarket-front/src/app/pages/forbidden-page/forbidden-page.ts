import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <div class="panel box">
        <span class="material-icons">lock</span>
        <h1>Accès refusé</h1>
        <p>Votre compte n'a pas le rôle administrateur nécessaire pour accéder à cet espace.</p>
        <a class="btn" routerLink="/">Retour à la boutique</a>
        <button type="button" class="btn secondary" (click)="auth.logout()">Changer de compte</button>
      </div>
    </div>
  `,
  styles: `
    .box { max-width: 480px; margin: 40px auto; text-align: center; display: flex; flex-direction: column; gap: 12px; align-items: center; }
    .material-icons { font-size: 56px; color: var(--mm-red); }
    h1 { margin: 0; font-weight: 500; }
  `,
})
export class ForbiddenPage {
  auth = inject(AuthService);
}
