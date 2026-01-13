import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';

// Services & Models
import { LeadsService } from '../../services/leads.service';
import { Lead } from '../../../../core/models/lead.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-lead-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    DividerModule,
    StatusBadgeComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './lead-detail-page.component.html',
  styleUrl: './lead-detail-page.component.scss'
})
export class LeadDetailPageComponent implements OnInit {
  lead: Lead | null = null;
  loading = false;
  leadId: string | null = null;

  constructor(
    private leadsService: LeadsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.leadId = this.route.snapshot.paramMap.get('id');
    if (this.leadId) {
      this.loadLead(this.leadId);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'ID do lead não encontrado'
      });
      this.router.navigate(['/leads']);
    }
  }

  private loadLead(id: string): void {
    this.loading = true;
    this.leadsService.getLead(id).subscribe({
      next: (lead) => {
        this.lead = lead;
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

  onEdit(): void {
    if (this.leadId) {
      this.router.navigate(['/leads/edit', this.leadId]);
    }
  }

  onDelete(): void {
    if (!this.lead) return;

    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o lead <strong>${this.lead.name}</strong>?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (this.leadId) {
          this.leadsService.deleteLead(this.leadId).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Lead excluído com sucesso'
              });
              setTimeout(() => {
                this.router.navigate(['/leads']);
              }, 1000);
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Não foi possível excluir o lead'
              });
            }
          });
        }
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/leads']);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCPF(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
