import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  private mobileMenuState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }

  getFirstName(fullName: string): string {
    return fullName.substring(0, fullName.indexOf(" "));
  }

  getLastName(fullName: string): string {
    return fullName.substring(fullName.indexOf(" ") + 1);
  }

  showMobileMenu(state: boolean = true): void {
    this.mobileMenuState$.next(state);
  }

  getMobileMenuState(): BehaviorSubject<boolean> {
    return this.mobileMenuState$;
  }
}
