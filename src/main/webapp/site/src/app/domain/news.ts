import { User } from './user';

export class News {
  id: number;
  date: any;
  type: string;
  title: string;
  news: string;
  owner: User;

  constructor(jsonObject: any = {}) {
    for (let key of Object.keys(jsonObject)) {
      if (key == 'owner') {
        this[key] = new User(jsonObject[key]);
      } else {
        this[key] = jsonObject[key];
      }
    }
  }
}
