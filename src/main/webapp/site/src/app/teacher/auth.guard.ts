import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLogin(state.url);
  }

  checkLogin(url: string): boolean {
    if (this.userService.isTeacher()) {
      return true;
    } else if (this.userService.isAuthenticated) {
      this.router.navigate(['/']);
      return false;
    } else {
      this.userService.redirectUrl = url;
      this.router.navigate(['/login']);
      return false;
    }
  }
}
