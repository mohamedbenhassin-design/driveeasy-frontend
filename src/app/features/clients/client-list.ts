import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClientApi } from '../../core/api';
import { NotificationService } from '../../core/notification.service';
import { Client } from '../../core/models';
import { Badge } from '../../shared/badge';

/** Liste des clients : recherche (nom / CIN / email), tableau paginé, badge de catégorie, alerte permis expiré. */
@Component({
  selector: 'app-client-list',
  imports: [FormsModule, RouterLink, DatePipe, Badge],
  templateUrl: './client-list.html',
})
export class ClientList {
  private api = inject(ClientApi);
  private notifications = inject(NotificationService);
  private recherche$ = new Subject<string>();

  protected readonly taillePage = 8;
  protected readonly clients = signal<Client[]>([]);
  protected readonly page = signal(0);
  protected readonly nbPages = computed(() => Math.max(1, Math.ceil(this.clients().length / this.taillePage)));
  protected readonly pageCourante = computed(() =>
    this.clients().slice(this.page() * this.taillePage, (this.page() + 1) * this.taillePage));
  protected readonly nbPermisExpires = computed(() => this.clients().filter((c) => !c.permisValide).length);
  protected q = '';

  constructor() {
    // Recherche "à la frappe" : on attend 300 ms et on annule la requête précédente (switchMap)
    this.recherche$
      .pipe(debounceTime(300), distinctUntilChanged(), switchMap((q) => this.api.list(q)), takeUntilDestroyed())
      .subscribe((list) => {
        this.clients.set(list);
        this.page.set(0);
      });
    this.api.list().subscribe((list) => this.clients.set(list));
  }

  rechercher(q: string) {
    this.recherche$.next(q.trim());
  }

  supprimer(c: Client) {
    if (!confirm(`Supprimer le client ${c.prenom} ${c.nom} ?`)) return;
    this.api.delete(c.id).subscribe(() => {
      this.clients.update((list) => list.filter((x) => x.id !== c.id));
      this.notifications.success('Client supprimé');
    });
  }
}
