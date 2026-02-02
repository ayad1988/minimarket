import { Component, input } from '@angular/core';
import { Product } from '../../core/api/models';
import { ProductCard } from "../product-card/product-card";

@Component({
  selector: 'app-product-list',
  imports: [ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  standalone: true
})
export class ProductList {

  products = input<Product[]>([]);
}
