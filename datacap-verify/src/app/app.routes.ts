import { Routes } from '@angular/router';
import { VerifyPageComponent } from './features/verify/verify-page.component';

export const routes: Routes = [
  { path: 'verify', component: VerifyPageComponent },
  { path: '', redirectTo: 'verify', pathMatch: 'full' },
  { path: '**', redirectTo: 'verify' },
];
