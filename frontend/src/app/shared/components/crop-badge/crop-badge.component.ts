import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { CropType } from '../../../core/models/rural-property.model';

@Component({
  selector: 'app-crop-badge',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './crop-badge.component.html',
  styleUrl: './crop-badge.component.scss'
})
export class CropBadgeComponent {
  @Input() cropType!: CropType;

  get cropConfig(): {
    label: string;
    severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
    icon: string;
  } {
    const configs: {
      [key in CropType]: {
        label: string;
        severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
        icon: string;
      };
    } = {
      [CropType.SOY]: {
        label: 'Soja',
        severity: 'success',
        icon: 'pi pi-circle-fill'
      },
      [CropType.CORN]: {
        label: 'Milho',
        severity: 'warning',
        icon: 'pi pi-circle-fill'
      },
      [CropType.COTTON]: {
        label: 'Algodão',
        severity: 'info',
        icon: 'pi pi-circle-fill'
      }
    };

    return configs[this.cropType] || configs[CropType.SOY];
  }
}
