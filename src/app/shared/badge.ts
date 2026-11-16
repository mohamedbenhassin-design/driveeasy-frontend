import { Component, computed, input } from '@angular/core';

/** Libellés et couleurs des différents statuts / catégories. */
const STYLES: Record<string, { label: string; tone: string }> = {
  DISPONIBLE: { label: 'Disponible', tone: 'green' },
  LOUE: { label: 'Loué', tone: 'blue' },
  MAINTENANCE: { label: 'Maintenance', tone: 'orange' },
  STANDARD: { label: 'Standard', tone: 'gray' },
  FIDELE: { label: 'Fidèle', tone: 'blue' },
  VIP: { label: 'VIP', tone: 'gold' },
  RESERVEE: { label: 'Réservée', tone: 'purple' },
  EN_COURS: { label: 'En cours', tone: 'blue' },
  TERMINEE: { label: 'Terminée', tone: 'green' },
  ANNULEE: { label: 'Annulée', tone: 'gray' },
};

/** Badge coloré : <app-badge [value]="vehicule.statut" /> */
@Component({
  selector: 'app-badge',
  template: `<span class="badge" [class]="'badge badge-' + style().tone">{{ style().label }}</span>`,
})
export class Badge {
  readonly value = input.required<string>();
  protected readonly style = computed(() => STYLES[this.value()] ?? { label: this.value(), tone: 'gray' });
}

/** Libellé lisible pour une énumération (ex: ELECTRIQUE -> Electrique). */
export function libelle(v: string): string {
  return STYLES[v]?.label ?? v.charAt(0) + v.slice(1).toLowerCase().replace('_', ' ');
}
