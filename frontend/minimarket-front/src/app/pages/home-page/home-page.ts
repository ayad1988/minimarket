import { Component, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../../core/util/product-meta';
import { ProductRail } from '../../shared/product-rail/product-rail';

interface Slide {
  title: string;
  text: string;
  cta: string;
  query: Record<string, string | number>;
  bg: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, ProductRail],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit, OnDestroy {
  private browser = isPlatformBrowser(inject(PLATFORM_ID));
  private timer?: ReturnType<typeof setInterval>;

  slides: Slide[] = [
    { title: 'Les bons plans du moment', text: "Des prix bas toute l'année sur l'électronique.",
      cta: 'Voir les offres', query: { category: 'ELECTRONICS', sort: 'price,asc' },
      bg: 'linear-gradient(120deg,#232f3e,#37475a 60%,#febd69)' },
    { title: 'Équipez votre bureau', text: 'Écrans, supports, claviers : travaillez confortablement.',
      cta: 'Découvrir', query: { category: 'OFFICE' },
      bg: 'linear-gradient(120deg,#0b3d5c,#067d62)' },
    { title: 'Livraison offerte dès 25 €', text: 'Commandez aujourd\'hui, suivez votre colis en temps réel.',
      cta: 'Tout le catalogue', query: {},
      bg: 'linear-gradient(120deg,#5b2a86,#cc0c39)' },
  ];
  current = signal(0);

  categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value, label, icon: CATEGORY_ICONS[value] ?? 'category',
  }));

  perks = [
    { icon: 'local_shipping', title: 'Livraison rapide', text: 'Gratuite dès 25 €' },
    { icon: 'lock', title: 'Paiement sécurisé', text: 'Transactions protégées' },
    { icon: 'undo', title: 'Retours 30 jours', text: 'Satisfait ou remboursé' },
    { icon: 'support_agent', title: 'Service client', text: '7j/7 par chat' },
  ];

  ngOnInit() {
    if (this.browser) this.timer = setInterval(() => this.go(1), 6000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  go(delta: number) {
    this.current.update((c) => (c + delta + this.slides.length) % this.slides.length);
  }

  pick(i: number) {
    this.current.set(i);
    clearInterval(this.timer); // l'utilisateur a pris la main: plus de rotation automatique
  }
}
