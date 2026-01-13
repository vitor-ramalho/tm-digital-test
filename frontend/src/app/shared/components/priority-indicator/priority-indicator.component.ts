import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-priority-indicator',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './priority-indicator.component.html',
  styleUrl: './priority-indicator.component.scss'
})
export class PriorityIndicatorComponent {
  @Input() areaHectares!: number;
  @Input() showLabel = false;

  get isPriority(): boolean {
    return this.areaHectares > 100;
  }

  get priorityMessage(): string {
    return this.isPriority
      ? `Propriedade prioritária (${this.areaHectares} ha)`
      : `Área: ${this.areaHectares} ha`;
  }
}
