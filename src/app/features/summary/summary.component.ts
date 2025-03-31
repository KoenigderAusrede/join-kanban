import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Auth, user } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { doc, getDoc } from '@angular/fire/firestore';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  tasks$: Observable<any[]>;
  urgentTasks: number = 0;
  shortestDueDate: string = '';
  todoCount: number = 0;
  allTasksCount: number = 0;
  inProgressCount: number = 0;
  awaitFeedbackCount: number = 0;
  doneCount: number = 0;
  greeting: string = '';
  userName: string = '';
  formattedDueDate: string = '';
  dueCountdown: string = '';

  constructor(private firestore: Firestore, private auth: Auth, private router: Router) {
    const tasksCollection = collection(this.firestore, 'tasks');
    this.tasks$ = collectionData(tasksCollection, { idField: 'id' });
  
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      const userDocRef = doc(this.firestore, 'users', currentUser.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data['displayName']) {
            this.userName = data['displayName'].split(' ')[0]; // z. B. "Felix"
          }
        } else {
          this.userName = 'Gast';
        }
      });
    }
  }
  
  navigateToBoard() {
    this.router.navigate(['/dashboard']);
  }

  ngOnInit() {
    this.setGreeting();
    this.tasks$.subscribe(tasks => {
      
      this.allTasksCount = tasks.length;
      this.todoCount = tasks.filter(task => task.status === 'todo').length;
      this.inProgressCount = tasks.filter(task => task.status === 'inProgress').length;
      this.awaitFeedbackCount = tasks.filter(task => task.status === 'awaitFeedback').length;
      this.doneCount = tasks.filter(task => task.status === 'done').length;
      const urgentTasks = tasks.filter(task =>
        task.priority?.toLowerCase() === 'urgent'
      );
      this.urgentTasks = urgentTasks.length;
      
      const allDeadlines = tasks
      .map(task => new Date(task.dueDate))
      .filter(date => !isNaN(date.getTime())); // remove invalid or missing dates
    
      if (allDeadlines.length > 0) {
        const earliest = allDeadlines.sort((a, b) => a.getTime() - b.getTime())[0];
      
        // ✅ Full US-style format
        const options: Intl.DateTimeFormatOptions = {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        };
        this.formattedDueDate = earliest.toLocaleDateString('en-US', options);
      
        // ✅ Remaining days
        const today = new Date();
        const diffTime = earliest.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
        this.dueCountdown = `${diffDays} day${diffDays === 1 ? '' : 's'} left`;
      } else {
        this.formattedDueDate = '';
        this.dueCountdown = 'No deadlines';
      }
    });
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) this.greeting = 'Good morning';
    else if (hour >= 10 && hour < 15) this.greeting = 'Good day';
    else if (hour >= 15 && hour < 18) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
  }
}
