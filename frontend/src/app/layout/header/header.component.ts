import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    BadgeModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  menuItems: MenuItem[] = [];

  constructor(private router: Router) {
    this.initializeMenu();
  }

  private initializeMenu(): void {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-line',
        routerLink: '/dashboard',
        command: () => this.router.navigate(['/dashboard'])
      },
      {
        label: 'Leads',
        icon: 'pi pi-users',
        items: [
          {
            label: 'Todos os Leads',
            icon: 'pi pi-list',
            routerLink: '/leads',
            command: () => this.router.navigate(['/leads'])
          },
          {
            label: 'Novo Lead',
            icon: 'pi pi-plus-circle',
            routerLink: '/leads/new',
            command: () => this.router.navigate(['/leads/new'])
          },
          {
            separator: true
          },
          {
            label: 'Leads Prioritários',
            icon: 'pi pi-star',
            routerLink: '/leads',
            queryParams: { priority: 'true' },
            command: () => this.router.navigate(['/leads'], { queryParams: { priority: 'true' } })
          }
        ]
      },
      {
        label: 'Propriedades Rurais',
        icon: 'pi pi-map',
        items: [
          {
            label: 'Todas as Propriedades',
            icon: 'pi pi-list',
            routerLink: '/properties',
            command: () => this.router.navigate(['/properties'])
          },
          {
            label: 'Nova Propriedade',
            icon: 'pi pi-plus-circle',
            routerLink: '/properties/new',
            command: () => this.router.navigate(['/properties/new'])
          }
        ]
      }
    ];
  }
}
