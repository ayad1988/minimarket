import { Component, input } from '@angular/core';
import { Product } from '../../core/api/models';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  standalone: true
})
export class ProductCard {
  product = input.required<Product>();
}
