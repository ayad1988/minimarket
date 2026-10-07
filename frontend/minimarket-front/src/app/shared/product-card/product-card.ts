import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/api/models';
import { CartStore } from '../../core/cart/cart.store';
import { categoryLabel, productImage, productMeta } from '../../core/util/product-meta';
import { MoneyPipe } from '../money.pipe';
import { Stars } from '../stars/stars';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, MoneyPipe, Stars],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  standalone: true
})
export class ProductCard {
  private cart = inject(CartStore);

  product = input.required<Product>();

  meta = computed(() => productMeta(this.product()));
  image = computed(() => productImage(this.product(), 400, 400));
  category = computed(() => categoryLabel(this.product().category));
  added = signal(false);

  add() {
    this.cart.add(this.product());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1500);
  }
}
