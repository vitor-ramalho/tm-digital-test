import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Loading State Service
 * Manages loading states for API calls
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingStateService {
  private loadingStates = new BehaviorSubject<Map<string, boolean>>(new Map());
  public loadingStates$ = this.loadingStates.asObservable();

  /**
   * Set loading state for a specific key
   */
  setLoading(key: string, loading: boolean): void {
    const current = this.loadingStates.value;
    current.set(key, loading);
    this.loadingStates.next(new Map(current));
  }

  /**
   * Check if a specific key is loading
   */
  isLoading(key: string): Observable<boolean> {
    return new Observable(observer => {
      this.loadingStates$.subscribe(states => {
        observer.next(states.get(key) || false);
      });
    });
  }

  /**
   * Check if any operation is loading
   */
  isAnyLoading(): Observable<boolean> {
    return new Observable(observer => {
      this.loadingStates$.subscribe(states => {
        const hasLoading = Array.from(states.values()).some(loading => loading);
        observer.next(hasLoading);
      });
    });
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    this.loadingStates.next(new Map());
  }

  /**
   * Get current loading state for a key
   */
  getCurrentState(key: string): boolean {
    return this.loadingStates.value.get(key) || false;
  }
}
