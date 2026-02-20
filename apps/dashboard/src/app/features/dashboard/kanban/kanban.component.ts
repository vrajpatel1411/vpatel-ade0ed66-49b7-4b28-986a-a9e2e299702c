import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray,
         transferArrayItem,
         DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule,
         MatDialog } from '@angular/material/dialog';
import { MatSnackBar,
         MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.services';
import { TaskFormComponent } from '../task-form/task-form.component';
import { Task, TaskStatus } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

interface KanbanColumn {
  status:  TaskStatus;
  label:   string;
  color:   string;
  bgColor: string;
  icon:    string;
  tasks:   Task[];
}

@Component({
  selector:   'app-kanban',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="flex gap-4 overflow-x-auto pb-4 min-h-96">

      @for (col of columns; track col.status) {
        <div class="flex-shrink-0 w-72 md:w-80 flex flex-col">

          <!-- Column header -->
          <div class="flex items-center gap-2 mb-3 px-1">
            <div [class]="'w-3 h-3 rounded-full ' + col.bgColor"></div>
            <span class="font-semibold text-gray-700 text-sm uppercase
                         tracking-wide">
              {{ col.label }}
            </span>
            <span class="ml-auto bg-gray-200 text-gray-600 text-xs
                         font-bold rounded-full w-6 h-6 flex items-center
                         justify-center">
              {{ col.tasks.length }}
            </span>
          </div>
          <div
            cdkDropList
            [id]="col.status"
            [cdkDropListData]="col.tasks"
            [cdkDropListConnectedTo]="connectedLists"
            (cdkDropListDropped)="onDrop($event)"
            class="flex-1 rounded-xl p-3 space-y-3 min-h-32 transition-colors"
            [class]="'bg-' + col.color + '-50 border-2 border-dashed border-' + col.color + '-200'">
            @for (task of col.tasks; track task.id) {
              <div
                cdkDrag
                [cdkDragData]="task"
                class="bg-white rounded-xl border border-gray-200 p-4
                       shadow-sm cursor-grab active:cursor-grabbing
                       hover:shadow-md transition-all group">
                <div class="flex items-start gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 text-sm leading-snug">
                      {{ task.title }}
                    </p>
                    @if (task.description) {
                      <p class="text-gray-500 text-xs mt-1 line-clamp-2">
                        {{ task.description }}
                      </p>
                    }
                  </div>
                  @if (canManage()) {
                    <button mat-icon-button
                            [matMenuTriggerFor]="cardMenu"
                            class="!w-7 !h-7 opacity-0 group-hover:opacity-100
                                   transition-opacity -mt-1 -mr-2 flex-shrink-0"
                            (click)="$event.stopPropagation()">
                      <mat-icon class="!text-base text-gray-400">
                        more_horiz
                      </mat-icon>
                    </button>
                    <mat-menu #cardMenu="matMenu">
                      <button mat-menu-item (click)="openEditDialog(task)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button mat-menu-item (click)="deleteTask(task)">
                        <mat-icon class="text-red-500">delete</mat-icon>
                        <span class="text-red-600">Delete</span>
                      </button>
                    </mat-menu>
                  }
                </div>
                <div class="flex items-center gap-2 mt-3 pt-3
                            border-t border-gray-100">
                  <div class="w-5 h-5 bg-blue-100 rounded-full flex
                              items-center justify-center flex-shrink-0">
                    <span class="text-blue-700 text-xs font-bold">
                      {{ task.owner?.email?.[0]?.toUpperCase() ?? '?' }}
                    </span>
                  </div>
                  <span class="text-gray-400 text-xs truncate">
                    {{ task.owner?.name || task.owner?.email || 'Unknown' }}
                  </span>
                  <span class="text-gray-300 text-xs ml-auto flex-shrink-0">
                    {{ task.createdAt | date:'MMM d' }}
                  </span>
                </div>
                <div *cdkDragPlaceholder
                     class="bg-blue-100 rounded-xl border-2 border-blue-300
                            border-dashed h-24 opacity-60"></div>
              </div>
            }
            @if (col.tasks.length === 0) {
              <div class="flex flex-col items-center justify-center
                          py-8 text-gray-400">
                <mat-icon class="!text-3xl mb-2">drag_indicator</mat-icon>
                <p class="text-xs text-center">
                  Drop tasks here
                </p>
              </div>
            }
          </div>
         @if (col.status === 'TODO' && canManage()) {
            <button mat-stroked-button
                    (click)="openCreateDialog()"
                    class="mt-3 w-full !border-dashed !border-gray-300
                           !text-gray-500 hover:!border-blue-400
                           hover:!text-blue-600 transition-colors">
              <mat-icon>add</mat-icon>
              Add Task
            </button>
          }
        </div>
      }

    </div>
  `,
})
export class KanbanComponent implements OnInit {
 
  private taskService= inject(TaskService);
  private authService=inject(AuthService);
  private dialog=inject(MatDialog);
  private snackBar=inject(MatSnackBar);
  canManage      = this.authService.canManage;
  connectedLists = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ];

  columns: KanbanColumn[] = [
    {
      status:  TaskStatus.TODO,
      label:   'To Do',
      color:   'gray',
      bgColor: 'bg-gray-400',
      icon:    'radio_button_unchecked',
      tasks:   [],
    },
    {
      status:  TaskStatus.IN_PROGRESS,
      label:   'In Progress',
      color:   'blue',
      bgColor: 'bg-blue-400',
      icon:    'pending',
      tasks:   [],
    },
    {
      status:  TaskStatus.DONE,
      label:   'Done',
      color:   'green',
      bgColor: 'bg-green-400',
      icon:    'check_circle',
      tasks:   [],
    },
  ];

  ngOnInit() {
    this.taskService.kanbanTasks$.subscribe(grouped => {
      this.columns[0].tasks = [...grouped[TaskStatus.TODO]];
      this.columns[1].tasks = [...grouped[TaskStatus.IN_PROGRESS]];
      this.columns[2].tasks = [...grouped[TaskStatus.DONE]];
    });
  }

  onDrop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      const task      = event.container.data[event.currentIndex];
      const newStatus = event.container.id as TaskStatus;
      this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
        error: () => this.snackBar.open(
          'Failed to update status', 'Close', { duration: 3000 }
        ),
      });
    }
  }

  openCreateDialog() {
    this.dialog.open(TaskFormComponent, {
      width: '480px', maxWidth: '95vw', data: {},
    });
  }

  openEditDialog(task: Task) {
    this.dialog.open(TaskFormComponent, {
      width: '480px', maxWidth: '95vw', data: { task },
    });
  }

  deleteTask(task: Task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    this.taskService.deleteTask(task.id).subscribe({
      next:  () => this.snackBar.open('Task deleted', 'Close', { duration: 3000 }),
      error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 }),
    });
  }
}