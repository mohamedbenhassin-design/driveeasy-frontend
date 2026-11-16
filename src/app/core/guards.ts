import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

/** Composant contenant un formulaire pouvant avoir des modifications non enregistrées. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** Guard : demande confirmation avant de quitter un formulaire modifié et non enregistré. */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  !component.hasUnsavedChanges() || confirm('Des modifications ne sont pas enregistrées. Quitter quand même ?');

/** Guard : l'identifiant présent dans l'URL doit être un entier positif, sinon retour à la liste. */
export const validIdGuard: CanActivateFn = (route) => {
  const id = Number(route.paramMap.get('id'));
  if (Number.isInteger(id) && id > 0) return true;
  // ex: /vehicules/abc/edit -> /vehicules
  return inject(Router).createUrlTree(['/' + (route.url[0]?.path ?? 'dashboard')]);
};
