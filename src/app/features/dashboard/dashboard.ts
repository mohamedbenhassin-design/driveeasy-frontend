import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocationApi } from '../../core/api';
import { Location, Statistiques } from '../../core/models';

/** Tableau de bord : indicateurs du parc, chiffre d'affaires et locations en cours. */
@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private api = inject(LocationApi);

  protected readonly stats = signal<Statistiques | null>(null);
  protected readonly enCours = signal<Location[]>([]);

  /** Hauteur relative de chaque barre du graphique du CA (en %). */
  protected readonly barres = computed(() => {
    const mois = this.stats()?.chiffreAffairesParMois ?? [];
    const max = Math.max(1, ...mois.map((m) => m.montant));
    return mois.map((m) => ({ ...m, hauteur: (m.montant / max) * 100, label: this.nomMois(m.mois) }));
  });

  /** Anneau "état du parc" dessiné avec un conic-gradient CSS. */
  protected readonly anneau = computed(() => {
    const p = this.stats()?.vehiculesParStatut ?? {};
    const total = this.stats()?.nombreVehicules || 1;
    const dispo = ((p['DISPONIBLE'] ?? 0) / total) * 360;
    const loue = ((p['LOUE'] ?? 0) / total) * 360;
    return `conic-gradient(#16a34a 0deg ${dispo}deg, #2563eb ${dispo}deg ${dispo + loue}deg, #f59e0b ${dispo + loue}deg 360deg)`;
  });

  constructor() {
    this.api.statistiques().subscribe((s) => this.stats.set(s));
    this.api.list({ statut: 'EN_COURS', size: 5 }).subscribe((p) => this.enCours.set(p.content));
  }

  private nomMois(iso: string): string {
    const [y, m] = iso.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'short' });
  }
}
