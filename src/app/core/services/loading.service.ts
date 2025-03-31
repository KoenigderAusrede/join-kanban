import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loading$ = new BehaviorSubject<boolean>(false);

  setLoading(isLoading: boolean) {
    this.loading$.next(isLoading);
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }
}
