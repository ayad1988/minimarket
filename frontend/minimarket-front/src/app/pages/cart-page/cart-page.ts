import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/api/order.service';
import { CartStore, MAX_CART_QTY } from '../../core/cart/cart.store';
import { MoneyPipe } from '../../shared/money.pipe';

const FREE_SHIPPING_FROM = 25;
const SHIPPING_FEE = 4.9;

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MoneyPipe],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {
  cart = inject(CartStore);
  private orders = inject(OrderService);
  private router = inject(Router);

  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submitting = signal(false);
  error = signal<string | null>(null);

  qtyOptions = Array.from({ length: MAX_CART_QTY }, (_, i) => i + 1);
  freeFrom = FREE_SHIPPING_FROM;

  shipping = computed(() => (this.cart.subtotal() >= FREE_SHIPPING_FROM || this.cart.count() === 0 ? 0 : SHIPPING_FEE));
  total = computed(() => this.cart.subtotal() + this.shipping());
  missingForFree = computed(() => Math.max(0, FREE_SHIPPING_FROM - this.cart.subtotal()));
  progress = computed(() => Math.min(100, (this.cart.subtotal() / FREE_SHIPPING_FROM) * 100));

  setQty(id: string, value: string) {
    this.cart.setQuantity(id, +value);
  }

  checkout() {
    if (this.form.invalid || this.cart.count() === 0 || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    this.orders.create({
      customerEmail: this.form.getRawValue().email,
      items: this.cart.lines().map((l) => ({ productId: l.productId, quantity: l.quantity, unitPrice: l.unitPrice })),
    }).subscribe({
      next: (order) => {
        this.cart.clear();
        this.router.navigate(['/confirmation', order.id]);
      },
      error: () => {
        this.submitting.set(false);
        this.error.set("La commande n'a pas pu être enregistrée. Votre panier est conservé, réessayez dans un instant.");
      },
    });
  }
}
