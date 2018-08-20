import { User } from "./user";

export class Student extends User {
  gender: string;
  birthMonth: number;
  birthDay: number;
  securityQuestion: string;
  securityAnswer: string;
  accessCode: string;
  period: string;
}
