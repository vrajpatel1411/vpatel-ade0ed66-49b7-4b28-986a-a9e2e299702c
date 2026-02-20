import { Injectable, inject } from '@angular/core';
import { HttpClient }         from '@angular/common/http';
import { BehaviorSubject }    from 'rxjs';
import { tap }                from 'rxjs/operators';
import { environment }        from '../../../environments/environment';

export interface CreateUserPayload {
  name:           string;
  email:          string;
  password:       string;
  role:           string;
  organizationId: number;
  teamId?:        number;
}

export interface AppUser {
  id:             number;
  name:           string;
  email:          string;
  role:           string;
  organizationId: number;
  teamId?:        number;
  createdAt:      string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/auth/register`;

  private _users$   = new BehaviorSubject<AppUser[]>([]);
  private _loading$ = new BehaviorSubject<boolean>(false);

  users$   = this._users$.asObservable();
  loading$ = this._loading$.asObservable();

  createUser(payload: CreateUserPayload) {
    return this.http.post<any>(this.api, payload).pipe(
      tap(res => {
        if (res.user) {
          this._users$.next([...this._users$.getValue(), res.user]);
        }
      }),
    );
  }
}