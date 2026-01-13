import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';

// Services & Models
import { LeadsService } from '../../services/leads.service';
import { Lead, LeadStatus } from '../../../../core/models/lead.model';

@Component({
  selector: 'app-lead-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './lead-form-page.component.html',
  styleUrl: './lead-form-page.component.scss'
})
export class LeadFormPageComponent implements OnInit {
  leadForm!: FormGroup;
  loading = false;
  isEditMode = false;
  leadId: string | null = null;

  statusOptions = [
    { label: 'Novo', value: LeadStatus.NEW },
    { label: 'Contato Inicial', value: LeadStatus.INITIAL_CONTACT },
    { label: 'Negociação', value: LeadStatus.NEGOTIATION },
    { label: 'Convertido', value: LeadStatus.CONVERTED },
    { label: 'Perdido', value: LeadStatus.LOST }
  ];

  constructor(
    private fb: FormBuilder,
    private leadsService: LeadsService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.leadForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      municipality: ['', [Validators.required]],
      status: [LeadStatus.NEW, [Validators.required]],
      comments: ['']
    });
  }

  private checkEditMode(): void {
    this.leadId = this.route.snapshot.paramMap.get('id');
    if (this.leadId) {
      this.isEditMode = true;
      this.loadLead(this.leadId);
    }
  }

  private loadLead(id: string): void {
    this.loading = true;
    this.leadsService.getLead(id).subscribe({
      next: (lead) => {
        this.leadForm.patchValue({
          name: lead.name,
          cpf: lead.cpf,
          municipality: lead.municipality,
          status: lead.status,
          comments: lead.comments || ''
        });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os dados do lead'
        });
        this.loading = false;
        this.router.navigate(['/leads']);
      }
    });
  }

  onSubmit(): void {
    if (this.leadForm.valid) {
      this.loading = true;
      const formData = this.leadForm.value;

      const operation = this.isEditMode
        ? this.leadsService.updateLead(this.leadId!, formData)
        : this.leadsService.createLead(formData);

      operation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: this.isEditMode
              ? 'Lead atualizado com sucesso'
              : 'Lead criado com sucesso'
          });
          setTimeout(() => {
            this.router.navigate(['/leads']);
          }, 1000);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: this.isEditMode
              ? 'Não foi possível atualizar o lead'
              : 'Não foi possível criar o lead'
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.leadForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha todos os campos obrigatórios'
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/leads']);
  }

  // Helper to mark all fields as touched for validation display
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Format CPF as user types
  onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.leadForm.patchValue({ cpf: value }, { emitEvent: false });
      input.value = value;
    }
  }

  // Validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.leadForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.leadForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (field?.hasError('minlength')) {
      return 'O nome deve ter pelo menos 3 caracteres';
    }
    if (field?.hasError('pattern')) {
      return 'CPF inválido. Use o formato: XXX.XXX.XXX-XX';
    }
    return '';
  }
}
