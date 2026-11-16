import { Component, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ClientApi, LocationApi } from '../../core/api';
import { Client, Eligibilite, Location } from '../../core/models';
import { Badge } from '../../shared/badge';

/** Fiche client : informations, éligibilité à la location et historique des locations. */
@Component({
  selector: 'app-client-detail',
  imports: [RouterLink, DatePipe, DecimalPipe, Badge],
  templateUrl: './client-detail.html',
})
export class ClientDetail implements OnInit {
  private clientApi = inject(ClientApi);
  private locationApi = inject(LocationApi);
  private router = inject(Router);

  readonly id = input.required<string>();

  protected readonly client = signal<Client | null>(null);
  protected readonly eligibilite = signal<Eligibilite | null>(null);
  protected readonly historique = signal<Location[]>([]);

  ngOnInit() {
    const id = Number(this.id());
    this.clientApi.get(id).subscribe({
      next: (c) => this.client.set(c),
      error: () => this.router.navigate(['/clients']),
    });
    this.clientApi.eligibilite(id).subscribe((e) => this.eligibilite.set(e));
    this.locationApi.list({ clientId: id, size: 100 }).subscribe((p) => this.historique.set(p.content));
  }
}
