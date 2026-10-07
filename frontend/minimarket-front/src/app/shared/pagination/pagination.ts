import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  page = input(0);          // 0-based
  totalPages = input(0);
  pageChange = output<number>();

  /** Pages à afficher: première, dernière et une fenêtre autour de la page courante ("-1" = ellipse). */
  items = computed(() => {
    const total = this.totalPages();
    const cur = this.page();
    const out: number[] = [];
    for (let i = 0; i < total; i++) {
      if (i === 0 || i === total - 1 || Math.abs(i - cur) <= 1) {
        out.push(i);
      } else if (out[out.length - 1] !== -1) {
        out.push(-1);
      }
    }
    return out;
  });

  go(p: number) {
    if (p < 0 || p >= this.totalPages() || p === this.page()) return;
    this.pageChange.emit(p);
  }
}
