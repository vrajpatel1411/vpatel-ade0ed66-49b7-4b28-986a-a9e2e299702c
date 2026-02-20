import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators,
         ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { UsersService } from '../../../core/services/users.service';
import {
  OrganizationsService
} from '../../../core/services/organizations.service';
import { AuthService } from '../../../core/services/auth.services';

@Component({
  selector:   'app-user-form',
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
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center
                      justify-center">
            <mat-icon class="text-indigo-600">person_add</mat-icon>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Create User</h2>
            <p class="text-xs text-gray-500">
              User will log in with these credentials
            </p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon class="text-gray-400">close</mat-icon>
        </button>
      </div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Personal Info
        </p>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="name" placeholder="Alice Owner"/>
          <mat-icon matPrefix class="mr-2 text-gray-400">badge</mat-icon>
          @if (form.get('name')?.hasError('required') &&
               form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email"
                 placeholder="alice@acme.com"/>
          <mat-icon matPrefix class="mr-2 text-gray-400">email</mat-icon>
          @if (form.get('email')?.hasError('required') &&
               form.get('email')?.touched) {
            <mat-error>Email is required</mat-error>
          }
          @if (form.get('email')?.hasError('email')) {
            <mat-error>Enter a valid email</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Temporary Password</mat-label>
          <input matInput
                 [type]="showPassword() ? 'text' : 'password'"
                 formControlName="password"
                 placeholder="Min. 8 characters"/>
          <mat-icon matPrefix class="mr-2 text-gray-400">lock</mat-icon>
          <button mat-icon-button matSuffix type="button"
                  (click)="showPassword.set(!showPassword())">
            <mat-icon class="text-gray-400">
              {{ showPassword() ? 'visibility_off' : 'visibility' }}
            </mat-icon>
          </button>
          @if (form.get('password')?.hasError('minlength')) {
            <mat-error>Minimum 8 characters</mat-error>
          }
        </mat-form-field>

        <mat-divider/>
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Organization & Role
        </p>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Team (optional)</mat-label>
          <mat-select formControlName="teamId">
            <mat-option [value]="null">No team</mat-option>
            @for (team of teams(); track team.id) {
              <mat-option [value]="team.id">{{ team.name }}</mat-option>
            }
          </mat-select>
          <mat-icon matPrefix class="mr-2 text-gray-400">group</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <!-- Owner can create any role, Admin can only create viewer -->
            @if (isOwner()) {
              <mat-option value="owner">
                <span class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-yellow-400
                               inline-block"></span>
                  Owner
                </span>
              </mat-option>
              <mat-option value="admin">
                <span class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-400
                               inline-block"></span>
                  Admin
                </span>
              </mat-option>
            }
            <mat-option value="viewer">
              <span class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-gray-400
                             inline-block"></span>
                Viewer
              </span>
            </mat-option>
          </mat-select>
          <mat-icon matPrefix class="mr-2 text-gray-400">
            admin_panel_settings
          </mat-icon>
        </mat-form-field>
        @if (createdUser()) {
          <div class="bg-green-50 border border-green-200 rounded-xl p-4
                      space-y-2">
            <p class="text-green-700 font-semibold text-sm flex items-center
                      gap-2">
              <mat-icon class="!text-base">check_circle</mat-icon>
              User created successfully!
            </p>
            <p class="text-green-600 text-xs">Share these credentials:</p>
            <div class="bg-white rounded-lg p-3 text-xs font-mono
                        space-y-1 border border-green-200">
              <p><strong>Email:</strong> {{ createdUser()?.email }}</p>
              <p><strong>Password:</strong> {{ form.get('password')?.value }}</p>
              <p><strong>Role:</strong> {{ createdUser()?.role }}</p>
            </div>
          </div>
        }
        @if (error()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-3
                      flex items-center gap-2 text-red-700 text-sm">
            <mat-icon class="!text-base">error_outline</mat-icon>
            {{ error() }}
          </div>
        }
        <div class="flex gap-3 justify-end pt-2">
          @if (!createdUser()) {
            <button mat-stroked-button type="button"
                    mat-dialog-close [disabled]="loading()">
              Cancel
            </button>
            <button mat-flat-button color="primary"
                    type="submit"
                    [disabled]="form.invalid || loading()">
              @if (loading()) {
                <mat-spinner diameter="18" class="mr-2"/>
              }
              Create User
            </button>
          } @else {
            <button mat-flat-button color="primary"
                    type="button"
                    (click)="resetForm()">
              Create Another
            </button>
            <button mat-stroked-button type="button" mat-dialog-close>
              Done
            </button>
          }
        </div>

      </form>
    </div>
  `,
})
export class UserFormComponent implements OnInit {
  private fb           = inject(FormBuilder);
  private usersService = inject(UsersService);
  private orgsService  = inject(OrganizationsService);
  private authService  = inject(AuthService);
  private dialogRef    = inject(MatDialogRef<UserFormComponent>);

  form = this.fb.group({
    name:     ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required, Validators.minLength(8)]],
    role:     ['viewer', Validators.required],
    teamId:   [null as number | null],
  });

  teams        = signal<{ id: number; name: string }[]>([]);
  loading      = signal(false);
  showPassword = signal(false);
  error        = signal<string | null>(null);
  createdUser  = signal<any>(null);
  isOwner      = this.authService.isOwner;

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user?.organizationId) {
      this.orgsService.getAll().subscribe(orgs => {
        const org = orgs.find(o => o.id === user.organizationId);
        this.teams.set(org?.teams ?? []);
      });
    }
    if (!this.isOwner()) {
      this.form.patchValue({ role: 'viewer' });
      this.form.get('role')?.disable();
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const user = this.authService.currentUser();
    const { name, email, password, role, teamId } = this.form.getRawValue();

    const payload: any = {
      name,
      email,
      password,
      role,
      organizationId: user!.organizationId, 
    };
    if (teamId) payload.teamId = teamId;

    this.usersService.createUser(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.createdUser.set(res.user ?? { email, role });
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.error.set('Email already registered.');
        } else {
          this.error.set(err.error?.message ?? 'Failed to create user.');
        }
      },
    });
  }

  resetForm() {
    this.createdUser.set(null);
    this.error.set(null);
    this.form.reset({
      password: 'password123',
      role:     this.isOwner() ? 'viewer' : 'viewer',
    });
  }
}