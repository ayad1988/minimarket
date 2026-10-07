import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/auth/guards';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', title: 'Tableau de bord — Admin',
        loadComponent: () => import('./admin/dashboard-page/dashboard-page').then((m) => m.DashboardPage) },
      { path: 'products', title: 'Produits — Admin',
        loadComponent: () => import('./admin/products-admin-page/products-admin-page').then((m) => m.ProductsAdminPage) },
      { path: 'products/new', title: 'Nouveau produit — Admin',
        loadComponent: () => import('./admin/product-form-page/product-form-page').then((m) => m.ProductFormPage) },
      { path: 'products/:id', title: 'Modifier le produit — Admin',
        loadComponent: () => import('./admin/product-form-page/product-form-page').then((m) => m.ProductFormPage) },
      { path: 'orders', title: 'Commandes — Admin',
        loadComponent: () => import('./admin/orders-admin-page/orders-admin-page').then((m) => m.OrdersAdminPage) },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./layout/shop-layout').then((m) => m.ShopLayout),
    children: [
      { path: '', title: 'MiniMarket — Les bons plans du moment',
        loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage) },
      { path: 'search', title: 'Catalogue — MiniMarket',
        loadComponent: () => import('./pages/catalog-page/catalog-page').then((m) => m.CatalogPage) },
      { path: 'product/:id', title: 'Produit — MiniMarket',
        loadComponent: () => import('./pages/product-page/product-page').then((m) => m.ProductPage) },
      { path: 'cart', title: 'Panier — MiniMarket',
        loadComponent: () => import('./pages/cart-page/cart-page').then((m) => m.CartPage) },
      { path: 'confirmation/:id', title: 'Commande confirmée — MiniMarket',
        loadComponent: () => import('./pages/confirmation-page/confirmation-page').then((m) => m.ConfirmationPage) },
      { path: 'login', title: 'Connexion — MiniMarket', canActivate: [guestGuard],
        loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage) },
      { path: 'register', title: 'Créer un compte — MiniMarket', canActivate: [guestGuard],
        loadComponent: () => import('./pages/register-page/register-page').then((m) => m.RegisterPage) },
      { path: 'account', title: 'Mon compte — MiniMarket', canActivate: [authGuard],
        loadComponent: () => import('./pages/account-page/account-page').then((m) => m.AccountPage) },
      { path: 'account/orders', title: 'Mes commandes — MiniMarket', canActivate: [authGuard],
        loadComponent: () => import('./pages/my-orders-page/my-orders-page').then((m) => m.MyOrdersPage) },
      { path: 'forbidden', title: 'Accès refusé — MiniMarket',
        loadComponent: () => import('./pages/forbidden-page/forbidden-page').then((m) => m.ForbiddenPage) },
      { path: '**', redirectTo: '' },
    ],
  },
];
