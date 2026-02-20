import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuditLogService } from '../../core/services/audit.service';

@Component({
  selector:   'app-audit-log',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <mat-toolbar class="!bg-white border-b border-gray-200 shadow-sm
                          sticky top-0 z-50 !px-4 md:!px-8">
        <button mat-icon-button routerLink="/dashboard" class="mr-2">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <mat-icon class="text-orange-500 mr-2">history</mat-icon>
        <span class="font-bold text-gray-900">Audit Log</span>
      </mat-toolbar>

      <main class="max-w-6xl mx-auto px-4 md:px-8 py-6">
        @if (loading$ | async) {
          <mat-progress-bar mode="indeterminate" class="mb-4"/>
        }
        <div class="bg-white rounded-xl border border-gray-200
                    shadow-sm overflow-hidden">
          <table mat-table [dataSource]="(logs$ | async) ?? []"
                 class="w-full">
            <ng-container matColumnDef="timestamp">
              <th mat-header-cell *matHeaderCellDef
                  class="!bg-gray-50 !font-semibold !text-gray-600">
                Time
              </th>
              <td mat-cell *matCellDef="let log"
                  class="text-gray-500 text-sm whitespace-nowrap">
                {{ log.timestamp | date:'medium' }}
              </td>
            </ng-container>
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef
                  class="!bg-gray-50 !font-semibold !text-gray-600">
                User
              </th>
              <td mat-cell *matCellDef="let log">
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ log.userEmail }}
                  </p>
                  <span [class]="roleBadge(log.userRole)">
                    {{ log.userRole }}
                  </span>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef
                  class="!bg-gray-50 !font-semibold !text-gray-600">
                Action
              </th>
              <td mat-cell *matCellDef="let log">
                <span [class]="actionBadge(log.action)">
                  {{ log.action }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="resource">
              <th mat-header-cell *matHeaderCellDef
                  class="!bg-gray-50 !font-semibold !text-gray-600">
                Resource
              </th>
              <td mat-cell *matCellDef="let log"
                  class="text-gray-500 text-sm">
                {{ log.resourceId ? 'Task #' + log.resourceId : '—' }}
              </td>
            </ng-container>
            <ng-container matColumnDef="detail">
              <th mat-header-cell *matHeaderCellDef
                  class="!bg-gray-50 !font-semibold !text-gray-600">
                Detail
              </th>
              <td mat-cell *matCellDef="let log"
                  class="text-gray-500 text-sm">
                {{ log.detail || '—' }}
              </td>
            </ng-container>
            <tr mat-header-row
                *matHeaderRowDef="displayedColumns"
                class="!bg-gray-50"></tr>
            <tr mat-row
                *matRowDef="let row; columns: displayedColumns;"
                class="hover:bg-gray-50 transition-colors"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length"
                  class="py-16 text-center text-gray-400">
                No audit logs found
              </td>
            </tr>

          </table>
        </div>
      </main>
    </div>
  `,
})
export class AuditLogComponent implements OnInit {
  displayedColumns = ['timestamp', 'user', 'action', 'resource', 'detail'];
  private auditService=inject(AuditLogService);
  logs$    = this.auditService.logs$;
  loading$ = this.auditService.loading$;

  ngOnInit() {
    this.auditService.loadLogs().subscribe();
  }

  actionBadge(action: string): string {
    const base = 'px-2 py-0.5 rounded-full text-xs font-bold';
    if (action.includes('DELETE'))
      return `${base} bg-red-100 text-red-700`;
    if (action.includes('CREATE'))
      return `${base} bg-green-100 text-green-700`;
    if (action.includes('UPDATE'))
      return `${base} bg-yellow-100 text-yellow-700`;
    return `${base} bg-gray-100 text-gray-600`;
  }

  roleBadge(role: string): string {
    const base = 'px-2 py-0.5 rounded-full text-xs font-semibold';
    if (role === 'owner') return `${base} bg-yellow-100 text-yellow-700`;
    if (role === 'admin') return `${base} bg-blue-100 text-blue-700`;
    return `${base} bg-gray-100 text-gray-500`;
  }
}