import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <button type="button" class="to-top" (click)="top()">Retour en haut</button>
    <footer>
      <div class="cols">
        <div>
          <h4>MiniMarket</h4>
          <a routerLink="/">Accueil</a>
          <a routerLink="/search">Tous les produits</a>
          <a routerLink="/admin">Espace admin</a>
        </div>
        <div>
          <h4>Aide</h4>
          <span>Livraison &amp; retours</span>
          <span>Paiement sécurisé</span>
          <span>Service client</span>
        </div>
        <div>
          <h4>Projet</h4>
          <span>Angular · Spring Boot · Kafka</span>
          <span>Boutique de démonstration</span>
        </div>
      </div>
      <p class="legal">© MiniMarket — projet de démonstration, les paiements et livraisons sont simulés.</p>
    </footer>
  `,
  styleUrl: './footer.scss',
})
export class Footer {
  top() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
