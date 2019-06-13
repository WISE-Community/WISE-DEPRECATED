import { DetachedRouteHandle, RouteReuseStrategy, ActivatedRouteSnapshot } from '@angular/router';

export class TeacherRouteReuseStrategy implements RouteReuseStrategy {
  storedRouteHandles = new Map<string, DetachedRouteHandle>();
  routesToCache = ['schedule', 'tested', 'community', 'personal', 'library', 'home'];

  shouldReuseRoute(before: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (before.component && (<any>before.component).name === 'TeacherHomeComponent') {
      return false;
    }
    return before.routeConfig === curr.routeConfig;
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.storedRouteHandles.get(this.getPath(route)) as DetachedRouteHandle;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.storedRouteHandles.has(this.getPath(route));
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.routesToCache.includes(this.getPath(route));
  }

  store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
    this.storedRouteHandles.set(this.getPath(route), detachedTree);
  }

  private getPath(route: ActivatedRouteSnapshot): string {
    if (route.routeConfig !== null && route.routeConfig.path !== null) {
      return route.routeConfig.path;
    }
    return '';
  }
}
