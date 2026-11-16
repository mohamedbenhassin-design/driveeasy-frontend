import { Routes } from '@angular/router';
import { unsavedChangesGuard, validIdGuard } from './core/guards';

/** Routage : chaque écran est chargé à la demande (lazy loading des composants standalone). */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Tableau de bord · DriveEasy',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'vehicules',
    title: 'Véhicules · DriveEasy',
    loadComponent: () => import('./features/vehicules/vehicule-list').then((m) => m.VehiculeList),
  },
  {
    path: 'vehicules/new',
    title: 'Nouveau véhicule · DriveEasy',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./features/vehicules/vehicule-form').then((m) => m.VehiculeForm),
  },
  {
    path: 'vehicules/:id/edit',
    title: 'Modifier le véhicule · DriveEasy',
    canActivate: [validIdGuard],
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./features/vehicules/vehicule-form').then((m) => m.VehiculeForm),
  },
  {
    path: 'clients',
    title: 'Clients · DriveEasy',
    loadComponent: () => import('./features/clients/client-list').then((m) => m.ClientList),
  },
  {
    path: 'clients/new',
    title: 'Nouveau client · DriveEasy',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./features/clients/client-form').then((m) => m.ClientForm),
  },
  {
    path: 'clients/:id/edit',
    title: 'Modifier le client · DriveEasy',
    canActivate: [validIdGuard],
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./features/clients/client-form').then((m) => m.ClientForm),
  },
  {
    path: 'clients/:id',
    title: 'Fiche client · DriveEasy',
    canActivate: [validIdGuard],
    loadComponent: () => import('./features/clients/client-detail').then((m) => m.ClientDetail),
  },
  {
    path: 'locations',
    title: 'Locations · DriveEasy',
    loadComponent: () => import('./features/locations/location-list').then((m) => m.LocationList),
  },
  {
    path: 'locations/new',
    title: 'Nouvelle location · DriveEasy',
    loadComponent: () => import('./features/locations/location-new').then((m) => m.LocationNew),
  },
  {
    path: 'locations/:id/retour',
    title: 'Retour de véhicule · DriveEasy',
    canActivate: [validIdGuard],
    loadComponent: () => import('./features/locations/location-retour').then((m) => m.LocationRetour),
  },
  { path: '**', redirectTo: 'dashboard' },
];
