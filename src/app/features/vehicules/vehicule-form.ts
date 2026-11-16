import { Component, OnInit, inject, input, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { VehiculeApi } from '../../core/api';
import { HasUnsavedChanges } from '../../core/guards';
import { NotificationService } from '../../core/notification.service';
import { BOITES, CARBURANTS, CATEGORIES, STATUTS_VEHICULE, VehiculeRequest } from '../../core/models';
import { libelle } from '../../shared/badge';

/** Validateur : l'année ne peut pas dépasser l'année courante (même règle que le backend). */
function anneeValide(control: AbstractControl): ValidationErrors | null {
  const v = Number(control.value);
  return v && v > new Date().getFullYear() ? { anneeFuture: true } : null;
}

/** Formulaire réactif de création / modification d'un véhicule. */
@Component({
  selector: 'app-vehicule-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './vehicule-form.html',
})
export class VehiculeForm implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private api = inject(VehiculeApi);
  private router = inject(Router);
  private notifications = inject(NotificationService);

  /** Paramètre :id de l'URL (absent en création), injecté grâce à withComponentInputBinding. */
  readonly id = input<string>();

  protected readonly carburants = CARBURANTS;
  protected readonly boites = BOITES;
  protected readonly categories = CATEGORIES;
  protected readonly statuts = STATUTS_VEHICULE;
  protected readonly libelle = libelle;
  protected readonly erreurServeur = signal<string | null>(null);
  protected readonly enregistrement = signal(false);
  private enregistre = false;

  protected readonly form = this.fb.nonNullable.group({
    immatriculation: ['', [Validators.required, Validators.pattern(/^[0-9]{1,3}\s?TU\s?[0-9]{1,4}$/i)]],
    marque: ['', Validators.required],
    modele: ['', Validators.required],
    annee: [new Date().getFullYear(), [Validators.required, Validators.min(1980), anneeValide]],
    couleur: [''],
    carburant: ['ESSENCE', Validators.required],
    boite: ['MANUELLE', Validators.required],
    categorie: ['ECONOMIQUE', Validators.required],
    nbPlaces: [5, [Validators.required, Validators.min(2), Validators.max(9)]],
    kilometrage: [0, [Validators.required, Validators.min(0)]],
    prixJournalier: [100, [Validators.required, Validators.min(0.01)]],
    statut: ['DISPONIBLE', Validators.required],
    imageUrl: [''],
  });

  get modeEdition() { return !!this.id(); }

  ngOnInit() {
    if (this.modeEdition) {
      this.api.get(Number(this.id())).subscribe({
        next: (v) => this.form.reset(v as never),
        error: () => this.router.navigate(['/vehicules']),
      });
    }
  }

  /** Message d'erreur pour un champ invalide déjà touché. */
  erreur(champ: string): string | null {
    const c = this.form.get(champ);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required']) return 'Champ obligatoire';
    if (c.errors['pattern']) return 'Format attendu : 123 TU 4567';
    if (c.errors['anneeFuture']) return "L'année ne peut pas dépasser l'année courante";
    if (c.errors['min']) return `Valeur minimale : ${c.errors['min'].min}`;
    if (c.errors['max']) return `Valeur maximale : ${c.errors['max'].max}`;
    return 'Valeur invalide';
  }

  enregistrer() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.erreurServeur.set(null);
    this.enregistrement.set(true);
    const data = this.form.getRawValue() as unknown as VehiculeRequest;
    const requete = this.modeEdition ? this.api.update(Number(this.id()), data) : this.api.create(data);
    requete.subscribe({
      next: () => {
        this.enregistre = true;
        this.notifications.success(this.modeEdition ? 'Véhicule modifié' : 'Véhicule ajouté');
        this.router.navigate(['/vehicules']);
      },
      error: (e: HttpErrorResponse) => {
        this.enregistrement.set(false);
        this.erreurServeur.set(e.error?.message ?? 'Erreur lors de l’enregistrement');
      },
    });
  }

  hasUnsavedChanges() {
    return this.form.dirty && !this.enregistre;
  }
}
