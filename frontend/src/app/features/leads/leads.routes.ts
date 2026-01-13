import { Routes } from '@angular/router';

export const LEADS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/leads-list-page/leads-list-page.component')
        .then(m => m.LeadsListPageComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/lead-form-page/lead-form-page.component')
        .then(m => m.LeadFormPageComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/lead-detail-page/lead-detail-page.component')
        .then(m => m.LeadDetailPageComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/lead-form-page/lead-form-page.component')
        .then(m => m.LeadFormPageComponent)
  }
];
