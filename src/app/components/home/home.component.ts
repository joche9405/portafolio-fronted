import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Backend } from '../../services/backend';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  visitorCount: number = 0;

  constructor(private backend: Backend, private router: Router) {}

  ngOnInit() {
    this.backend.countVisitors().subscribe({
      next: count => this.visitorCount = count,
      error: err => console.error('Error al contar visitantes', err)
    });
  }

  irAlPerfil(tipo: string) {
    this.router.navigate(['/perfil', tipo]);
  }
}