import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Backend, ProfileDTO, Project } from '../../services/backend'; 

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {

  profile: ProfileDTO = this.setDefaultProfile('software');
  projects: Project[] = [];
  visitorCount: number = 0;
  showProjectForm: boolean = false;

  perfilesDisponibles: string[] = ['software'];
  perfilSeleccionado: string = 'software';
  editingProjectId: string | null = null;

  constructor(private backend: Backend, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarListaPerfiles();

    this.backend.countVisitors().subscribe(count => {
      this.visitorCount = count;
    });
  }

  // =========================
  // PERFILES
  // =========================

  private cargarListaPerfiles() {
  this.backend.getAllProfiles().subscribe({
    next: (perfiles) => {

      if (perfiles?.length) {
        this.perfilesDisponibles = perfiles.map(p => p.tipoPerfil);

        if (!this.perfilesDisponibles.includes(this.perfilSeleccionado)) {
          this.perfilSeleccionado = this.perfilesDisponibles[0];
        }
      }

      // 🔥 SIEMPRE cargar perfil
      this.seleccionarPerfil(this.perfilSeleccionado);
    },

    error: (err) => {
      console.error("Error cargando perfiles:", err);

      // 🔥 fallback seguro
      this.profile = this.setDefaultProfile(this.perfilSeleccionado);
      this.projects = [];
    }
  });
}

seleccionarPerfil(tipo: string) {
  this.perfilSeleccionado = tipo;

  this.backend.getProfile(tipo).subscribe({
    next: (data) => {

      if (data) {
        this.profile = { ...data };

        // 🔥 SI TIENE ID → cargar proyectos
        if (this.profile.id) {
          this.loadProjects(this.profile.id);
        } else {
          this.projects = [];
        }

      } else {
        // 🔥 SI BACKEND DEVUELVE NULL
        this.profile = this.setDefaultProfile(tipo);
        this.projects = [];
      }
    },

    error: (err) => {
      console.error("Error backend:", err);

      // 🔥 FALLBACK COMPLETO
      this.profile = this.setDefaultProfile(tipo);
      this.projects = [];
    }
  });
}
  

  private setDefaultProfile(tipo: string): ProfileDTO {
  return {
    tipoPerfil: tipo,
    nombre: '',
    apellidos: '',
    fotoUrl: '',
    direccion: '',
    resumen: '',
    skills: [],
    educacion: [],
    experiencia: []
  };
}

  crearNuevoPerfil() {
    const nombreNuevo = prompt("Nombre del nuevo perfil:")?.toLowerCase().trim();

    if (!nombreNuevo) return;

    if (this.perfilesDisponibles.includes(nombreNuevo)) {
      alert("Este perfil ya existe.");
      return;
    }

    const nuevoPerfil = this.setDefaultProfile(nombreNuevo);

    this.backend.saveProfile(nuevoPerfil!).subscribe({
      next: (perfilGuardado) => {
        this.perfilesDisponibles.push(nombreNuevo);
        this.profile = perfilGuardado;
        this.perfilSeleccionado = nombreNuevo;
        alert("Perfil creado");
      }
    });
  }

  // =========================
  // GUARDAR PERFIL
  // =========================

  updateProfile() {
    if (!this.profile) return;

    this.backend.saveProfile({ ...this.profile }).subscribe({
      next: (res) => {
        this.profile = res;
        alert("Perfil guardado correctamente");
      },
      error: () => alert("Error al guardar")
    });
  }

  // =========================
  // SKILLS
  // =========================

  addSkill(skill: string) {
    if (!skill || !this.profile) return;

    this.profile.skills.push(skill);
  }

  removeSkill(index: number) {
    this.profile?.skills.splice(index, 1);
  }

  // =========================
  // EXPERIENCIA
  // =========================

  addExperience() {
    if (!this.profile) return;

    this.profile.experiencia.push({
      cargo: '',
      empresa: '',
      fechaInicio: '',
      fechaFin: '',
      descripcion: ''
    });
  }

  removeExperience(index: number) {
    this.profile?.experiencia.splice(index, 1);
  }

  // =========================
  // EDUCACIÓN
  // =========================

  addEducation() {
    if (!this.profile) return;

    this.profile.educacion.push({
      titulo: '',
      institucion: '',
      fechaInicio: '',
      fechaFin: '',
      descripcion: ''
    });
  }

  removeEducation(index: number) {
    this.profile?.educacion.splice(index, 1);
  }

  // =========================
  // PROYECTOS
  // =========================

  loadProjects(profileId: string) {
    this.backend.getProjects(profileId).subscribe({
      next: (projects) => this.projects = projects,
      error: () => this.projects = []
    });
  }
createProject(title: string, description: string) {

  if (!this.profile?.id) {
    console.error("No hay profile o ID");
    return;
  }

  const project = {
    nombre: title,
    descripcion: description,
    url: '',
    profileId: this.profile.id
  };

  this.backend.saveProject(project).subscribe({
    next: () => {
      this.loadProjects(this.profile!.id!);
    },
    error: (err: any) => console.error(err) // 🔥 tipado corregido
  });
}

deleteProject(id: string) {
  this.backend.deleteProject(id).subscribe({
    next: () => this.loadProjects(this.profile!.id!),
    error: (err: unknown) => console.error(err)
  });
}

startEdit(proj: any) {
  this.editingProjectId = proj.id;
}
updateProject(proj: any) {
  this.backend.updateProject(proj.id, proj).subscribe({
    next: () => {
      this.editingProjectId = null;
      this.loadProjects(this.profile!.id!);
    },
    error: (err: unknown) => console.error(err)
  });
}
  // =========================
  // SEGURIDAD
  // =========================

  changeAdminPassword(oldPass: string, newPass: string) {
    this.backend.changeAdminPassword(oldPass, newPass).subscribe({
      next: () => alert('Contraseña actualizada'),
      error: () => alert('Error')
    });
  }

  loginAdmin(username: string, password: string) {
    this.backend.loginAdmin(username, password).subscribe({
      next: token => localStorage.setItem('auth_token', token)
    });
  }
  promptPasswordChange() {
  const oldP = prompt("Contraseña actual:");
  const newP = prompt("Nueva contraseña:");
  if (oldP && newP) {
    this.changeAdminPassword(oldP, newP);
  }
}

}