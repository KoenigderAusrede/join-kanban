import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../models/task.model';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  contacts$ = this.contactsSubject.asObservable();

  private contactsMapSubject = new BehaviorSubject<Map<string, Contact>>(new Map());
  contactsMap$ = this.contactsMapSubject.asObservable();

  constructor(private firestore: Firestore) {
    this.syncTasksFromFirestore();
    this.syncContactsFromFirestore();
  }

  private async syncTasksFromFirestore() {
    const tasksRef = collection(this.firestore, 'tasks');
    onSnapshot(tasksRef, (snapshot) => {
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data() as Task;
        return { ...data, id: doc.id };
      });
      this.tasksSubject.next(tasks);
    });
  }

  private async syncContactsFromFirestore() {
    const contactsRef = collection(this.firestore, 'contacts');
    onSnapshot(contactsRef, (snapshot) => {
      const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
      this.contactsSubject.next(contacts);

      const contactMap = new Map<string, Contact>();
      contacts.forEach(contact => {
        if (contact.id) contactMap.set(contact.id, contact);
      });
      this.contactsMapSubject.next(contactMap);
    });
  }

  async addTask(task: Task) {
    try {
      const tasksRef = collection(this.firestore, 'tasks');
      await addDoc(tasksRef, {
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        priority: task.priority,
        assignedTo: task.assignedTo,
        category: task.category,
        subtasks: task.subtasks,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error('❌ Fehler beim Speichern:', error);
    }
  }

  deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(this.firestore, `tasks/${taskId}`);
    return deleteDoc(taskRef);
  }

  async addContact(contact: Contact) {
    try {
      const contactsRef = collection(this.firestore, 'contacts');
      const initials = (contact.firstName[0] + contact.lastName[0]).toUpperCase();
      const contactWithInitials = { ...contact, initials };
      await addDoc(contactsRef, contactWithInitials);
    } catch (error) {
      console.error('❌ Fehler beim Speichern des Kontakts:', error);
    }
  }

  async updateContact(contact: Contact) {
    if (!contact.id) return console.error('❌ Kontakt hat keine ID!');
    try {
      const contactDocRef = doc(this.firestore, `contacts/${contact.id}`);
      const initials = (contact.firstName[0] + contact.lastName[0]).toUpperCase();
      const contactWithInitials = { ...contact, initials };
      await updateDoc(contactDocRef, contactWithInitials);
    } catch (error) {
      console.error('❌ Fehler beim Aktualisieren des Kontakts:', error);
    }
  }

  async deleteContact(contactId: string) {
    try {
      const contactDocRef = doc(this.firestore, `contacts/${contactId}`);
      await deleteDoc(contactDocRef);
    } catch (error) {
      console.error('❌ Fehler beim Löschen des Kontakts:', error);
    }
  }

  async updateTask(task: Task) {
    if (!task.id) return console.error('❌ Task hat keine ID!');
    try {
      const taskDocRef = doc(this.firestore, `tasks/${task.id}`);
      await updateDoc(taskDocRef, { ...task });
    } catch (error) {
      console.error('❌ Fehler beim Aktualisieren des Tasks:', error);
    }
  }
}