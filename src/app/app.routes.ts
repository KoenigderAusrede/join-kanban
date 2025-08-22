import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SignupComponent } from './features/signup/signup.component';
import { ContactsComponent } from './features/contacts/contacts.component';
import { SummaryComponent } from './features/summary/summary.component';
import { AddTaskComponent } from './features/add-task/add-task.component';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { LoginGuard } from './core/guards/login.guard';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { PrivacyPolicyComponent } from './features/privacy-policy/privacy-policy.component';
import { LegalNoticeComponent } from './features/legal-notice/legal-notice.component';
import { ResponsiveDemoComponent } from './features/responsive-demo/responsive-demo.component';
import { HelpComponent } from './features/help/help.component';


export const routes: Routes = [
  // Public (ohne Sidebar/Header)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
      { path: 'signup', component: SignupComponent, canActivate: [LoginGuard] },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'legal-notice', component: LegalNoticeComponent },
    ]
  },

  // Protected (mit Sidebar/Header)
  {
    path: '',
    component: AppLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'contacts', component: ContactsComponent },
      { path: 'summary', component: SummaryComponent },
      { path: 'add-task', component: AddTaskComponent },
      { path: 'responsive-demo', component: ResponsiveDemoComponent },
      { path: 'help', component: HelpComponent },
    ]
  },

  // Fallback
  { path: '**', component: NotFoundComponent }
];
