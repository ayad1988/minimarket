import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  auth = inject(AuthService);
  private router = inject(Router);
  menuOpen = signal(false);

  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }

  links = [
    { path: '/admin', label: 'Tableau de bord', icon: 'dashboard', exact: true },
    { path: '/admin/products', label: 'Produits', icon: 'inventory_2', exact: false },
    { path: '/admin/orders', label: 'Commandes', icon: 'receipt_long', exact: false },
  ];
}
