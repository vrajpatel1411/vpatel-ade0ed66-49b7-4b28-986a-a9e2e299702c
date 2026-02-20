import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.services';
import { TaskService } from '../../core/services/task.service';
import { TaskListComponent } from './task-list/task-list.component';
import { KanbanComponent } from './kanban/kanban.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserFormComponent } from './user-form/user-form.component';

@Component({
  selector:   'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    TaskListComponent,
    KanbanComponent,
    MatDialogModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <mat-toolbar class="!bg-white border-b border-gray-200
                          shadow-sm sticky top-0 z-50 !px-4 md:!px-8">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center
                      justify-center">
            <mat-icon class="text-white">task_alt</mat-icon>
          </div>
          <span class="font-bold text-gray-900 text-lg hidden sm:block">
            TaskFlow
          </span>
        </div>
        <span class="flex-1"></span>
        <div class="hidden md:flex items-center gap-2 mr-4">
          <span [class]="roleBadgeClass()">
            {{ currentUser()?.role | uppercase }}
          </span>
          <span class="text-gray-500 text-sm">
            {{ currentUser()?.email }}
          </span>
        </div>
        @if (canManage()) {
          <button mat-icon-button
                  matTooltip="Audit Log"
                  routerLink="/audit-log"
                  class="mr-1">
            <mat-icon class="text-gray-600">history</mat-icon>
          </button>
        }
        @if (canManage()) {
          <button mat-icon-button
                  matTooltip="Manage Users"
                  (click)="openUserDialog()"
                  class="mr-1">
            <mat-icon class="text-gray-600">manage_accounts</mat-icon>
          </button>
        }
        <button class="mx-auto mb-2" mat-icon-button [matMenuTriggerFor]="userMenu">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center
                      justify-center ">
            <span class="text-blue-700 font-bold text-lg">
              {{ currentUser()?.email?.[0]?.toUpperCase() }}
            </span>
          </div>
        </button>
        <mat-menu #userMenu="matMenu">
          <div class="px-4 py-2 border-b border-gray-100">
            <p class="font-semibold text-gray-900 text-sm">
              {{ currentUser()?.name || currentUser()?.email }}
            </p>
            <p class="text-gray-500 text-xs">{{ currentUser()?.role }}</p>
          </div>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </mat-toolbar>
      <main class="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">
            My Tasks
          </h1>
          <p class="text-gray-500 text-sm mt-1">
            Manage and track your work
          </p>
        </div>
        <mat-tab-group
          [(selectedIndex)]="activeTab"
          class="bg-white rounded-xl shadow-sm"
          animationDuration="200ms">
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="mr-2">view_list</mat-icon>
              List View
            </ng-template>
            <div class="p-4">
              <app-task-list />
            </div>
          </mat-tab>
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="mr-2">view_kanban</mat-icon>
              Kanban Board
            </ng-template>
            <div class="p-4">
              <app-kanban />
            </div>
          </mat-tab>
        </mat-tab-group>
      </main>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  activeTab    = 0;
 private authService=inject(AuthService)
  private taskService=inject(TaskService)
  currentUser  = this.authService.currentUser;
  canManage    = this.authService.canManage;
 private dialog = inject(MatDialog);

 openUserDialog() {
  this.dialog.open(UserFormComponent, {
    width:    '480px',
    maxWidth: '95vw',
  });
}

  ngOnInit() {
    this.taskService.loadTasks().subscribe();
  }

  logout() {
    this.authService.logout();
  }

  roleBadgeClass(): string {
    const role = this.currentUser()?.role;
    const base = 'px-2 py-1 rounded-full text-xs font-bold uppercase';
    if (role === 'owner')  return `${base} bg-yellow-100 text-yellow-700`;
    if (role === 'admin')  return `${base} bg-blue-100 text-blue-700`;
    return `${base} bg-gray-100 text-gray-600`;
  }
}