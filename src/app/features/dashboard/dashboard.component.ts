import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddTaskComponent } from '../add-task/add-task.component';
import { FirestoreService } from '../../core/services/firestore.service';
import { Task } from '../../core/models/task.model';
import { Contact } from '../../core/models/contact.model';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { ViewChild } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, FormsModule, DragDropModule, AddTaskComponent, TaskDetailComponent],

})
export class DashboardComponent implements OnInit {
  @ViewChild(AddTaskComponent) addTaskComponent!: AddTaskComponent;
  tasks: { [key: string]: Task[] } = {
    todo: [],
    inProgress: [],
    awaitFeedback: [],
    done: []
  };

  
  contacts: Map<string, Contact> = new Map();
  categories = ['todo', 'inProgress', 'awaitFeedback', 'done'];
  searchQuery: string = ''
  categoryColors: any;
  selectedTask: Task | null = null;
  taskToEdit: Task | null = null
  isDragging = false;


  @HostListener('document:mouseup')
onMouseUp() {
  this.isDragging = false;
  clearInterval(this.scrollInterval);
}

  constructor(private firestoreService: FirestoreService) { }
  
  ngOnInit() {
    // 📝 Tasks laden & sortieren
    this.firestoreService.tasks$.subscribe((tasks: Task[]) => {
      this.tasks = { todo: [], inProgress: [], awaitFeedback: [], done: [] };
      tasks.forEach(task => {
        const status = task.status as keyof typeof this.tasks;
        this.tasks[status]?.push(task);
      });
    });

    this.firestoreService.contacts$.subscribe((contacts: Contact[]) => {
      this.contacts = new Map();
      contacts.forEach(contact => {
        if (contact.id) { // ✅ Prüft, ob die ID existiert
          this.contacts.set(contact.id, contact);
        } else {
          console.warn("⚠️ Kontakt ohne ID gefunden:", contact);
        }
      });
    });
  }

  // Task im UI + Firestore hinzufügen
  async addTaskToBoard(task: Task) {
    await this.firestoreService.addTask(task);
  }

  // Task per Drag & Drop verschieben + Firestore updaten
  async drop(event: CdkDragDrop<Task[]>, targetCategory: keyof typeof this.tasks): Promise<void> {
    const prevCategory = event.previousContainer.id as keyof typeof this.tasks;
  
    // 🛡️ Safety Check
    if (
      !this.tasks[prevCategory] ||
      !this.tasks[targetCategory] ||
      !this.tasks[prevCategory][event.previousIndex]
    ) {
      console.warn(`❗ Ungültiger Drag-Vorgang: ${prevCategory} → ${targetCategory}`);
      return;
    }
  
    // 🧠 Move Task im UI
    const movedTask = this.tasks[prevCategory][event.previousIndex];
    movedTask.status = targetCategory as string;
  
    // ✨ Optional: visuell direkt verschieben
    moveItemInArray(this.tasks[prevCategory], event.previousIndex, event.previousIndex); // optional
    if (prevCategory !== targetCategory) {
      this.tasks[prevCategory].splice(event.previousIndex, 1);
      this.tasks[targetCategory].splice(event.currentIndex, 0, movedTask);
    }
  
    // 🔥 Firestore Update
    try {
      await this.firestoreService.updateTask(movedTask);
    } catch (err) {
      console.error('❌ Fehler beim Task-Update:', err);
    }
  }
  
  // Task Overlay öffnen & schließen
  isAddTaskOpen: boolean = false;

  openAddTask() {
    this.isAddTaskOpen = true;
    setTimeout(() => {
      document.querySelector('.add-task-overlay')?.classList.add('open');
    }, 10);
  }

  closeAddTask() {
    document.querySelector('.add-task-overlay')?.classList.remove('open');
    setTimeout(() => this.isAddTaskOpen = false, 300);
  }

  // 🌈 Gibt eine Farbe für die Kategorie zurück
  getCategoryColor(category?: string): string {
    const categoryColors: { [key: string]: string } = {
      'User Story': '#FF5733',
      'Bug': '#33FF57',
      'Feature': '#3357FF',
      'Task': '#F1C40F'
    };
    return category ? categoryColors[category] || '#CCCCCC' : '#CCCCCC'; // Standardfarbe bei undefined
  }

  // ✅ Berechnet den Subtask-Fortschritt in Prozent
  getSubtaskProgress(task: Task): number {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(subtask => subtask.completed).length;
    return (completed / task.subtasks.length) * 100;
  }

  // 🏆 Gibt die Anzahl der erledigten Subtasks zurück
  getCompletedSubtasks(task: Task): number {
    if (!task.subtasks) return 0;
    return task.subtasks.filter(subtask => subtask.completed).length;
  }

  normalizeAssignees(task: Task): Contact[] {
    return Array.isArray(task.assignedTo) ? task.assignedTo as unknown as Contact[] : [];
  }

  openTaskDetail(task: Task) {
    this.selectedTask = task;
  }

  closeTaskDetail() {
    this.selectedTask = null;
  }

  startEditTask(task: Task) {
    this.selectedTask = null; // Task-Detail-Overlay schließen
    setTimeout(() => this.openAddTaskWithPrefill(task), 300); // Kurze Pause für Animation
  }
  
  openAddTaskWithPrefill(task: Task) {
    this.isAddTaskOpen = true;
  
    setTimeout(() => {
      if (this.addTaskComponent?.prefillForm) {
        this.addTaskComponent.prefillForm(task);
      }
      document.querySelector('.add-task-overlay')?.classList.add('open');
    }, 10);
  } 

  trackByTaskId(index: number, task: Task): string {
    return task.id ?? index.toString(); // Falls kein ID vorhanden ist
  }

  getConnectedDropLists(category: string): string[] {
    return this.categories.filter(c => c !== category);
  }
  
  getCategoryTitle(key: string): string {
    const titles: { [key: string]: string } = {
      todo: 'To Do',
      inProgress: 'In Progress',
      awaitFeedback: 'Await Feedback',
      done: 'Done'
    };
    return titles[key] || key;
  }

  scrollInterval: any;

  @HostListener('document:mousemove', ['$event'])

  onDragMoved(event: any) {
    if (!event || !event.pointerPosition) return;
    const scrollMargin = 70;
    const scrollSpeed = 7;
  
    const container = document.querySelector('.task-container') as HTMLElement;
    if (!container) return;
  
    const rect = container.getBoundingClientRect();
    const pointerX = event.pointerPosition.x;
  
    if (pointerX < rect.left + scrollMargin) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = setInterval(() => {
        container.scrollLeft -= scrollSpeed;
      }, 10);
    } else if (pointerX > rect.right - scrollMargin) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = setInterval(() => {
        container.scrollLeft += scrollSpeed;
      }, 10);
    } else {
      clearInterval(this.scrollInterval);
    }
  }

  filterTasks(category: string): Task[] {
    if (!this.searchQuery) return this.tasks[category];
  
    const query = this.searchQuery.toLowerCase();
  
    return this.tasks[category].filter(task =>
      task.title?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    );
  }
  
}