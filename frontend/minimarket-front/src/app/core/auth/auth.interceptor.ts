import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

/** Only back-office calls carry the token: admin endpoints and catalog writes. Storefront calls stay anonymous. */
const needsToken = (url: string, method: string) =>
  url.startsWith('/api/admin') || (url.startsWith('/api/catalog') && method !== 'GET');

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!needsToken(req.url, req.method)) return next(req);
  const auth = inject(AuthService);
  return from(auth.token()).pipe(
    switchMap((token) =>
      next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req)),
  );
};
