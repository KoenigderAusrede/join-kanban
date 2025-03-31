import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { AuthService } from '../../core/services/auth.service';
import { filter, take } from 'rxjs';
import { LoadingService } from '../../core/services/loading.service';
import { IntroOverlayComponent } from '../intro-overlay/intro-overlay.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule, RouterModule, IntroOverlayComponent, CommonModule]
})

export class LoginComponent {
  showIntro = true;
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;

  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private authService: AuthService
  ) {}

  private auth: Auth = inject(Auth);

  async onSubmit(): Promise<void> {

    if (!this.email || !this.password) {
      alert('Bitte E-Mail und Passwort ausfüllen.');
      return;
    }

    this.loadingService.setLoading(true);


    try {
      await setPersistence(this.auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      console.log('✅ Login erfolgreich:', userCredential.user);
    
      // 👉 Warten, bis AuthService sicher erkennt, dass eingeloggt ist
      this.authService.isLoggedIn$().pipe(
        filter(loggedIn => loggedIn), // nur wenn "true"
        take(1) // nur 1x feuern
      ).subscribe(() => {
        this.loadingService.setLoading(false);
        this.router.navigate(['/summary']);
      });
      
    } catch (error) {
      this.loadingService.setLoading(false);
      console.error('❌ Fehler beim Login:', (error as any).message);
      alert("Login fehlgeschlagen: " + (error as any).message);
    }
  }   

  async loginAsGuest() {
    await this.authService.loginAsGuest();
    setTimeout(() => {
      this.router.navigate(['/summary']);
    }, 500);
  }
}
