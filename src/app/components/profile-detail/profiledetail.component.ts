import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Backend, ProfileDTO, Project } from '../../services/backend'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.css']
})
export class ProfileDetailsComponent implements OnInit {

  profile?: ProfileDTO;
  projects: Project[] = [];
 nombre: string = '';
  correo: string = '';
  mensaje: string = '';

  loading: boolean = false;
  successMessage: string = '';
  constructor(
    private route: ActivatedRoute,
    private backend: Backend,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const tipo = this.route.snapshot.paramMap.get('tipo');
    if (!tipo) return;

    this.backend.getProfile(tipo).pipe(

      switchMap((profile) => {
        console.log("PERFIL:", profile);

        this.profile = profile;

        this.cd.detectChanges();

        if (profile?.id) {
          return this.backend.getProjects(profile.id);
        }

        return of([]);
      })

    ).subscribe({
      next: (projects: Project[]) => {
        console.log("PROYECTOS:", projects);

        this.projects = projects;

        this.cd.detectChanges();
      },
      error: (err) => console.error("ERROR:", err)
    });
  }

    enviarMensaje() {

    if (!this.nombre || !this.correo) {
      alert("Nombre y correo son obligatorios");
      return;
    }

    const visitor = {
      nombre: this.nombre,
      correo: this.correo,
      mensaje: this.mensaje
    };

    this.loading = true;

    this.backend.saveVisitor(visitor).subscribe({
      next: () => {
        this.successMessage = "Mensaje enviado correctamente";

        
        this.nombre = '';
        this.correo = '';
        this.mensaje = '';

        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error("Error enviando mensaje:", err);
        this.loading = false;
      }
    });
  }
}