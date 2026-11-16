import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LocationApi } from '../../core/api';
import { NotificationService } from '../../core/notification.service';
import { LocationDetail } from '../../core/models';
import { Badge } from '../../shared/badge';
import { isoDate } from '../../shared/dates';

/** Retour du véhicule : saisie du kilométrage, calcul des pénalités, récapitulatif imprimable. */
@Component({
  selector: 'app-location-retour',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, Badge],
  templateUrl: './location-retour.html',
})
export class LocationRetour implements OnInit {
  private api = inject(LocationApi);
  private router = inject(Router);
  private notifications = inject(NotificationService);

  readonly id = input.required<string>();

  protected readonly detail = signal<LocationDetail | null>(null);
  protected readonly kmRetour = signal<number | null>(null);
  protected readonly dateRetour = signal(isoDate());
  protected readonly envoi = signal(false);

  /** Aperçu du calcul (le calcul officiel est fait par location-service). */
  protected readonly apercu = computed(() => {
    const d = this.detail();
    if (!d) return null;
    const l = d.location;
    const retard = Math.max(0, Math.round(
      (new Date(this.dateRetour()).getTime() - new Date(l.dateFinPrevue).getTime()) / 86_400_000));
    const penalite = retard * 1.5 * l.prixJournalierApplique;
    const km = this.kmRetour();
    return {
      retard,
      penalite,
      total: l.montantTotal + penalite,
      distance: km != null && l.kmDepart != null ? km - l.kmDepart : null,
    };
  });

  protected readonly erreurKm = computed(() => {
    const km = this.kmRetour();
    const depart = this.detail()?.location.kmDepart;
    if (km == null) return 'Kilométrage obligatoire';
    if (depart != null && km < depart) return `Doit être ≥ au kilométrage de départ (${depart} km)`;
    return null;
  });

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.api.get(Number(this.id())).subscribe({
      next: (d) => {
        this.detail.set(d);
        if (this.kmRetour() == null) this.kmRetour.set(d.location.kmRetour ?? d.location.kmDepart ?? 0);
      },
      error: () => this.router.navigate(['/locations']),
    });
  }

  valider() {
    if (this.erreurKm()) return;
    this.envoi.set(true);
    this.api.retour(Number(this.id()), this.kmRetour()!, this.dateRetour()).subscribe({
      next: () => {
        this.notifications.success('Retour enregistré, véhicule de nouveau disponible');
        this.envoi.set(false);
        this.charger();
      },
      error: () => this.envoi.set(false),
    });
  }

  imprimer() {
    window.print();
  }
}
