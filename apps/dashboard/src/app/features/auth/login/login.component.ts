import { Component, inject, signal }      from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormBuilder, FormGroup,
         Validators,
         ReactiveFormsModule }    from '@angular/forms';
import { Router,RouterModule }                 from '@angular/router';
import { MatCardModule }          from '@angular/material/card';
import { MatInputModule }         from '@angular/material/input';
import { MatButtonModule }        from '@angular/material/button';
import { MatIconModule }          from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar,
         MatSnackBarModule }      from '@angular/material/snack-bar';
import { AuthService }            from '../../../core/services/auth.services';

@Component({
  selector:    'app-login',
  standalone:  true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800
                to-indigo-900 flex items-center justify-center p-4">
      <mat-card class="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center
                      justify-center mx-auto mb-4">
            <mat-icon class="text-white">task_alt</mat-icon>
          </div>
          <h1 class="text-2xl font-bold text-white">Task Manager</h1>
          <p class="text-blue-100 text-sm mt-1">Sign in to your account</p>
        </div>
        <mat-card-content class="p-8 m-2">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()"
                class="flex flex-col gap-5">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput type="email"
                     formControlName="email"
                     placeholder="alice@acme.com"
                     autocomplete="email"/>
              <mat-icon matPrefix class="mr-2 text-gray-400">email</mat-icon>
              @if (loginForm.get('email')?.hasError('required') &&
                   loginForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email')) {
                <mat-error>Enter a valid email</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input matInput
                     [type]="showPassword() ? 'text' : 'password'"
                     formControlName="password"
                     autocomplete="current-password"/>
              <mat-icon matPrefix class="mr-2 text-gray-400">lock</mat-icon>
              <button mat-icon-button matSuffix type="button"
                      (click)="showPassword.set(!showPassword())">
                <mat-icon class="text-gray-400">
                  {{ showPassword() ? 'visibility_off' : 'visibility' }}
                </mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') &&
                   loginForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>
            @if (errorMessage()) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-3
                          flex items-center gap-2 text-red-700 text-sm">
                <mat-icon class="!text-base">error_outline</mat-icon>
                {{ errorMessage() }}
              </div>
            }
            <button mat-flat-button color="primary"
                    type="submit"
                    [disabled]="loading() || loginForm.invalid"
                    class="w-full h-12 text-base font-semibold rounded-lg">
              @if (loading()) {
                <mat-spinner diameter="20" class="inline-block mr-2"/>
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class LoginComponent {
  loginForm:    FormGroup;
  loading       = signal(false);
  showPassword  = signal(false);
  errorMessage  = signal<string | null>(null);
  private fb=inject(FormBuilder)
  private authService=inject(AuthService)
  private router=inject(Router)
  private snackBar=inject(MatSnackBar)
  constructor(
  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Welcome back!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 401
            ? 'Invalid email or password'
            : 'Something went wrong. Please try again.'
        );
      },
    });
  }
}