import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private auth = inject(Auth);
  user: User | null = null;

  constructor() {
    // Prüfen, ob ein User eingeloggt ist
    onAuthStateChanged(this.auth, (user) => {
      this.user = user;
    });
  }
}
