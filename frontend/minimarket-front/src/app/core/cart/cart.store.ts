import { computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { CartLine, Product } from '../api/models';

const STORAGE_KEY = 'minimarket.cart';
const MAX_QTY = 10;

interface CartState {
  lines: CartLine[];
}

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState<CartState>({ lines: [] }),

  withComputed((state) => ({
    count: computed(() => state.lines().reduce((n, l) => n + l.quantity, 0)),
    subtotal: computed(() => state.lines().reduce((s, l) => s + l.unitPrice * l.quantity, 0)),
    currency: computed(() => state.lines()[0]?.currency ?? 'EUR'),
  })),

  withMethods((state) => {
    const browser = isPlatformBrowser(inject(PLATFORM_ID));

    const persist = () => {
      if (!browser) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines()));
      } catch { /* stockage indisponible: le panier reste en mémoire */ }
    };

    return {
      restore() {
        if (!browser) return;
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) patchState(state, { lines: JSON.parse(raw) as CartLine[] });
        } catch { /* contenu invalide: on repart d'un panier vide */ }
      },

      add(p: Product, quantity = 1) {
        const lines = state.lines();
        const existing = lines.find((l) => l.productId === p.id);
        patchState(state, {
          lines: existing
            ? lines.map((l) =>
                l.productId === p.id ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l)
            : [...lines, {
                productId: p.id, name: p.name, brand: p.brand,
                unitPrice: p.price, currency: p.currency, quantity: Math.min(MAX_QTY, quantity),
              }],
        });
        persist();
      },

      setQuantity(productId: string, quantity: number) {
        const q = Math.max(0, Math.min(MAX_QTY, Math.floor(quantity)));
        patchState(state, {
          lines: state.lines()
            .map((l) => (l.productId === productId ? { ...l, quantity: q } : l))
            .filter((l) => l.quantity > 0),
        });
        persist();
      },

      remove(productId: string) {
        patchState(state, { lines: state.lines().filter((l) => l.productId !== productId) });
        persist();
      },

      clear() {
        patchState(state, { lines: [] });
        persist();
      },
    };
  }),

  withHooks({ onInit: (store) => store.restore() }),
);

export const MAX_CART_QTY = MAX_QTY;
