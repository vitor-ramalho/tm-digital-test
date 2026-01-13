import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';

// Services & Models
import { RuralPropertiesService } from '../../services/rural-properties.service';
import { LeadsService } from '../../../leads/services/leads.service';
import { RuralProperty, CropType } from '../../../../core/models/rural-property.model';
import { Lead } from '../../../../core/models/lead.model';
import { PriorityIndicatorComponent } from '../../../../shared/components/priority-indicator/priority-indicator.component';

@Component({
  selector: 'app-property-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    DropdownModule,
    ToastModule,
    PriorityIndicatorComponent
  ],
  providers: [MessageService],
  templateUrl: './property-form-page.component.html',
  styleUrl: './property-form-page.component.scss'
})
export class PropertyFormPageComponent implements OnInit {
  propertyForm!: FormGroup;
  loading = false;
  isEditMode = false;
  propertyId: string | null = null;
  leads: Lead[] = [];

  cropOptions = [
    { label: 'Soja', value: CropType.SOY },
    { label: 'Milho', value: CropType.CORN },
    { label: 'Algodão', value: CropType.COTTON }
  ];

  constructor(
    private fb: FormBuilder,
    private propertiesService: RuralPropertiesService,
    private leadsService: LeadsService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLeads();
    this.checkEditMode();
  }

  private initForm(): void {
    this.propertyForm = this.fb.group({
      leadId: ['', [Validators.required]],
      cropType: [CropType.SOY, [Validators.required]],
      areaHectares: [0, [Validators.required, Validators.min(0.01)]],
      geometry: ['']
    });
  }

  private loadLeads(): void {
    this.leadsService.getLeads().subscribe({
      next: (leads) => {
        this.leads = leads.map(lead => ({
          ...lead,
          displayLabel: `${lead.name} - ${lead.municipality}`
        }));
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar a lista de leads'
        });
      }
    });
  }

  private checkEditMode(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    if (this.propertyId) {
      this.isEditMode = true;
      this.loadProperty(this.propertyId);
    }
  }

  private loadProperty(id: string): void {
    this.loading = true;
    this.propertiesService.getProperty(id).subscribe({
      next: (property) => {
        this.propertyForm.patchValue({
          leadId: property.leadId,
          cropType: property.cropType,
          areaHectares: property.areaHectares,
          geometry: property.geometry || ''
        });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os dados da propriedade'
        });
        this.loading = false;
        this.router.navigate(['/rural-properties']);
      }
    });
  }

  onSubmit(): void {
    if (this.propertyForm.valid) {
      this.loading = true;
      const formData = this.propertyForm.value;

      const operation = this.isEditMode
        ? this.propertiesService.updateProperty(this.propertyId!, formData)
        : this.propertiesService.createProperty(formData);

      operation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: this.isEditMode
              ? 'Propriedade atualizada com sucesso'
              : 'Propriedade criada com sucesso'
          });
          setTimeout(() => {
            this.router.navigate(['/rural-properties']);
          }, 1000);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: this.isEditMode
              ? 'Não foi possível atualizar a propriedade'
              : 'Não foi possível criar a propriedade'
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.propertyForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha todos os campos obrigatórios'
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/rural-properties']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.propertyForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.propertyForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (field?.hasError('min')) {
      return 'A área deve ser maior que zero';
    }
    return '';
  }

  get currentAreaHectares(): number {
    return this.propertyForm.get('areaHectares')?.value || 0;
  }

  get isPriorityProperty(): boolean {
    return this.currentAreaHectares > 100;
  }
}
