import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Client, ClientRequest, Eligibilite, Location, LocationDetail, LocationRequest, Page,
  Simulation, Statistiques, Vehicule, VehiculeRequest,
} from './models';

/** Toutes les requêtes passent par l'API Gateway : jamais d'appel direct aux microservices. */
export const API_URL = 'http://localhost:8080/api';

/** Construit des HttpParams en ignorant les valeurs vides. */
function params(values: Record<string, unknown>): HttpParams {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(values)) {
    if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
  }
  return p;
}

@Injectable({ providedIn: 'root' })
export class VehiculeApi {
  private http = inject(HttpClient);
  private url = `${API_URL}/vehicules`;

  list(filtres: { categorie?: string; carburant?: string; statut?: string; prixMax?: number | null } = {}) {
    return this.http.get<Vehicule[]>(this.url, { params: params(filtres) });
  }
  get(id: number) { return this.http.get<Vehicule>(`${this.url}/${id}`); }
  create(v: VehiculeRequest) { return this.http.post<Vehicule>(this.url, v); }
  update(id: number, v: VehiculeRequest) { return this.http.put<Vehicule>(`${this.url}/${id}`, v); }
  delete(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
  changerStatut(id: number, statut: string) {
    return this.http.patch<Vehicule>(`${this.url}/${id}/statut`, { statut });
  }
}

@Injectable({ providedIn: 'root' })
export class ClientApi {
  private http = inject(HttpClient);
  private url = `${API_URL}/clients`;

  list(q = '') { return this.http.get<Client[]>(this.url, { params: params({ q }) }); }
  get(id: number) { return this.http.get<Client>(`${this.url}/${id}`); }
  create(c: ClientRequest) { return this.http.post<Client>(this.url, c); }
  update(id: number, c: ClientRequest) { return this.http.put<Client>(`${this.url}/${id}`, c); }
  delete(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
  eligibilite(id: number) { return this.http.get<Eligibilite>(`${this.url}/${id}/eligibilite`); }
}

@Injectable({ providedIn: 'root' })
export class LocationApi {
  private http = inject(HttpClient);
  private url = `${API_URL}/locations`;

  list(filtres: { statut?: string; clientId?: number; vehiculeId?: number; dateDebut?: string; dateFin?: string;
                  page?: number; size?: number }) {
    return this.http.get<Page<Location>>(this.url, { params: params(filtres) });
  }
  get(id: number) { return this.http.get<LocationDetail>(`${this.url}/${id}`); }
  create(r: LocationRequest) { return this.http.post<Location>(this.url, r); }
  simuler(r: LocationRequest) { return this.http.post<Simulation>(`${this.url}/simulation`, r); }
  vehiculesDisponibles(dateDebut: string, dateFin: string) {
    return this.http.get<Vehicule[]>(`${this.url}/vehicules-disponibles`, { params: params({ dateDebut, dateFin }) });
  }
  depart(id: number) { return this.http.patch<Location>(`${this.url}/${id}/depart`, {}); }
  retour(id: number, kmRetour: number, dateRetourEffectif: string) {
    return this.http.patch<Location>(`${this.url}/${id}/retour`, { kmRetour, dateRetourEffectif });
  }
  annuler(id: number) { return this.http.patch<Location>(`${this.url}/${id}/annulation`, {}); }
  statistiques() { return this.http.get<Statistiques>(`${this.url}/statistiques`); }
}
