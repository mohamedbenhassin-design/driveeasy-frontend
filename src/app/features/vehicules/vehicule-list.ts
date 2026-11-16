import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VehiculeApi } from '../../core/api';
import { NotificationService } from '../../core/notification.service';
import { CARBURANTS, CATEGORIES, STATUTS_VEHICULE, Vehicule } from '../../core/models';
import { Badge, libelle } from '../../shared/badge';

type Tri = 'prix-asc' | 'prix-desc' | 'annee-desc' | 'marque';

/** Catalogue : grille de cartes avec filtres (côté serveur), tri et pagination (côté client). */
@Component({
  selector: 'app-vehicule-list',
  imports: [FormsModule, RouterLink, DecimalPipe, Badge],
  templateUrl: './vehicule-list.html',
  styleUrl: './vehicule-list.scss',
})
export class VehiculeList {
  private api = inject(VehiculeApi);
  private notifications = inject(NotificationService);

  protected readonly carburants = CARBURANTS;
  protected readonly categories = CATEGORIES;
  protected readonly statuts = STATUTS_VEHICULE;
  protected readonly libelle = libelle;
  protected readonly taillePage = 6;

  // Filtres envoyés à l'API (GET /vehicules?carburant=&categorie=&statut=&prixMax=)
  protected filtres = { carburant: '', categorie: '', statut: '', prixMax: null as number | null };
  protected readonly tri = signal<Tri>('prix-asc');
  protected readonly page = signal(0);
  protected readonly vehicules = signal<Vehicule[]>([]);

  protected readonly tries = computed(() => {
    const list = [...this.vehicules()];
    switch (this.tri()) {
      case 'prix-asc': return list.sort((a, b) => a.prixJournalier - b.prixJournalier);
      case 'prix-desc': return list.sort((a, b) => b.prixJournalier - a.prixJournalier);
      case 'annee-desc': return list.sort((a, b) => b.annee - a.annee);
      default: return list.sort((a, b) => (a.marque + a.modele).localeCompare(b.marque + b.modele));
    }
  });
  protected readonly nbPages = computed(() => Math.max(1, Math.ceil(this.tries().length / this.taillePage)));
  protected readonly pageCourante = computed(() =>
    this.tries().slice(this.page() * this.taillePage, (this.page() + 1) * this.taillePage));

  constructor() {
    this.charger();
  }

  charger() {
    this.api.list(this.filtres).subscribe((v) => {
      this.vehicules.set(v);
      this.page.set(0);
    });
  }

  reinitialiser() {
    this.filtres = { carburant: '', categorie: '', statut: '', prixMax: null };
    this.charger();
  }

  changerStatut(v: Vehicule, statut: string) {
    this.api.changerStatut(v.id, statut).subscribe((maj) => {
      this.vehicules.update((list) => list.map((x) => (x.id === maj.id ? maj : x)));
      this.notifications.success(`${v.marque} ${v.modele} : statut ${libelle(statut)}`);
    });
  }

  supprimer(v: Vehicule) {
    if (!confirm(`Supprimer ${v.marque} ${v.modele} (${v.immatriculation}) ?`)) return;
    this.api.delete(v.id).subscribe(() => {
      this.vehicules.update((list) => list.filter((x) => x.id !== v.id));
      this.notifications.success('Véhicule supprimé');
    });
  }

  /** Image de remplacement si l'URL de l'image est invalide. */
  imageParDefaut(event: Event) {
    (event.target as HTMLImageElement).src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180"><rect width="300" height="180" fill="%23e2e8f0"/><text x="150" y="98" font-size="40" text-anchor="middle">🚗</text></svg>';
  }
}
