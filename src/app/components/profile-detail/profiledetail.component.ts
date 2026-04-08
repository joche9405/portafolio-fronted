import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Backend, ProfileDTO, Project } from '../../services/backend'; 
import { CommonModule } from '@angular/common';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.css']
})
export class ProfileDetailsComponent implements OnInit {

  profile?: ProfileDTO;
  projects: Project[] = [];

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

        // 🔥 FORZAR RENDER
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

        // 🔥 FORZAR RENDER TAMBIÉN AQUÍ
        this.cd.detectChanges();
      },
      error: (err) => console.error("ERROR:", err)
    });
  }
}