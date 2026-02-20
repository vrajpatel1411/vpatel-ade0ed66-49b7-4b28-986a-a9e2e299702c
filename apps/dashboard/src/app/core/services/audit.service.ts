import { inject, Injectable }      from '@angular/core';
import { HttpClient }      from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap }             from 'rxjs/operators';
import { environment }     from '../../../environments/environment';
import { AuditLog }        from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private http = inject(HttpClient)
  private api = `${environment.apiUrl}/audit-log`;
  private _logs$    = new BehaviorSubject<AuditLog[]>([]);
  private _loading$ = new BehaviorSubject<boolean>(false);
  logs$    = this._logs$.asObservable();
  loading$ = this._loading$.asObservable();

  loadLogs() {
    this._loading$.next(true);
    return this.http.get<AuditLog[]>(this.api).pipe(
      tap({
        next:  logs => {
          this._logs$.next(logs);
          this._loading$.next(false);
        },
        error: () => this._loading$.next(false),
      }),
    );
  }
}