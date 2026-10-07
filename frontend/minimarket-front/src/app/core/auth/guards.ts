import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Page réservée aux utilisateurs connectés: sinon connexion, puis retour sur la page demandée. */
export const authGuard: CanActivateFn = async (_route, state) => {
  // inject() n'est valide qu'avant le premier await
  const browser = isPlatformBrowser(inject(PLATFORM_ID));
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!browser) return true;

  return (await auth.token()) ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Espace admin: connecté ET rôle admin; un client connecté voit la page « Accès refusé ». */
export const adminGuard: CanActivateFn = async (_route, state) => {
  const browser = isPlatformBrowser(inject(PLATFORM_ID));
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!browser) return true;

  if (!(await auth.token())) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  return auth.isAdmin() ? true : router.createUrlTree(['/forbidden']);
};

/** Login et inscription: inutiles si on est déjà connecté. */
export const guestGuard: CanActivateFn = async () => {
  const browser = isPlatformBrowser(inject(PLATFORM_ID));
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!browser) return true;

  return (await auth.token()) ? router.createUrlTree(['/account']) : true;
};
