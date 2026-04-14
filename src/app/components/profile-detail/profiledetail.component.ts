import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Backend, ProfileDTO, Project } from '../../services/backend';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { switchMap, of, Subscription, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.css']
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {

  profile?: ProfileDTO;
  projects: Project[] = [];
  nombre: string = '';
  correo: string = '';
  mensaje: string = '';

  loading: boolean = false;
  successMessage: string = '';

  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private backend: Backend,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const tipo = this.route.snapshot.paramMap.get('tipo');
    if (!tipo) return;

    const sub = this.backend.getProfile(tipo).pipe(
      switchMap((profile) => {
        this.profile = profile;
        this.cd.detectChanges();
        if (profile?.id) {
          return this.backend.getProjects(profile.id);
        }
        return of([]);
      })
    ).subscribe({
      next: (projects: Project[]) => {
        this.projects = projects;
        this.cd.detectChanges();
      },
      error: (err) => console.error("ERROR:", err)
    });

    this.subscription.add(sub);
  }

enviarMensaje(): void {
  if (this.loading) return;

  if (!this.nombre.trim() || !this.correo.trim() || !this.mensaje.trim()) {
    this.successMessage = 'Por favor, completa todos los campos.';
    setTimeout(() => this.successMessage = '', 3000);
    return;
  }

  const visitor = {
    nombre: this.nombre.trim(),
    correo: this.correo.trim(),
    mensaje: this.mensaje.trim()
  };

  this.loading = true;
  this.successMessage = '';

  const timeoutId = setTimeout(() => {
    if (this.loading) {
      this.loading = false;
      this.successMessage = 'El servidor no responde. Inténtalo más tarde.';
      this.cd.detectChanges();
      setTimeout(() => this.successMessage = '', 4000);
    }
  }, 10000);

  const sub = this.backend.saveVisitor(visitor).subscribe({
    next: () => {
      clearTimeout(timeoutId);
      this.successMessage = 'Mensaje enviado correctamente.';
      this.nombre = '';
      this.correo = '';
      this.mensaje = '';
      this.loading = false;
      this.cd.detectChanges();
      setTimeout(() => this.successMessage = '', 4000);
    },
    error: (err) => {
      clearTimeout(timeoutId);
      console.error('Error enviando mensaje:', err);
      this.successMessage = 'Error al enviar. Inténtalo de nuevo.';
      this.loading = false;
      this.cd.detectChanges();
      setTimeout(() => this.successMessage = '', 4000);
    }
  });

  this.subscription.add(sub);
}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}