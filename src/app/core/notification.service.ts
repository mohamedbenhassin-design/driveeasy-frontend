import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

/** Notifications (toasts) affichées en haut à droite de l'écran. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string) { this.push('success', message); }
  error(message: string) { this.push('error', message); }
  info(message: string) { this.push('info', message); }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(type: Toast['type'], message: string) {
    const id = ++this.seq;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), type === 'error' ? 6000 : 3500);
  }
}
