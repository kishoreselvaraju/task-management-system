import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../tasks.service';
import { AuthService } from '../auth.service';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
})
export class TasksComponent  implements OnInit {
  tasks: any[] = [];
  newTaskTitle = '';
  newTaskDesc = '';
  loading = false;
  newTaskCategory = 'General';
  filterCategory = 'ALL';
filteredTasks: any[] = [];

  constructor(
    private tasksService: TasksService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }
  loadTasks() {
    this.loading = true;
    this.tasksService.getTasks().subscribe({
      next: (res: any) => {
        this.tasks = res;
        this.applyFilter();   // ✅ apply filter after load
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
  applyFilter() {
    if (this.filterCategory === 'ALL') {
      this.filteredTasks = this.tasks;
    } else {
      this.filteredTasks = this.tasks.filter(
        (t) => t.category === this.filterCategory
      );
    }
  }

  canEdit(): boolean {
    const role = this.auth.getRole();
    return role === 'ADMIN' || role === 'OWNER';
  }

  addTask() {
    if (!this.newTaskTitle.trim() || !this.canEdit()) return;
    this.tasksService
      .createTask({
        title: this.newTaskTitle,
        description: this.newTaskDesc,
        category: this.newTaskCategory, 
      })
      .subscribe(() => {
        this.newTaskTitle = '';
        this.newTaskDesc = '';
        this.newTaskCategory = 'General';
        this.loadTasks();
      });
  }

  updateTask(id: string, changes: any) {
    if (!this.canEdit()) return;
    this.tasksService.updateTask(id, changes).subscribe(() => {
      this.loadTasks();
    });
  }

  deleteTask(id: string) {
    if (!this.canEdit()) return;
    this.tasksService.deleteTask(id).subscribe(() => {
      this.loadTasks();
    });
  }

  // Drag-and-drop handler
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);

    if (this.canEdit()) {
      // Save new order by updating "order" field (if exists)
      this.tasks.forEach((task, index) => {
        this.updateTask(task.id, { order: index });
      });
    }
  }
  

  // Change task status
  changeStatus(task: any, status: string) {
    if (!this.canEdit()) return;
    this.updateTask(task.id, { status });
  }
  
}
