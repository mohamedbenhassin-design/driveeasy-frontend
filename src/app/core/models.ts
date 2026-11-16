// Modèles TypeScript correspondant aux DTO exposés par les microservices (via la gateway).

export type Carburant = 'ESSENCE' | 'DIESEL' | 'HYBRIDE' | 'ELECTRIQUE';
export type Boite = 'MANUELLE' | 'AUTOMATIQUE';
export type Categorie = 'ECONOMIQUE' | 'COMPACTE' | 'BERLINE' | 'SUV' | 'LUXE';
export type StatutVehicule = 'DISPONIBLE' | 'LOUE' | 'MAINTENANCE';
export type CategorieClient = 'STANDARD' | 'FIDELE' | 'VIP';
export type StatutLocation = 'RESERVEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export const CARBURANTS: Carburant[] = ['ESSENCE', 'DIESEL', 'HYBRIDE', 'ELECTRIQUE'];
export const BOITES: Boite[] = ['MANUELLE', 'AUTOMATIQUE'];
export const CATEGORIES: Categorie[] = ['ECONOMIQUE', 'COMPACTE', 'BERLINE', 'SUV', 'LUXE'];
export const STATUTS_VEHICULE: StatutVehicule[] = ['DISPONIBLE', 'LOUE', 'MAINTENANCE'];
export const CATEGORIES_CLIENT: CategorieClient[] = ['STANDARD', 'FIDELE', 'VIP'];
export const STATUTS_LOCATION: StatutLocation[] = ['RESERVEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];

export interface Vehicule {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  couleur?: string;
  carburant: Carburant;
  boite: Boite;
  categorie: Categorie;
  nbPlaces: number;
  kilometrage: number;
  prixJournalier: number;
  statut: StatutVehicule;
  imageUrl?: string;
}

export type VehiculeRequest = Omit<Vehicule, 'id'>;

export interface Client {
  id: number;
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  age: number;
  email: string;
  telephone?: string;
  adresse?: string;
  numeroPermis: string;
  dateExpirationPermis: string;
  permisValide: boolean;
  categorieClient: CategorieClient;
  dateInscription: string;
}

export type ClientRequest = Omit<Client, 'id' | 'age' | 'permisValide' | 'dateInscription'>;

export interface Eligibilite {
  clientId: number;
  eligible: boolean;
  age: number;
  permisValide: boolean;
  categorieClient: CategorieClient;
  motifs: string[];
}

export interface Location {
  id: number;
  clientId: number;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
  dateRetourEffectif?: string;
  kmDepart?: number;
  kmRetour?: number;
  prixJournalierApplique: number;
  montantRemise: number;
  montantTotal: number;
  penalite: number;
  statut: StatutLocation;
  dateCreation: string;
}

export interface LocationRequest {
  clientId: number;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
}

export interface LocationDetail {
  location: Location;
  client: Partial<Client> | null;
  vehicule: Partial<Vehicule> | null;
  joursRetard: number;
  avertissements: string[];
}

export interface Simulation {
  nbJours: number;
  prixJournalier: number;
  categorieVehicule: string;
  coefficientCategorie: number;
  montantBrut: number;
  categorieClient: string;
  tauxRemise: number;
  montantRemise: number;
  montantTotal: number;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Statistiques {
  chiffreAffairesTotal: number;
  chiffreAffairesMois: number;
  nombreLocations: number;
  locationsParStatut: Record<StatutLocation, number>;
  vehiculesParStatut: Record<string, number>;
  nombreVehicules: number;
  tauxOccupation: number;
  topVehicules: { vehiculeId: number; libelle: string; immatriculation: string; nombreLocations: number; chiffreAffaires: number }[];
  chiffreAffairesParMois: { mois: string; montant: number }[];
}

/** Format JSON des erreurs renvoyées par les microservices. */
export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, string> | null;
}
