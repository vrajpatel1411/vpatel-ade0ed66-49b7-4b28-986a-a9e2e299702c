import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,
         FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule,
         MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar,
         MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.services';
import { TaskFormComponent } from '../task-form/task-form.component';
import { Task } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

@Component({
  selector:   'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSortModule,
  ],
  template: `
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <mat-form-field appearance="outline" class="flex-1 w-full">
          <mat-label>Search tasks</mat-label>
          <input matInput [formControl]="searchCtrl"
                 placeholder="Search by title or description..."/>
          <mat-icon matPrefix class="text-gray-400 mr-1">search</mat-icon>
          @if (searchCtrl.value) {
            <button matSuffix mat-icon-button
                    (click)="searchCtrl.setValue('')">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full sm:w-44">
          <mat-label>Status</mat-label>
          <mat-select [formControl]="statusCtrl">
            <mat-option value="All">All</mat-option>
            <mat-option value="TODO">To Do</mat-option>
            <mat-option value="IN_PROGRESS">In Progress</mat-option>
            <mat-option value="DONE">Done</mat-option>
          </mat-select>
        </mat-form-field>
        @if (canManage()) {
          <button mat-flat-button color="primary"
                  (click)="openCreateDialog()"
                  class="h-14 mb-5 mx-auto whitespace-nowrap">
            <mat-icon class="mr-1">add</mat-icon>
            New Task
          </button>
        }
      </div>
      @if (loading$ | async) {
        <mat-progress-bar mode="indeterminate" color="primary"/>
      }
      <div class="block md:hidden space-y-3">
        @for (task of filteredTasks$ | async; track task.id) {
          <div class="bg-white rounded-xl border border-gray-200 p-4
                      shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 truncate">
                  {{ task.title }}
                </h3>
                @if (task.description) {
                  <p class="text-gray-500 text-sm mt-1 line-clamp-2">
                    {{ task.description }}
                  </p>
                }
                <div class="flex items-center gap-2 mt-2">
                  <span [class]="statusClass(task.status)">
                    {{ task.status ?? 'TODO' }}
                  </span>
                  <span class="text-gray-400 text-xs">
                    {{ task.createdAt | date:'mediumDate' }}
                  </span>
                </div>
              </div>
              @if (canManage()) {
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="openEditDialog(task)">
                    <mat-icon>edit</mat-icon><span>Edit</span>
                  </button>
                  <button mat-menu-item
                          class="text-red-600"
                          (click)="deleteTask(task)">
                    <mat-icon class="text-red-500">delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              }
            </div>
          </div>
        }
      </div>
      <div class="hidden md:block overflow-hidden rounded-xl border
                  border-gray-200 shadow-sm">
        <table mat-table [dataSource]="(filteredTasks$ | async) ?? []"
               class="w-full">

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef
                class="!bg-gray-50 !text-gray-600 !font-semibold">
              Title
            </th>
            <td mat-cell *matCellDef="let task" class="!py-4">
              <div>
                <p class="font-medium text-gray-900">{{ task.title }}</p>
                @if (task.description) {
                  <p class="text-gray-500 text-sm mt-0.5 line-clamp-1">
                    {{ task.description }}
                  </p>
                }
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef
                class="!bg-gray-50 !text-gray-600 !font-semibold">
              Status
            </th>
            <td mat-cell *matCellDef="let task">
              <span [class]="statusClass(task.status)">
                {{ task.status ?? 'TODO' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="owner">
            <th mat-header-cell *matHeaderCellDef
                class="!bg-gray-50 !text-gray-600 !font-semibold">
              Owner
            </th>
            <td mat-cell *matCellDef="let task" class="text-gray-500 text-sm">
              {{ task.owner?.name || task.owner?.email || '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="assignedto">
            <th mat-header-cell *matHeaderCellDef
                class="!bg-gray-50 !text-gray-600 !font-semibold">
              Assigned To
            </th>
            <td mat-cell *matCellDef="let task" class="text-gray-500 text-sm">
              {{ task.assignedTo?.name || task.assignedTo?.email || '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef
                class="!bg-gray-50 !text-gray-600 !font-semibold">
              Created
            </th>
            <td mat-cell *matCellDef="let task" class="text-gray-500 text-sm">
              {{ task.createdAt | date:'mediumDate' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef
                class="!bg-gray-50"></th>
            <td mat-cell *matCellDef="let task">
              @if (canManage()) {
                <div class="flex gap-1 justify-end">
                  <button mat-icon-button
                          matTooltip="Edit"
                          (click)="openEditDialog(task)">
                    <mat-icon class="text-gray-500">edit</mat-icon>
                  </button>
                  <button mat-icon-button
                          matTooltip="Delete"
                          (click)="deleteTask(task)">
                    <mat-icon class="text-red-400">delete</mat-icon>
                  </button>
                </div>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"
              class="!bg-gray-50"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              class="hover:bg-gray-50 transition-colors cursor-default"></tr>

          <tr class="mat-row " *matNoDataRow>
            <td [attr.colspan]="displayedColumns.length"
                class="py-16 text-center text-gray-400">
              <mat-icon class="!text-5xl block mx-auto my-2">
                assignment
              </mat-icon>
              <p class="text-lg font-medium">No tasks found</p>
              <p class="text-sm mt-1">
                {{ searchCtrl.value
                    ? 'Try adjusting your search'
                    : 'Create your first task!' }}
              </p>
            </td>
          </tr>

        </table>
      </div>

    </div>
  `,
})
export class TaskListComponent implements OnInit {
  displayedColumns = ['title', 'status', 'owner','assignedto', 'createdAt', 'actions'];
  private taskService=inject(TaskService)
  private authService=inject(AuthService)
  private dialog=inject(MatDialog)
  private snackBar=inject(MatSnackBar)
  filteredTasks$   = this.taskService.filteredTasks$;
  loading$         = this.taskService.loading$;
  canManage        = this.authService.canManage;

  searchCtrl = new FormControl('');
  statusCtrl = new FormControl('All');

  ngOnInit() {
    this.searchCtrl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(val => this.taskService.setFilter(val ?? ''));
    this.statusCtrl.valueChanges
      .subscribe(val => this.taskService.setCategory(val ?? 'All'));
  }

  openCreateDialog() {
    this.dialog.open(TaskFormComponent, {
      width:     '480px',
      maxWidth:  '95vw',
      data:      {},
      panelClass: 'rounded-2xl',
    });
  }

  openEditDialog(task: Task) {
    this.dialog.open(TaskFormComponent, {
      width:     '480px',
      maxWidth:  '95vw',
      data:      { task },
      panelClass: 'rounded-2xl',
    });
  }

  deleteTask(task: Task) {
    if (!confirm(`Delete "${task.title}"?`)) return;

    this.taskService.deleteTask(task.id).subscribe({
      next:  () => this.snackBar.open(
        'Task deleted', 'Close', { duration: 3000 }
      ),
      error: () => this.snackBar.open(
        'Failed to delete task', 'Close', { duration: 3000 }
      ),
    });
  }

  statusClass(status?: string): string {
    const base = 'px-2 py-0.5 rounded-full text-xs font-semibold';
    if (status === 'IN_PROGRESS')
      return `${base} bg-blue-100 text-blue-700`;
    if (status === 'DONE')
      return `${base} bg-green-100 text-green-700`;
    return `${base} bg-gray-100 text-gray-600`;
  }
}