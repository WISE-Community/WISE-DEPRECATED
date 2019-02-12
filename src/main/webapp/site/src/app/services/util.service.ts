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

  getDaysInMonth(month): string[] {
    let numberOfDays = 0;
    switch (month) {
      case 2:
        numberOfDays = 29;
        break;
      case 4:
      case 6:
      case 9:
      case 11:
        numberOfDays = 30;
        break;
      default:
        numberOfDays = 31;
    }
    const days = [];
    for (let i = 0; i < numberOfDays; i++) {
      let day = (i + 1).toString();
      if (i < 9) {
        day = '0' + day;
      }
      days.push(day);
    }
    return days;
  }
}
