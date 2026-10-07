import { Product } from '../api/models';

/**
 * Le backend n'expose pas (encore) les notes, avis ni promotions.
 * Pour la maquette, ces valeurs sont simulées de façon déterministe à partir de l'id produit.
 */
export interface ProductMeta {
  rating: number;       // 3.5 → 4.9
  reviews: number;
  discountPct: number;  // 0 = pas de promo
  oldPrice: number | null;
  bestSeller: boolean;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function productMeta(p: Product): ProductMeta {
  const h = hash(p.id || p.sku);
  const discountPct = [0, 0, 10, 15, 20, 25, 30][h % 7];
  return {
    rating: 3.5 + (h % 15) / 10,
    reviews: 20 + (h % 2400),
    discountPct,
    oldPrice: discountPct ? Math.round((p.price / (1 - discountPct / 100)) * 100) / 100 : null,
    bestSeller: h % 5 === 0,
  };
}

export function productImage(p: Product, w = 400, h = 400): string {
  return `https://picsum.photos/seed/${p.id || p.sku}/${w}/${h}`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  ELECTRONICS: 'Électronique',
  COMPUTERS: 'Informatique',
  OFFICE: 'Bureau',
  ACCESSORIES: 'Accessoires',
  STORAGE: 'Stockage',
  NETWORK: 'Réseau',
};

export const CATEGORY_ICONS: Record<string, string> = {
  ELECTRONICS: 'headphones',
  COMPUTERS: 'laptop_mac',
  OFFICE: 'work',
  ACCESSORIES: 'mouse',
  STORAGE: 'sd_storage',
  NETWORK: 'router',
};

export const categoryLabel = (c: string) => CATEGORY_LABELS[c] ?? c;
