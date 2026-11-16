import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LoadingService } from './core/interceptors';
import { NotificationService } from './core/notification.service';

/** Composant racine : barre latérale de navigation + zone de contenu + notifications. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly loading = inject(LoadingService).loading;
  protected readonly notifications = inject(NotificationService);

  protected readonly menu = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '◧' },
    { path: '/vehicules', label: 'Véhicules', icon: '🚗' },
    { path: '/clients', label: 'Clients', icon: '👤' },
    { path: '/locations', label: 'Locations', icon: '📄' },
  ];
}
