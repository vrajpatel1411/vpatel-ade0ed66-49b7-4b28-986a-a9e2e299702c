import { inject, Injectable }              from '@angular/core';
import { HttpClient }                      from '@angular/common/http';
import { BehaviorSubject, combineLatest }  from 'rxjs';
import { tap, map }                        from 'rxjs/operators';
import { environment }                     from '../../../environments/environment';
import {
  Task, TaskStatus,
  CreateTaskRequest, UpdateTaskRequest
} from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/tasks`;

  private _tasks$    = new BehaviorSubject<Task[]>([]);
  private _loading$  = new BehaviorSubject<boolean>(false);
  private _error$    = new BehaviorSubject<string | null>(null);
  private _filter$   = new BehaviorSubject<string>('');
  private _category$ = new BehaviorSubject<string>('All');

  tasks$    = this._tasks$.asObservable();
  loading$  = this._loading$.asObservable();
  error$    = this._error$.asObservable();
  filter$   = this._filter$.asObservable();
  category$ = this._category$.asObservable();

  filteredTasks$ = combineLatest([
    this._tasks$,
    this._filter$,
    this._category$,
  ]).pipe(
    map(([tasks, filter, category]) => {
      let result = [...tasks];

      if (filter) {
        const search = filter.toLowerCase();
        result = result.filter(t =>
          t.title.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
        );
      }
      if (category && category !== 'All') {
        result = result.filter(t => t.status === category);
      }
      return result;
    })
  );

  kanbanTasks$ = this.filteredTasks$.pipe(
    map(tasks => ({
      [TaskStatus.TODO]:        tasks.filter(t => t.status === TaskStatus.TODO),
      [TaskStatus.IN_PROGRESS]: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS),
      [TaskStatus.DONE]:        tasks.filter(t => t.status === TaskStatus.DONE),
    }))
  );

  loadTasks() {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.get<Task[]>(this.api).pipe(
      tap({
        next: tasks => {
          this._tasks$.next(tasks);
          this._loading$.next(false);
        },
        error: err => {
          this._error$.next(err.message);
          this._loading$.next(false);
        },
      }),
    );
  }

  createTask(dto: CreateTaskRequest) {
    return this.http.post<Task>(this.api, dto).pipe(
      tap(task => {
        this._tasks$.next([task, ...this._tasks$.getValue()]);
      }),
    );
  }

  updateTask(id: number, dto: UpdateTaskRequest) {
    return this.http.put<Task>(`${this.api}/${id}`, dto).pipe(
      tap(updated => {
        const mapped = this._tasks$.getValue()
          .map(t => t.id === id ? updated : t);
        this._tasks$.next(mapped);
      }),
    );
  }

  updateTaskStatus(id: number, status: TaskStatus) {
    return this.http.put<Task>(`${this.api}/${id}`, { status }).pipe(
      tap(updated => {
        const mapped = this._tasks$.getValue()
          .map(t => t.id === id ? updated : t);
        this._tasks$.next(mapped);
      }),
    );
  }

  deleteTask(id: number) {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`).pipe(
      tap(() => {
        this._tasks$.next(
          this._tasks$.getValue().filter(t => t.id !== id)
        );
      }),
    );
  }

  setFilter(search: string) {
    this._filter$.next(search);
  }

  setCategory(category: string) {
    this._category$.next(category);
  }
}