import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  getFirstName(fullName: string): string {
    return fullName.substring(0, fullName.indexOf(" "));
  }

  getLastName(fullName: string): string {
    return fullName.substring(fullName.indexOf(" ") + 1);
  }
}
