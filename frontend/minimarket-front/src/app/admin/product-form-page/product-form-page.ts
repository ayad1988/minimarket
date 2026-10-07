import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/api/catalog.service';
import { ProductPayload } from '../../core/api/models';
import { CATEGORY_LABELS } from '../../core/util/product-meta';

/** Création et modification d'un produit (le SKU est figé après création, comme côté API). */
@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form-page.html',
  styleUrl: './product-form-page.scss',
})
export class ProductFormPage implements OnInit {
  private api = inject(CatalogService);
  private router = inject(Router);
  private id = inject(ActivatedRoute).snapshot.paramMap.get('id');

  isEdit = !!this.id;
  categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  loading = signal(this.isEdit);
  saving = signal(false);
  error = signal<string | null>(null);
  serverFields = signal<Record<string, string>>({});

  form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    sku: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(64)]],
    category: ['', Validators.required],
    brand: ['', Validators.maxLength(120)],
    model: ['', Validators.maxLength(120)],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    currency: ['EUR', Validators.required],
    mainImageUrl: ['', Validators.pattern(/^$|^https?:\/\/.+/)],
    description: [''],
    active: [true],
  });

  title = computed(() => (this.isEdit ? 'Modifier le produit' : 'Nouveau produit'));

  ngOnInit() {
    if (!this.id) return;
    this.form.controls.sku.disable();
    this.api.getById(this.id).subscribe({
      next: (p) => {
        this.form.patchValue({
          name: p.name, sku: p.sku, category: p.category, brand: p.brand ?? '', model: p.model ?? '',
          price: p.price, currency: p.currency, mainImageUrl: p.mainImageUrl ?? '',
          description: p.description ?? '', active: p.active,
        });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.error.set('Produit introuvable.'); },
    });
  }

  invalid(name: keyof typeof this.form.controls) {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    const v = this.form.getRawValue();
    const payload: ProductPayload = {
      name: v.name.trim(), sku: v.sku.trim(), category: v.category, price: v.price!, currency: v.currency,
      brand: v.brand.trim() || undefined, model: v.model.trim() || undefined,
      mainImageUrl: v.mainImageUrl.trim() || undefined, description: v.description.trim() || undefined,
      active: v.active,
    };

    this.saving.set(true);
    this.error.set(null);
    this.serverFields.set({});

    const request = this.id
      ? this.api.update(this.id, { ...payload, sku: undefined }) // le SKU ne change jamais
      : this.api.create(payload);

    request.subscribe({
      next: () => this.router.navigate(['/admin/products']),
      error: (e: HttpErrorResponse) => {
        this.saving.set(false);
        if (e.status === 400 && e.error?.fields) {
          this.serverFields.set(e.error.fields);
          this.error.set('Certains champs sont invalides.');
        } else if (e.status === 409) {
          this.error.set(e.error?.message ?? 'Conflit: ce SKU existe déjà.');
        } else if (e.status === 401 || e.status === 403) {
          this.error.set('Session expirée ou droits insuffisants. Reconnectez-vous.');
        } else {
          this.error.set("L'enregistrement a échoué. Réessayez.");
        }
      },
    });
  }
}
