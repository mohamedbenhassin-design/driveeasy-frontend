import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientApi, LocationApi } from '../../core/api';
import { NotificationService } from '../../core/notification.service';
import { messageErreur } from '../../core/interceptors';
import { Client, Eligibilite, Simulation, Vehicule } from '../../core/models';
import { Badge, libelle } from '../../shared/badge';
import { isoDate } from '../../shared/dates';

/**
 * Assistant de réservation en 5 étapes :
 * client -> période -> véhicule disponible -> simulation du prix -> confirmation.
 */
@Component({
  selector: 'app-location-new',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, PercentPipe, Badge],
  templateUrl: './location-new.html',
  styleUrl: './location-new.scss',
})
export class LocationNew {
  private clientApi = inject(ClientApi);
  private locationApi = inject(LocationApi);
  private router = inject(Router);
  private notifications = inject(NotificationService);

  protected readonly etapes = ['Client', 'Période', 'Véhicule', 'Simulation', 'Confirmation'];
  protected readonly libelle = libelle;
  protected readonly etape = signal(0);

  // Étape 1 : client
  protected readonly clients = signal<Client[]>([]);
  protected readonly client = signal<Client | null>(null);
  protected readonly eligibilite = signal<Eligibilite | null>(null);
  protected recherche = '';
  protected readonly clientsFiltres = signal<Client[]>([]);

  // Étape 2 : période
  protected readonly aujourdHui = isoDate();
  protected dateDebut = isoDate(1);
  protected dateFin = isoDate(4);

  // Étape 3 : véhicule
  protected readonly vehicules = signal<Vehicule[]>([]);
  protected readonly vehicule = signal<Vehicule | null>(null);

  // Étape 4 : simulation
  protected readonly simulation = signal<Simulation | null>(null);
  protected readonly envoi = signal(false);

  // Erreur de l'étape courante et indicateur de chargement
  protected readonly erreur = signal<string | null>(null);
  protected readonly chargement = signal(false);

  constructor() {
    const clientId = Number(inject(ActivatedRoute).snapshot.queryParamMap.get('clientId'));
    this.clientApi.list().subscribe((list) => {
      this.clients.set(list);
      this.clientsFiltres.set(list);
      const preselection = list.find((c) => c.id === clientId);
      if (preselection) this.choisirClient(preselection);
    });
  }

  filtrerClients() {
    const q = this.recherche.toLowerCase();
    this.clientsFiltres.set(this.clients().filter((c) =>
      `${c.prenom} ${c.nom} ${c.cin} ${c.email}`.toLowerCase().includes(q)));
  }

  /** Étape 1 : vérification de l'éligibilité (appel client-service via la gateway). */
  choisirClient(c: Client) {
    this.client.set(c);
    this.eligibilite.set(null);
    this.clientApi.eligibilite(c.id).subscribe((e) => this.eligibilite.set(e));
  }

  nombreJours(): number {
    const ms = new Date(this.dateFin).getTime() - new Date(this.dateDebut).getTime();
    return Math.max(1, Math.round(ms / 86_400_000));
  }

  erreurPeriode(): string | null {
    if (!this.dateDebut || !this.dateFin) return 'Choisissez les deux dates';
    if (this.dateDebut < this.aujourdHui) return 'La date de début ne peut pas être dans le passé';
    if (this.dateFin < this.dateDebut) return 'La date de fin doit être après la date de début';
    return null;
  }

  /** Étape 2 -> 3 : chargement des véhicules libres sur la période. */
  chercherVehicules() {
    this.vehicule.set(null);
    this.erreur.set(null);
    this.chargement.set(true);
    this.locationApi.vehiculesDisponibles(this.dateDebut, this.dateFin).subscribe({
      next: (v) => {
        this.chargement.set(false);
        this.vehicules.set(v);
        this.etape.set(2);
      },
      error: (e) => this.echec(e),
    });
  }

  /** Étape 3 -> 4 : simulation du prix sans création. */
  simuler() {
    this.erreur.set(null);
    this.chargement.set(true);
    this.locationApi.simuler(this.requete()).subscribe({
      next: (s) => {
        this.chargement.set(false);
        this.simulation.set(s);
        this.etape.set(3);
      },
      error: (e) => this.echec(e),
    });
  }

  /** L'erreur reste affichée dans l'étape (la notification disparaît au bout de quelques secondes). */
  private echec(e: unknown) {
    this.chargement.set(false);
    this.erreur.set(messageErreur(e));
  }

  /** Étape 5 : création de la réservation. */
  confirmer() {
    this.envoi.set(true);
    this.locationApi.create(this.requete()).subscribe({
      next: (l) => {
        this.notifications.success(`Réservation #${l.id} créée (${l.montantTotal} DT)`);
        this.router.navigate(['/locations']);
      },
      error: () => this.envoi.set(false),
    });
  }

  allerA(i: number) {
    if (i < this.etape()) {
      this.erreur.set(null);
      this.etape.set(i);
    }
  }

  private requete() {
    return {
      clientId: this.client()!.id,
      vehiculeId: this.vehicule()!.id,
      dateDebut: this.dateDebut,
      dateFinPrevue: this.dateFin,
    };
  }
}
