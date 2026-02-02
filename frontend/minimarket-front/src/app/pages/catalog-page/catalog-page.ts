import { Component, effect, inject, OnInit,  } from '@angular/core';
import { ProductList } from "../../shared/product-list/product-list";
import { Pagination } from "../../shared/pagination/pagination";
import { CatalogStore } from './catalog.store';
import { FilterPanelComponent } from "../../shared/filter-panel/filter-panel.component";
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-catalog-page',
  imports: [FilterPanelComponent, MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    ProductList,
    Pagination],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
  standalone: true
})
export class CatalogPage implements OnInit{

  store = inject(CatalogStore);
  ngOnInit(): void {
    this.store.load(); // ✅ appelé une seule fois au démarrage
  }
}
