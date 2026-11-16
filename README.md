# DriveEasy · Frontend (Angular 22)

Application web destinée aux agents d'agence DriveEasy. Elle consomme l'API REST du backend
**exclusivement via l'API Gateway** (`http://localhost:8080/api`).

Réalisée avec **Angular CLI 22** : composants standalone, signals, détection de changement sans zone (zoneless),
nouveau control flow (`@if`, `@for`, `@switch`), formulaires réactifs, chargement paresseux des routes.

## Prérequis

- Node.js 22.22+ (ou 24.15+) et npm
- Le backend `driveeasy-backend` démarré (gateway sur le port 8080)

## Installation et lancement

```bash
npm install
npm start
```

Puis ouvrir http://localhost:4200

Build de production : `npm run build` (sortie dans `dist/driveeasy-frontend`).

## Écrans

| Écran | Route | Contenu |
|---|---|---|
| Tableau de bord | `/dashboard` | Véhicules disponibles / loués / en maintenance, CA du mois, locations en cours, graphique du CA sur 6 mois, anneau de l'état du parc, top véhicules |
| Catalogue | `/vehicules` | Grille de cartes avec image, filtres (carburant, catégorie, statut, prix max), tri, pagination |
| Formulaire véhicule | `/vehicules/new`, `/vehicules/:id/edit` | Formulaire réactif validé, gestion du statut |
| Clients | `/clients` | Tableau paginé, recherche à la frappe, badge STANDARD / FIDELE / VIP, alerte permis expiré |
| Fiche client | `/clients/:id` | Informations, éligibilité, historique des locations |
| Formulaire client | `/clients/new`, `/clients/:id/edit` | Création / modification |
| Nouvelle location | `/locations/new` | Assistant : client → période → véhicule disponible → simulation → confirmation |
| Locations | `/locations` | Filtres statut / période, pagination serveur, actions départ / retour / annulation |
| Retour | `/locations/:id/retour` | Saisie du kilométrage, aperçu des pénalités, récapitulatif imprimable |

## Structure

```
src/app/
├── app.ts / app.html / app.scss   # coquille : menu latéral, barre de chargement, notifications
├── app.config.ts                  # HttpClient + intercepteurs, routeur, locale fr
├── app.routes.ts                  # routes lazy-loaded + guards
├── core/
│   ├── api.ts                     # services HTTP : VehiculeApi, ClientApi, LocationApi
│   ├── models.ts                  # interfaces TypeScript (DTO du backend)
│   ├── interceptors.ts            # loadingInterceptor, errorInterceptor
│   ├── guards.ts                  # unsavedChangesGuard (CanDeactivate), validIdGuard (CanActivate)
│   └── notification.service.ts    # notifications (toasts) basées sur les signals
├── shared/
│   ├── badge.ts                   # composant badge de statut / catégorie
│   └── dates.ts
└── features/
    ├── dashboard/
    ├── vehicules/   (vehicule-list, vehicule-form)
    ├── clients/     (client-list, client-detail, client-form)
    └── locations/   (location-list, location-new, location-retour)
```

### Intercepteurs
- `loadingInterceptor` : affiche une barre de chargement tant qu'une requête est en cours.
- `errorInterceptor` : transforme chaque erreur HTTP (400, 404, 409, 503…) en notification lisible
  à partir du champ `message` renvoyé par les microservices.

### Guards
- `unsavedChangesGuard` : demande confirmation avant de quitter un formulaire modifié.
- `validIdGuard` : redirige vers la liste si l'identifiant de l'URL n'est pas un entier positif.

## Captures d'écran

_À ajouter : tableau de bord, catalogue, assistant de réservation, retour de véhicule._
