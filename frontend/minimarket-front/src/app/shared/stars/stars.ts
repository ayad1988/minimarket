import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-stars',
  standalone: true,
  template: `
    <span class="stars" [attr.aria-label]="rating().toFixed(1) + ' sur 5'">
      @for (s of slots(); track $index) {
        <span class="star" [class.full]="s === 1" [class.half]="s === 0.5">★</span>
      }
    </span>
  `,
  styles: `
    .stars { display: inline-flex; letter-spacing: 1px; }
    .star { color: #ccc; position: relative; }
    .star.full { color: #f5a623; }
    .star.half { color: #ccc; }
    .star.half::before { content: '★'; color: #f5a623; position: absolute; width: 50%; overflow: hidden; }
  `,
})
export class Stars {
  rating = input.required<number>();
  slots = computed(() =>
    Array.from({ length: 5 }, (_, i) => {
      const diff = this.rating() - i;
      return diff >= 0.75 ? 1 : diff >= 0.25 ? 0.5 : 0;
    }));
}
