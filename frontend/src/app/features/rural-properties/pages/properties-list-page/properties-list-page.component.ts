import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

// Services & Models
import { RuralPropertiesService } from '../../services/rural-properties.service';
import { RuralProperty, CropType } from '../../../../core/models/rural-property.model';
import { CropBadgeComponent } from '../../../../shared/components/crop-badge/crop-badge.component';
import { PriorityIndicatorComponent } from '../../../../shared/components/priority-indicator/priority-indicator.component';

@Component({
  selector: 'app-properties-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    TooltipModule,
    CropBadgeComponent,
    PriorityIndicatorComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './properties-list-page.component.html',
  styleUrl: './properties-list-page.component.scss'
})
export class PropertiesListPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  properties: RuralProperty[] = [];
  loading = false;
  first = 0;

  // Filter options
  cropOptions = [
    { label: 'Todas as Culturas', value: null },
    { label: 'Soja', value: CropType.SOY },
    { label: 'Milho', value: CropType.CORN },
    { label: 'Algodão', value: CropType.COTTON }
  ];

  selectedCrop: CropType | null = null;
  showOnlyPriority = false;

  constructor(
    private propertiesService: RuralPropertiesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProperties(): void {
    this.loading = true;
    const filters = this.selectedCrop ? { cropType: this.selectedCrop } : undefined;

    this.propertiesService.getProperties(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (properties) => {
          this.properties = this.showOnlyPriority
            ? properties.filter(p => p.areaHectares > 100)
            : properties;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar as propriedades'
          });
          this.loading = false;
        }
      });
  }

  onFilterChange(): void {
    this.loadProperties();
  }

  clearFilters(): void {
    this.selectedCrop = null;
    this.showOnlyPriority = false;
    this.loadProperties();
  }

  createProperty(): void {
    this.router.navigate(['/rural-properties/new']);
  }

  viewProperty(id: string): void {
    this.router.navigate(['/rural-properties', id]);
  }

  editProperty(id: string): void {
    this.router.navigate(['/rural-properties/edit', id]);
  }

  deleteProperty(property: RuralProperty): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir esta propriedade de <strong>${property.areaHectares} hectares</strong>?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.propertiesService.deleteProperty(property.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Propriedade excluída com sucesso'
              });
              this.loadProperties();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Não foi possível excluir a propriedade'
              });
            }
          });
      }
    });
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  isPriority(areaHectares: number): boolean {
    return areaHectares > 100;
  }
}
