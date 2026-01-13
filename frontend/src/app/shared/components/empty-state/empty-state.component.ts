import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

/**
 * Empty State Component
 * Reusable empty state with icon, message, and action button
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="empty-state" [class.empty-state--compact]="compact">
      <!-- Icon -->
      <div class="empty-state__icon">
        <i [class]="'pi ' + icon"></i>
      </div>

      <!-- Title -->
      <h3 class="empty-state__title">{{ title }}</h3>

      <!-- Description -->
      <p *ngIf="description" class="empty-state__description">
        {{ description }}
      </p>

      <!-- Action Button -->
      <div *ngIf="actionLabel" class="empty-state__action">
        <p-button
          [label]="actionLabel"
          [icon]="actionIcon"
          (onClick)="action.emit()"
          [styleClass]="actionStyle">
        </p-button>
      </div>

      <!-- Secondary Message -->
      <p *ngIf="secondaryMessage" class="empty-state__secondary">
        {{ secondaryMessage }}
      </p>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
      min-height: 300px;

      &--compact {
        padding: 2rem 1rem;
        min-height: 200px;
      }
    }

    .empty-state__icon {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      background-color: var(--gray-100);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;

      i {
        font-size: 2rem;
        color: var(--gray-400);
      }
    }

    .empty-state--compact .empty-state__icon {
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;

      i {
        font-size: 1.5rem;
      }
    }

    .empty-state__title {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--text-color);
      margin: 0 0 0.5rem 0;
    }

    .empty-state--compact .empty-state__title {
      font-size: var(--font-size-lg);
    }

    .empty-state__description {
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      margin: 0 0 1.5rem 0;
      max-width: 400px;
    }

    .empty-state--compact .empty-state__description {
      font-size: var(--font-size-sm);
      margin-bottom: 1rem;
    }

    .empty-state__action {
      margin-bottom: 1rem;
    }

    .empty-state__secondary {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
      margin: 0;
    }

    @media (max-width: 768px) {
      .empty-state {
        padding: 2rem 1rem;
        min-height: 250px;
      }

      .empty-state__icon {
        width: 3.5rem;
        height: 3.5rem;

        i {
          font-size: 1.75rem;
        }
      }

      .empty-state__title {
        font-size: var(--font-size-lg);
      }

      .empty-state__description {
        font-size: var(--font-size-sm);
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'pi-inbox';
  @Input() title: string = 'Nenhum item encontrado';
  @Input() description?: string;
  @Input() actionLabel?: string;
  @Input() actionIcon?: string = 'pi-plus';
  @Input() actionStyle: string = 'p-button-primary';
  @Input() secondaryMessage?: string;
  @Input() compact: boolean = false;

  @Output() action = new EventEmitter<void>();
}
