import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Backend } from '../../services/backend';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './login.html',
  styles: './login.css'
})
export class LoginComponent {
  errorLogin: boolean = false;

  constructor(
    private backend: Backend, 
    private router: Router
  ) {}

  intentarLogin(user: string, pass: string) {
    this.errorLogin = false; 

    if (!user || !pass) return;

    this.backend.loginAdmin(user, pass).subscribe({
      next: (token: string) => {
        console.log('Login exitoso');
        localStorage.setItem('auth_token', token);
        
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.errorLogin = true;
      }
    });
  }
}