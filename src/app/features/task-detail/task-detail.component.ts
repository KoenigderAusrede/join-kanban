import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from './../../core/models/task.model';
import { Contact } from './../../core/models/contact.model';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from './../../core/services/firestore.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss'],
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  standalone: true,
})
export class TaskDetailComponent {
  @Input() task!: Task;
  @Input() contacts: Map<string, Contact> = new Map();
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Task>();

  constructor(private firestoreService: FirestoreService) {}

  closeDetail() {
    this.close.emit();
  }

  deleteTask() {
    if (!this.task || !this.task.id) return;
  
    const confirmDelete = confirm('Bist du sicher, dass du diesen Task löschen möchtest?');
    if (confirmDelete) {
      this.firestoreService.deleteTask(this.task.id).then(() => {
        this.closeDetail(); // Overlay schließen
      }).catch(err => {
        console.error('Fehler beim Löschen des Tasks:', err);
      });
    }
  }

  editTask() {
    this.edit.emit(this.task);
  }

  getPriorityIcon(priority: string): string {
    const icons: { [key: string]: string } = {
      Urgent: '/assets/prio/prioUrgent.png',
      Medium: '/assets/prio/prioMedium.png',
      Low: '/assets/prio/prioLow.svg'
    };
    return icons[priority] || '/assets/icons/default.png';
  }

  getCategoryColor(category: string): string {
    if (!category) return '#ccc'; 
    const colors: { [key: string]: string } = {
      'Technical Task': '#2A6FF4',
      'Bug Fix': '#FF4D4D',
      'Feature': '#4CAF50'
    };
    return colors[category] || '#ccc';
  }
}
