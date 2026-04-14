import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProfileDetailsComponent } from './components/profile-detail/profiledetail.component';
import { LoginComponent} from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: HomeComponent }, 
  { path: 'perfil/:tipo', component: ProfileDetailsComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [authGuard] 
  },
  { path: '**', redirectTo: '' }
];