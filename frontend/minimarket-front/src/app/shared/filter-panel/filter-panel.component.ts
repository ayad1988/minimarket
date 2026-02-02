import { Component, EventEmitter, Output, effect, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductSearchParams } from '../../core/api/catalog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule],
  templateUrl: './filter-panel.component.html'
})
export class FilterPanelComponent {
  categories = input<string[]>([]);
  brands = input<string[]>([]);
  initial = input.required<ProductSearchParams>();

  @Output() apply = new EventEmitter<Partial<ProductSearchParams>>();
  @Output() reset = new EventEmitter<void>();

  private fb = new FormBuilder();

  form = this.fb.nonNullable.group({
    q: [''],
    category: [''],
    brand: [''],
    active: [false],
    minPrice: [null as number | null],
    maxPrice: [null as number | null],
    sort: ['price,asc']
  });

  // ✅ signal qui contiendra les filtres à jour
  private filtersSig = signal<Partial<ProductSearchParams>>({ sort: 'price,asc' });

  constructor() {
    // 1) sync params init → form (quand store change)
    effect(() => {
      const p = this.initial();
      this.form.patchValue({
        q: p.q ?? '',
        category: p.category ?? '',
        brand: p.brand ?? '',
        active: p.active ?? false,
        minPrice: (p.minPrice as any) ?? null,
        maxPrice: (p.maxPrice as any) ?? null,
        sort: p.sort ?? 'price,asc'
      }, { emitEvent: false });

      // important : mettre à jour filtersSig après patch
      this.filtersSig.set(this.toFilters());
    });

    // 2) sync form changes → filtersSig (source reactive)
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.filtersSig.set(this.toFilters());
      });

    // initialise une première fois
    this.filtersSig.set(this.toFilters());
  }

  // transforme form → objet de filtres API
  private toFilters(): Partial<ProductSearchParams> {
    const v = this.form.getRawValue();
    return {
      q: v.q || undefined,
      category: v.category || undefined,
      brand: v.brand || undefined,
      active: v.active ? true : undefined,
      minPrice: v.minPrice ?? undefined,
      maxPrice: v.maxPrice ?? undefined,
      sort: v.sort || 'price,asc'
    };
  }

  onApply() {
    // ✅ maintenant c’est toujours à jour
    this.apply.emit(this.filtersSig());
  }

  onReset() {
    this.form.reset({
      q: '',
      category: '',
      brand: '',
      active: false,
      minPrice: null,
      maxPrice: null,
      sort: 'price,asc'
    });
    this.filtersSig.set(this.toFilters());
    this.reset.emit();
  }
}
