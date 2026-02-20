import { Injectable, inject } from '@angular/core';
import { HttpClient }         from '@angular/common/http';
import { environment }        from '../../../environments/environment';

export interface Organization {
  id:        number;
  name:      string;
  teams:     { id: number; name: string }[];
   users?:    OrgUser[];
  createdAt: string;
}

export interface OrgUser {
  id:    number;
  name:  string;
  email: string;
  role:  string;
}

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/organizations`;
  getAll() {
    return this.http.get<Organization[]>(this.api);
  }
  getOne(id: number) {
    return this.http.get<Organization>(`${this.api}/${id}`);
  }
}