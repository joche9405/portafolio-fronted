import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- INTERFACES PARA EL PERFIL ---
export interface Education {
  titulo: string;
  institucion: string;
  descripcion: string;
  fechaInicio: string; 
  fechaFin: string;
}

export interface Experience {
  empresa: string;
  cargo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface ProfileDTO {
  id?: string;
  profileId?: string;
  tipoPerfil: string;
  nombre: string;
  apellidos: string;
  fotoUrl: string;
  direccion: string;
  resumen: string;
  skills: string[];
  educacion: Education[];
  experiencia: Experience[];
}

// --- INTERFAZ PROYECTO (CORREGIDA) ---
export interface Project {
  id?: string;
  nombre: string;
  descripcion: string;
  url?: string;
  profileId: string;
}

export interface VisitorDTO { 
  name: string; 
  email?: string; 
}

@Injectable({
  providedIn: 'root',
})
export class Backend {

  
  private baseUrl = 'https://portafoliohojadevida.onrender.com';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ================================
  // 🔐 ADMIN
  // ================================

  loginAdmin(username: string, password: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/admin/login`, 
      { username, password }, 
      { responseType: 'text' }
    );
  }

  changeAdminPassword(oldPassword: string, newPassword: string): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/admin/change-password`,
      null,
      {
        params: { oldPassword, newPassword },
        headers: this.getAuthHeaders(),
        responseType: 'text'
      }
    );
  }

  // ================================
  // 👤 PERFILES
  // ================================

  getProfile(tipo: string): Observable<ProfileDTO> {
    return this.http.get<ProfileDTO>(`${this.baseUrl}/profiles/${tipo}`);
  }

  getAllProfiles(): Observable<ProfileDTO[]> {
    return this.http.get<ProfileDTO[]>(`${this.baseUrl}/profiles`);
  }

  saveProfile(profile: ProfileDTO): Observable<ProfileDTO> {
    return this.http.post<ProfileDTO>(`${this.baseUrl}/profiles`, profile, {
      headers: this.getAuthHeaders()
    });
  }

  // ================================
  // 📂 PROYECTOS 
  // ================================

  getProjects(profileId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/${profileId}`);
  }

  saveProject(project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.baseUrl}/projects`, project, {
      headers: this.getAuthHeaders()
    });
  }

  // ================================
  // 👁️ VISITANTES
  // ================================

  saveVisitor(visitor: VisitorDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/visitors`, visitor);
  }

  countVisitors(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/visitors/count`);
  }

  deleteProject(id: string): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/projects/${id}`, {
    headers: this.getAuthHeaders()
  });
}

updateProject(id: string, project: Project): Observable<Project> {
  return this.http.put<Project>(`${this.baseUrl}/projects/${id}`, project, {
    headers: this.getAuthHeaders()
  });
}
}