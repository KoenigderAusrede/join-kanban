import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { IntroOverlayComponent } from '../intro-overlay/intro-overlay.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [FormsModule, RouterModule, IntroOverlayComponent, CommonModule]
})
export class SignupComponent {
  showIntro = true; 
  email: string = '';
  password: string = '';
  displayName: string = '';

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  async onSignup(): Promise<void> {
    try {
      // 1. Account bei Firebase Auth anlegen
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      const user: User = userCredential.user;
      console.log('✅ Auth erstellt:', user);

      // 2. Firestore-Datensatz für den User anlegen
      const userDocRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        email: this.email,
        displayName: this.displayName,
        createdAt: new Date(),
        role: 'user' // später für Admin etc.
      });

      console.log('✅ Firestore-Eintrag angelegt');
      this.router.navigate(['/summary']);
    } catch (error) {
      console.error('❌ Fehler beim Signup:', (error as any).message);
    }
  }
}