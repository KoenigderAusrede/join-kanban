import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Task } from '../../core/models/task.model';
import { FirestoreService } from '../../core/services/firestore.service';
import { Observable } from 'rxjs';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-add-task',
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class AddTaskComponent {
  @Input() layoutMode: 'overlay' | 'page' = 'page';
  @Input() isAddTaskOpen: boolean = false;
  @Input() taskToEdit?: Task;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() taskCreated = new EventEmitter<any>();

  taskForm: FormGroup;
  categories: string[] = ['Technical Task', 'User Story', 'Bug', 'Feature Request'];
  contacts$!: Observable<any[]>;
  selectedContacts: any[] = [];
  isDropdownOpen = false;
  isAddingSubtask = false;
  hoveredIndex: number | null = null;
  editingIndex: number | null = null;
  isEditMode = false;
  editTaskId?: string;
  showSuccessBanner = false;

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private loadingService: LoadingService
  ) {
    this.taskForm = this.fb.group({
      title: [''],
      description: [''],
      dueDate: [''],
      priority: [''],
      assignedTo: [''],
      category: [''],
      status: ['todo'],
      subtasks: this.fb.array([]),
      subtaskInput: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.contacts$ = this.firestoreService.contacts$;

    if (this.taskToEdit) {
      this.prefillForm(this.taskToEdit);
    }
  }

  get subtasks(): FormArray {
    return this.taskForm.get('subtasks') as FormArray;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  isSelected(contact: any): boolean {
    return this.selectedContacts.some(c => c.id === contact.id);
  }

  toggleSelection(contact: any): void {
    const index = this.selectedContacts.findIndex(c => c.id === contact.id);
    if (index > -1) {
      this.selectedContacts.splice(index, 1);
    } else {
      this.selectedContacts.push(contact);
    }
  }

  getInitials(contact: any): string {
    return contact.firstName[0] + contact.lastName[0];
  }

  getColor(contact: any): string {
    return '#007bff';
  }

  setPriority(priority: string) {
    this.taskForm.patchValue({ priority });
  }

  startAddingSubtask() {
    this.isAddingSubtask = true;
  }

  saveSubtask() {
    const subtaskText = this.taskForm.value.subtaskInput.trim();
    if (subtaskText !== '') {
      this.subtasks.push(new FormControl(subtaskText));
      this.taskForm.get('subtaskInput')?.reset();
    }
    this.isAddingSubtask = false;
  }

  cancelSubtask() {
    this.isAddingSubtask = false;
  }

  removeSubtask(index: number) {
    this.subtasks.removeAt(index);
  }

  editSubtask(index: number) {
    this.editingIndex = index;
  }

  saveEditedSubtask(index: number) {
    this.editingIndex = null;
  }

  cancelEditSubtask() {
    this.editingIndex = null;
  }

  async submitTask() {
    if (this.taskForm.invalid) return;

    const baseTask: Task = {
      ...this.taskForm.value,
      assignedTo: this.selectedContacts,
      subtasks: this.subtasks.value.map((title: string) => ({ title, completed: false }))
    };

    if (this.isEditMode && this.editTaskId) {
      const updatedTask: Task = { ...baseTask, id: this.editTaskId };
      await this.firestoreService.updateTask(updatedTask);
    } else {
      const newTask: Task = { ...baseTask, createdAt: Date.now() };
      await this.firestoreService.addTask(newTask);
    }

    this.showSuccessFeedback();
  }

  resetFormAndClose() {
    this.taskForm.reset();
    this.isEditMode = false;
    this.editTaskId = undefined;
    this.closeTaskDialog();
  }

  closeTaskDialog() {
    this.isEditMode = false;
    this.closeDialog.emit();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    this.closeTaskDialog();
  }

  prefillForm(task: Task) {
    this.taskForm.patchValue({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate || '',
      assignedTo: task.assignedTo || '',
      priority: task.priority || '',
      status: task.status || '',
      category: task.category || ''
    });

    this.selectedContacts = task.assignedTo || [];
    this.subtasks.clear();
    if (task.subtasks) {
      task.subtasks.forEach(st => this.subtasks.push(this.fb.control(st.title)));
    }

    this.isEditMode = true;
    this.editTaskId = task.id;
  }

  showSuccessFeedback() {
    this.showSuccessBanner = true;
    setTimeout(() => {
      this.showSuccessBanner = false;
      this.resetFormAndClose();
    }, 2500);
  }
}