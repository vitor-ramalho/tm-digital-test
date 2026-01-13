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
import { ToolbarModule } from 'primeng/toolbar';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

// Services & Models
import { LeadsService } from '../../services/leads.service';
import { Lead, LeadStatus } from '../../../../core/models/lead.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-leads-list-page',
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
    ToolbarModule,
    BadgeModule,
    TooltipModule,
    StatusBadgeComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './leads-list-page.component.html',
  styleUrl: './leads-list-page.component.scss'
})
export class LeadsListPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  leads: Lead[] = [];
  loading = false;
  searchTerm = '';
  first = 0; // Pagination state for PrimeNG Table

  // Filter options
  statusOptions = [
    { label: 'Todos os Status', value: null },
    { label: 'Novo', value: LeadStatus.NEW },
    { label: 'Contato Inicial', value: LeadStatus.INITIAL_CONTACT },
    { label: 'Negociação', value: LeadStatus.NEGOTIATION },
    { label: 'Convertido', value: LeadStatus.CONVERTED },
    { label: 'Perdido', value: LeadStatus.LOST }
  ];

  selectedStatus: LeadStatus | null = null;

  constructor(
    private leadsService: LeadsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLeads();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLeads(): void {
    this.loading = true;

    const filters: any = {};
    if (this.selectedStatus) {
      filters.status = this.selectedStatus;
    }

    this.leadsService.getLeads(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (leads) => {
          this.leads = leads;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading leads:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar leads'
          });
          this.loading = false;
        }
      });
  }

  onFilterChange(): void {
    this.loadLeads();
  }

  clearFilters(): void {
    this.selectedStatus = null;
    this.searchTerm = '';
    this.loadLeads();
  }

  createLead(): void {
    this.router.navigate(['/leads/new']);
  }

  viewLead(lead: Lead): void {
    this.router.navigate(['/leads', lead.id]);
  }

  editLead(lead: Lead): void {
    this.router.navigate(['/leads', lead.id, 'edit']);
  }

  deleteLead(lead: Lead): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o lead <strong>${lead.name}</strong>?<br><br>Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.loading = true;
        this.leadsService.deleteLead(lead.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Lead excluído com sucesso'
              });
              this.loadLeads();
            },
            error: (error) => {
              console.error('Error deleting lead:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir lead'
              });
              this.loading = false;
            }
          });
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatCPF(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
