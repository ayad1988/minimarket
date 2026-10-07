import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Redirects anonymous users to Keycloak; signed-in users without the admin role get the forbidden page. */
export const adminGuard: CanActivateFn = async (_route, state) => {
  // inject() n'est valide qu'avant le premier await
  const browser = isPlatformBrowser(inject(PLATFORM_ID));
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!browser) return true;

  await auth.init();

  if (!auth.authenticated()) {
    await auth.login(window.location.origin + state.url);
    return false;
  }
  return auth.isAdmin() ? true : router.createUrlTree(['/forbidden']);
};
