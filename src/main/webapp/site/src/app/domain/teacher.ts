import { User } from './user';

export class Teacher extends User {
  displayName: string;
  email: string;
  googleUserId: string;
  city: string;
  state: string;
  country: string;
  schoolName: string;
  schoolLevel: string;
  howDidYouHearAboutUs: string;
}
