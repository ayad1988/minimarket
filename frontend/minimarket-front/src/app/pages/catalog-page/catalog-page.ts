import { Component, OnInit, signal } from '@angular/core';
import { Page, Product } from '../../core/api/models';
import { CatalogService, ProductSearchParams } from '../../core/api/catalog.service';
import { ProductList } from "../../shared/product-list/product-list";
import { Pagination } from "../../shared/pagination/pagination";

@Component({
  selector: 'app-catalog-page',
  imports: [ProductList, Pagination],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
  standalone: true
})
export class CatalogPage implements OnInit{

  loading = signal(false);
  page = signal<Page<Product> | null>(null);

  params: ProductSearchParams = {
    page: 0,
    size: 10,
    sort: 'price,asc'
  };

  constructor(private catalog: CatalogService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.catalog.search(this.params).subscribe({
      next: (p) => this.page.set(p),
      error: (e) => console.error(e),
      complete: () => this.loading.set(false)
    });
  }

  prev(): void {
    const p = this.page();
    if (!p || p.number <= 0) return;
    this.params.page = p.number - 1;
    this.load();
  }

  next(): void {
    const p = this.page();
    if (!p || p.number + 1 >= p.totalPages) return;
    this.params.page = p.number + 1;
    this.load();
  }

}
