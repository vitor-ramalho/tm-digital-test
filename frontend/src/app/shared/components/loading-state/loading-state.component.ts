import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

/**
 * Loading State Component
 * Reusable loading indicator with skeleton and spinner options
 */
@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule, SkeletonModule, ProgressSpinnerModule],
  template: `
    <div class="loading-state" [class.loading-state--overlay]="overlay">
      <!-- Spinner Mode -->
      <div *ngIf="type === 'spinner'" class="loading-state__spinner">
        <p-progressSpinner
          [style]="{ width: size, height: size }"
          strokeWidth="3"
          animationDuration="1s">
        </p-progressSpinner>
        <p *ngIf="message" class="loading-state__message">{{ message }}</p>
      </div>

      <!-- Skeleton Mode -->
      <div *ngIf="type === 'skeleton'" class="loading-state__skeleton">
        <ng-container [ngSwitch]="skeletonType">
          <!-- Table Skeleton -->
          <div *ngSwitchCase="'table'" class="skeleton-table">
            <p-skeleton height="3rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton
              *ngFor="let i of [1,2,3,4,5]"
              height="2.5rem"
              styleClass="mb-2">
            </p-skeleton>
          </div>

          <!-- Card Skeleton -->
          <div *ngSwitchCase="'card'" class="skeleton-card">
            <p-skeleton height="8rem" styleClass="mb-3"></p-skeleton>
            <p-skeleton height="1.5rem" width="80%" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="1rem" width="60%"></p-skeleton>
          </div>

          <!-- List Skeleton -->
          <div *ngSwitchCase="'list'" class="skeleton-list">
            <div *ngFor="let i of [1,2,3,4]" class="skeleton-list-item mb-3">
              <p-skeleton shape="circle" size="3rem" styleClass="mr-2"></p-skeleton>
              <div style="flex: 1">
                <p-skeleton height="1rem" width="70%" styleClass="mb-2"></p-skeleton>
                <p-skeleton height="0.75rem" width="40%"></p-skeleton>
              </div>
            </div>
          </div>

          <!-- Default Skeleton -->
          <div *ngSwitchDefault class="skeleton-default">
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="5rem"></p-skeleton>
          </div>
        </ng-container>
      </div>

      <!-- Inline Mode -->
      <div *ngIf="type === 'inline'" class="loading-state__inline">
        <i class="pi pi-spin pi-spinner"></i>
        <span *ngIf="message">{{ message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      min-height: 200px;

      &--overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(2px);
        z-index: 1000;
        min-height: 100%;
      }
    }

    .loading-state__spinner,
    .loading-state__skeleton,
    .loading-state__inline {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading-state__message {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      margin: 0;
      text-align: center;
    }

    .loading-state__inline {
      flex-direction: row;
      padding: 0.5rem;
      min-height: auto;

      i {
        font-size: 1rem;
        color: var(--primary-color);
      }

      span {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }
    }

    .skeleton-table,
    .skeleton-card,
    .skeleton-list {
      width: 100%;
      max-width: 100%;
    }

    .skeleton-list-item {
      display: flex;
      align-items: center;
    }
  `]
})
export class LoadingStateComponent {
  @Input() type: 'spinner' | 'skeleton' | 'inline' = 'spinner';
  @Input() skeletonType: 'table' | 'card' | 'list' | 'default' = 'default';
  @Input() message?: string;
  @Input() size: string = '50px';
  @Input() overlay: boolean = false;
}
