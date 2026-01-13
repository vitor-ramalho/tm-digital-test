import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

// Services & Models
import { DashboardService } from '../../services/dashboard.service';
import {
  DashboardStatistics,
  LeadsByStatus,
  LeadsByMunicipality,
  PriorityLead
} from '../../../../core/models/dashboard.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ChartModule,
    TableModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    StatusBadgeComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent implements OnInit {
  loading = true;
  statistics: DashboardStatistics | null = null;
  priorityLeads: PriorityLead[] = [];

  // Chart data
  statusChartData: any;
  statusChartOptions: any;
  municipalityChartData: any;
  municipalityChartOptions: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupChartOptions();
  }

  private loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      statistics: this.dashboardService.getStatistics(),
      leadsByStatus: this.dashboardService.getLeadsByStatus(),
      leadsByMunicipality: this.dashboardService.getLeadsByMunicipality(),
      priorityLeads: this.dashboardService.getPriorityLeads()
    }).subscribe({
      next: (data) => {
        this.statistics = data.statistics;
        this.priorityLeads = data.priorityLeads;
        this.setupStatusChart(data.leadsByStatus);
        this.setupMunicipalityChart(data.leadsByMunicipality);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private setupStatusChart(data: LeadsByStatus[]): void {
    const statusLabels: { [key: string]: string } = {
      'NEW': 'Novo',
      'INITIAL_CONTACT': 'Contato Inicial',
      'NEGOTIATION': 'Negociação',
      'CONVERTED': 'Convertido',
      'LOST': 'Perdido'
    };

    const statusColors: { [key: string]: string } = {
      'NEW': '#22c55e',
      'INITIAL_CONTACT': '#3b82f6',
      'NEGOTIATION': '#f59e0b',
      'CONVERTED': '#10b981',
      'LOST': '#ef4444'
    };

    this.statusChartData = {
      labels: data.map(item => statusLabels[item.status] || item.status),
      datasets: [
        {
          data: data.map(item => item.count),
          backgroundColor: data.map(item => statusColors[item.status] || '#6366f1'),
          hoverBackgroundColor: data.map(item => statusColors[item.status] || '#6366f1')
        }
      ]
    };
  }

  private setupMunicipalityChart(data: LeadsByMunicipality[]): void {
    // Show top 10 municipalities
    const topMunicipalities = data.slice(0, 10);

    this.municipalityChartData = {
      labels: topMunicipalities.map(item => item.municipality),
      datasets: [
        {
          label: 'Leads',
          data: topMunicipalities.map(item => item.count),
          backgroundColor: '#6366f1',
          borderColor: '#4f46e5',
          borderWidth: 1
        }
      ]
    };
  }

  private setupChartOptions(): void {
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#495057';
    const surfaceBorder = getComputedStyle(document.documentElement).getPropertyValue('--surface-border') || '#dfe7ef';

    this.statusChartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
            usePointStyle: true
          },
          position: 'bottom'
        }
      }
    };

    this.municipalityChartOptions = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColor
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'NEW': 'Novo',
      'INITIAL_CONTACT': 'Contato Inicial',
      'NEGOTIATION': 'Negociação',
      'CONVERTED': 'Convertido',
      'LOST': 'Perdido'
    };
    return labels[status] || status;
  }
}
