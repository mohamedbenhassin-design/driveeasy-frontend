import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ClientApi, LocationApi, VehiculeApi } from '../../core/api';
import { NotificationService } from '../../core/notification.service';
import { Location, Page, STATUTS_LOCATION } from '../../core/models';
import { Badge, libelle } from '../../shared/badge';

/** Liste des locations filtrable par statut et période, avec pagination côté serveur et actions. */
@Component({
  selector: 'app-location-list',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, Badge],
  templateUrl: './location-list.html',
})
export class LocationList {
  private api = inject(LocationApi);
  private clientApi = inject(ClientApi);
  private vehiculeApi = inject(VehiculeApi);
  private notifications = inject(NotificationService);

  protected readonly statuts = STATUTS_LOCATION;
  protected readonly libelle = libelle;
  protected filtres = { statut: '', dateDebut: '', dateFin: '' };
  protected readonly page = signal<Page<Location> | null>(null);

  // Noms des clients et véhicules (pour afficher des libellés au lieu des identifiants)
  private readonly clients = signal(new Map<number, string>());
  private readonly vehicules = signal(new Map<number, string>());
  protected readonly nomClient = computed(() => (id: number) => this.clients().get(id) ?? `Client #${id}`);
  protected readonly nomVehicule = computed(() => (id: number) => this.vehicules().get(id) ?? `Véhicule #${id}`);

  constructor() {
    forkJoin([this.clientApi.list(), this.vehiculeApi.list()]).subscribe(([c, v]) => {
      this.clients.set(new Map(c.map((x) => [x.id, `${x.prenom} ${x.nom}`])));
      this.vehicules.set(new Map(v.map((x) => [x.id, `${x.marque} ${x.modele} · ${x.immatriculation}`])));
    });
    this.charger(0);
  }

  charger(numeroPage = 0) {
    this.api.list({ ...this.filtres, page: numeroPage, size: 10 }).subscribe((p) => this.page.set(p));
  }

  reinitialiser() {
    this.filtres = { statut: '', dateDebut: '', dateFin: '' };
    this.charger(0);
  }

  depart(l: Location) {
    this.api.depart(l.id).subscribe(() => {
      this.notifications.success(`Location #${l.id} démarrée : véhicule remis au client`);
      this.charger(this.page()?.page ?? 0);
    });
  }

  annuler(l: Location) {
    if (!confirm(`Annuler la réservation #${l.id} ?`)) return;
    this.api.annuler(l.id).subscribe(() => {
      this.notifications.success(`Réservation #${l.id} annulée`);
      this.charger(this.page()?.page ?? 0);
    });
  }
}
