import { Component, EventEmitter, input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  standalone: true
})
export class Pagination {
  pageNumber = input(0);     // 0-based
  totalPages = input(0);
  totalElements = input(0);

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}
