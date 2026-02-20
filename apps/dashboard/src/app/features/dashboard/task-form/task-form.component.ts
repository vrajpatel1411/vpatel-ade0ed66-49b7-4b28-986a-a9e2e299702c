
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule,
         Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef,
         MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { TaskService } from '../../../core/services/task.service';
import {AuthService} from '../../../core/services/auth.services';
import {
  OrganizationsService
} from '../../../core/services/organizations.service';
import { Task, TaskStatus } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

export interface TaskFormData { task?: Task; }

interface OrgUser {
  id:    number;
  name:  string;
  email: string;
  role:  string;
}

@Component({
  selector:   'app-task-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule,
    MatProgressSpinnerModule, MatDividerModule,
  ],
  template: `
    <div class="w-full max-w-md">
      <div class="flex items-center justify-between p-6
                  border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center"
               [class]="isEditing ? 'bg-amber-100' : 'bg-blue-100'">
            <mat-icon [class]="isEditing ? 'text-amber-600' : 'text-blue-600'">
              {{ isEditing ? 'edit' : 'add_task' }}
            </mat-icon>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              {{ isEditing ? 'Edit Task' : 'Create Task' }}
            </h2>
            <p class="text-xs text-gray-500">
              {{ isEditing ? 'Update task details' : 'Add a new task' }}
            </p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon class="text-gray-400">close</mat-icon>
        </button>
      </div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Task Title</mat-label>
          <input matInput formControlName="title"
                 placeholder="Enter task title..."/>
          @if (form.get('title')?.hasError('required') &&
               form.get('title')?.touched) {
            <mat-error>Title is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description"
                    placeholder="Optional description..."
                    rows="3"></textarea>
        </mat-form-field>
        <mat-divider/>
         <mat-form-field appearance="outline" class="w-full">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option [value]="TaskStatus.TODO">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-gray-400
                             inline-block"></span>
                To Do
              </div>
            </mat-option>
            <mat-option [value]="TaskStatus.IN_PROGRESS">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-400
                             inline-block"></span>
                In Progress
              </div>
            </mat-option>
            <mat-option [value]="TaskStatus.DONE">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-green-400
                             inline-block"></span>
                Done
              </div>
            </mat-option>
          </mat-select>
          <mat-icon matPrefix class="mr-2 text-gray-400">
            flag
          </mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Assign To</mat-label>
          <mat-select formControlName="assignedToId">

            <!-- Self option always first -->
            <mat-option [value]="currentUser()?.id">
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 bg-blue-100 rounded-full flex items-center
                            justify-center flex-shrink-0">
                  <span class="text-blue-700 text-xs font-bold">
                    {{ currentUser()?.email?.[0]?.toUpperCase() }}
                  </span>
                </div>
                <span>{{ currentUser()?.name || currentUser()?.email }}</span>
                <span class="text-gray-400 text-xs ml-1">(you)</span>
              </div>
            </mat-option>
            @for (user of orgUsers(); track user.id) {
              @if (user.id !== currentUser()?.id) {
                <mat-option [value]="user.id">
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 bg-gray-100 rounded-full flex
                                items-center justify-center flex-shrink-0">
                      <span class="text-gray-600 text-xs font-bold">
                        {{ user.email[0].toUpperCase() }}
                      </span>
                    </div>
                    <span>{{ user.name || user.email }}</span>
                    <span class="text-xs ml-auto"
                          [class]="rolePill(user.role)">
                      {{ user.role }}
                    </span>
                  </div>
                </mat-option>
              }
            }
          </mat-select>
          <mat-icon matPrefix class="mr-2 text-gray-400">
            person_pin
          </mat-icon>
          @if (usersLoading()) {
            <mat-hint>Loading team members...</mat-hint>
          }
        </mat-form-field>
        @if (error()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-3
                      flex items-center gap-2 text-red-700 text-sm">
            <mat-icon class="!text-base">error_outline</mat-icon>
            {{ error() }}
          </div>
        }
        <div class="flex gap-3 justify-end pt-2">
          <button mat-stroked-button type="button"
                  mat-dialog-close [disabled]="loading()">
            Cancel
          </button>
          <button mat-flat-button color="primary" type="submit"
                  [disabled]="form.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="18" class="mr-2"/>
            }
            {{ isEditing ? 'Save Changes' : 'Create Task' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class TaskFormComponent implements OnInit {
  private fb           = inject(FormBuilder);
  private taskService  = inject(TaskService);
  private authService  = inject(AuthService);
  private orgsService  = inject(OrganizationsService);
  private dialogRef    = inject(MatDialogRef<TaskFormComponent>);
  private data= inject(MAT_DIALOG_DATA)
  TaskStatus= TaskStatus
  constructor() {
    this.isEditing = !!this.data?.task;
    this.form = this.fb.group({
      title:        [this.data?.task?.title       ?? '', Validators.required],
      description:  [this.data?.task?.description ?? ''],
      status:       [this.data?.task?.status      ?? TaskStatus.TODO],
      assignedToId: [
        this.data?.task?.assignedToId ?? this.authService.currentUser()?.id
      ],
    
    });
  }

  form:         ReturnType<FormBuilder['group']>;
  isEditing:    boolean;
  loading     = signal(false);
  error       = signal<string | null>(null);
  orgUsers    = signal<OrgUser[]>([]);
  usersLoading = signal(false);
  currentUser = this.authService.currentUser;

  ngOnInit() {
    this.loadOrgUsers();
  }

  private loadOrgUsers() {
    const user = this.authService.currentUser();
    if (!user?.organizationId) return;

    this.usersLoading.set(true);
    this.orgsService.getOne(user.organizationId).subscribe({
      next: org => {
        this.orgUsers.set(org.users ?? []);
        this.usersLoading.set(false);
      },
      error: () => this.usersLoading.set(false),
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const dto = this.form.value;
    console.log(dto);
    const action$ = this.isEditing
      ? this.taskService.updateTask(this.data.task.id, dto)
      : this.taskService.createTask(dto);

    action$.subscribe({
      next:  () => {
        this.loading.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Something went wrong');
      },
    });
  }

  rolePill(role: string): string {
    if (role === 'owner') return 'text-yellow-600';
    if (role === 'admin') return 'text-blue-600';
    return 'text-gray-500';
  }
}