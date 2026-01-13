import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { LeadStatus } from '../../../core/models/lead.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  @Input() status!: LeadStatus;

  get statusConfig(): {
    label: string;
    severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
    icon: string;
  } {
    const configs: {
      [key in LeadStatus]: {
        label: string;
        severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
        icon: string;
      };
    } = {
      [LeadStatus.NEW]: {
        label: 'Novo',
        severity: 'success',
        icon: 'pi pi-circle-fill'
      },
      [LeadStatus.INITIAL_CONTACT]: {
        label: 'Contato Inicial',
        severity: 'info',
        icon: 'pi pi-circle-fill'
      },
      [LeadStatus.NEGOTIATION]: {
        label: 'Negociação',
        severity: 'warning',
        icon: 'pi pi-circle-fill'
      },
      [LeadStatus.CONVERTED]: {
        label: 'Convertido',
        severity: 'success',
        icon: 'pi pi-check-circle'
      },
      [LeadStatus.LOST]: {
        label: 'Perdido',
        severity: 'danger',
        icon: 'pi pi-times-circle'
      }
    };

    return configs[this.status] || configs[LeadStatus.NEW];
  }
}
