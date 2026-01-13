import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Notification Service
 * Centralized service for displaying toast notifications
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private messageService: MessageService) {}

  /**
   * Show success message
   */
  success(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000,
      icon: 'pi-check-circle'
    });
  }

  /**
   * Show error message
   */
  error(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 5000,
      icon: 'pi-times-circle'
    });
  }

  /**
   * Show warning message
   */
  warning(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 4000,
      icon: 'pi-exclamation-triangle'
    });
  }

  /**
   * Show info message
   */
  info(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 3000,
      icon: 'pi-info-circle'
    });
  }

  /**
   * Show custom message
   */
  custom(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail?: string, life: number = 3000): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      life
    });
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.messageService.clear();
  }

  /**
   * Clear specific message by key
   */
  clearByKey(key: string): void {
    this.messageService.clear(key);
  }
}
