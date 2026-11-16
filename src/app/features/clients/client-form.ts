import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientApi } from '../../core/api';
import { HasUnsavedChanges } from '../../core/guards';
import { NotificationService } from '../../core/notification.service';
import { CATEGORIES_CLIENT, ClientRequest } from '../../core/models';
import { libelle } from '../../shared/badge';

/** Formulaire réactif de création / modification d'un client. */
@Component({
  selector: 'app-client-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './client-form.html',
})
export class ClientForm implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private api = inject(ClientApi);
  private router = inject(Router);
  private notifications = inject(NotificationService);

  readonly id = input<string>();

  protected readonly categories = CATEGORIES_CLIENT;
  protected readonly libelle = libelle;
  protected readonly erreurServeur = signal<string | null>(null);
  protected readonly enregistrement = signal(false);
  private enregistre = false;

  protected readonly form = this.fb.nonNullable.group({
    cin: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    dateNaissance: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.pattern(/^$|^\+?[0-9 ]{8,15}$/)],
    adresse: [''],
    numeroPermis: ['', Validators.required],
    dateExpirationPermis: ['', Validators.required],
    categorieClient: ['STANDARD'],
  });

  get modeEdition() { return !!this.id(); }

  ngOnInit() {
    if (this.modeEdition) {
      this.api.get(Number(this.id())).subscribe({
        next: (c) => this.form.reset({
          cin: c.cin, nom: c.nom, prenom: c.prenom, dateNaissance: c.dateNaissance, email: c.email,
          telephone: c.telephone ?? '', adresse: c.adresse ?? '', numeroPermis: c.numeroPermis,
          dateExpirationPermis: c.dateExpirationPermis, categorieClient: c.categorieClient,
        }),
        error: () => this.router.navigate(['/clients']),
      });
    }
  }

  erreur(champ: string): string | null {
    const c = this.form.get(champ);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required']) return 'Champ obligatoire';
    if (c.errors['email']) return 'Adresse email invalide';
    if (c.errors['pattern']) return champ === 'cin' ? 'Le CIN contient 8 chiffres' : 'Format invalide';
    return 'Valeur invalide';
  }

  enregistrer() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.erreurServeur.set(null);
    this.enregistrement.set(true);
    const data = this.form.getRawValue() as ClientRequest;
    const requete = this.modeEdition ? this.api.update(Number(this.id()), data) : this.api.create(data);
    requete.subscribe({
      next: (c) => {
        this.enregistre = true;
        this.notifications.success(this.modeEdition ? 'Client modifié' : 'Client créé');
        this.router.navigate(['/clients', c.id]);
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
