import { Routes } from '@angular/router';

export const RURAL_PROPERTIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/properties-list-page/properties-list-page.component')
        .then(m => m.PropertiesListPageComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/property-form-page/property-form-page.component')
        .then(m => m.PropertyFormPageComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/property-detail-page/property-detail-page.component')
        .then(m => m.PropertyDetailPageComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/property-form-page/property-form-page.component')
        .then(m => m.PropertyFormPageComponent)
  }
];
