import { RenderMode, ServerRoute } from '@angular/ssr';

// Les pages dépendent d'API et du panier (localStorage): rendu côté client uniquement,
// sinon le prerender échoue sur les routes dynamiques (product/:id, confirmation/:id).
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
