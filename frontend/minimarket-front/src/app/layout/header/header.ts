import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CartStore } from '../../core/cart/cart.store';
import { CATEGORY_LABELS } from '../../core/util/product-meta';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private router = inject(Router);
  cart = inject(CartStore);
  auth = inject(AuthService);

  categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
  menuOpen = signal(false);

  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }

  search(q: string, category: string) {
    this.menuOpen.set(false);
    this.router.navigate(['/search'], {
      queryParams: { q: q.trim() || null, category: category || null },
    });
  }
}
