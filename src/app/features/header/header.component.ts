import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [NgIf, RouterModule]
})

export class HeaderComponent {
  private auth = inject(Auth);
  private router = inject(Router);

  userName: string | null = null;
  menuOpen: boolean = false;

  constructor(private userService: UserService) {
    onAuthStateChanged(this.auth, (user: User | null) => {
      this.userName = user ? user.displayName || 'Gast' : null;
    });
  }

  async ngOnInit() {
    const userData = await this.userService.getUserProfile();
  
    if (userData?.['displayName']) {
      this.userName = this.getInitials(userData['displayName']);
    } else if (userData?.['email']) {
      const fallback = userData['email'].split('@')[0];
      this.userName = fallback.charAt(0).toUpperCase();
    } else {
      this.userName = '?';
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  goToHelp() {
    // routerLink wäre auch möglich
    window.location.href = '/help';
  }

  getInitials(name: string): string {
    if (!name) return 'G';
  
    const parts = name.trim().split(' ');
  
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
  
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }  
}
