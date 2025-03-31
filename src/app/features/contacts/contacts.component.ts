import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../core/services/firestore.service';
import { CommonModule, NgFor } from '@angular/common';
import { Contact } from '../../core/models/contact.model';

const COLOR_PALETTE = ['#ff5733', '#33ff57', '#3357ff', '#f1c40f', '#9b59b6', '#2ecc71', '#e74c3c', '#1abc9c', '#3498db', '#f39c12'];

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
  imports: [FormsModule, CommonModule, NgFor]
})
export class ContactsComponent {
  contacts: Contact[] = [];
  sortedContacts: { letter: string; contacts: Contact[] }[] = [];
  isOverlayOpen = false;
  newContact: Contact = { firstName: '', lastName: '', email: '', phone: '', color:'' };
  selectedContact: Contact | null = null;

  constructor(private firestoreService: FirestoreService) {
    this.firestoreService.contacts$.subscribe(contacts => {
      this.contacts = contacts;
      this.sortContacts();
    });
  }

  sortContacts() {
    this.contacts.sort((a, b) => a.lastName.localeCompare(b.lastName));
    const groupedContacts: { [key: string]: Contact[] } = {};
    
    this.contacts.forEach(contact => {
      const letter = contact.lastName[0].toUpperCase();
      if (!groupedContacts[letter]) {
        groupedContacts[letter] = [];
      }
      groupedContacts[letter].push(contact);
    });
    
    this.sortedContacts = Object.keys(groupedContacts).sort().map(letter => ({
      letter,
      contacts: groupedContacts[letter]
    }));
  }

  openOverlay() {
    this.isOverlayOpen = true;
  }

  closeOverlay() {
    this.isOverlayOpen = false;
    this.newContact = { firstName: '', lastName: '', email: '', phone: '', color: '' };
    document.body.style.overflow = 'auto';
  }

  async addContact() {
    if (this.newContact.firstName && this.newContact.lastName) {
      const color = this.getColorForContact(this.newContact);
      await this.firestoreService.addContact({ ...this.newContact, color });
    }
    this.closeOverlay();
  }

  selectContact(contact: Contact) {
    document.body.style.overflow = 'hidden';
    this.selectedContact = contact;
  }


  async deleteContact() {
    if (this.selectedContact && this.selectedContact.id) {
      await this.firestoreService.deleteContact(this.selectedContact.id);
      this.selectedContact = null;
    }
  }

  getColorForContact(contact: Contact): string {
    const name = contact.firstName + contact.lastName;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % COLOR_PALETTE.length);
    return COLOR_PALETTE[index];
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    this.closeOverlay();
  }

  isEditOverlayOpen = false;
editableContact: Contact = { firstName: '', lastName: '', email: '', phone: '', color : '' };

openEditOverlay() {
  console.log('Opening edit overlay...');
  if (this.selectedContact) {
    this.editableContact = { ...this.selectedContact }; // Kopie des Kontakts
    this.isEditOverlayOpen = true;
  }
}

closeEditOverlay() {
  this.isEditOverlayOpen = false;
}

async saveContact() {
  if (this.editableContact.id) {
    this.firestoreService.updateContact(this.editableContact);
    this.isEditOverlayOpen = false;
  }
}
}
