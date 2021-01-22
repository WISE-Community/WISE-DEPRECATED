import { HTTP_INTERCEPTORS, HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { PrivacyComponent } from './privacy/privacy.component';

const routes: Routes = [
  { path: '', loadChildren: () => import('./home/home.module').then((m) => m.HomeModule) },
  { path: 'about', loadChildren: () => import('./about/about.module').then((m) => m.AboutModule) },
  {
    path: 'contact',
    loadChildren: () => import('./contact/contact.module').then((m) => m.ContactModule)
  },
  {
    path: 'features',
    loadChildren: () => import('./features/features.module').then((m) => m.FeaturesModule)
  },
  {
    path: 'forgot',
    loadChildren: () => import('./forgot/forgot.module').then((m) => m.ForgotModule)
  },
  { path: 'help', loadChildren: () => import('./help/help.module').then((m) => m.HelpModule) },
  {
    path: 'join',
    loadChildren: () => import('./register/register.module').then((m) => m.RegisterModule)
  },
  { path: 'login', loadChildren: () => import('./login/login.module').then((m) => m.LoginModule) },
  { path: 'news', loadChildren: () => import('./news/news.module').then((m) => m.NewsModule) },
  { path: 'privacy', component: PrivacyComponent },
  {
    path: 'student',
    loadChildren: () => import('./student/student.module').then((m) => m.StudentModule)
  },
  {
    path: 'teacher',
    loadChildren: () => import('./teacher/teacher.module').then((m) => m.TeacherModule)
  }
];

@Injectable()
export class XhrInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const xhr = req.clone({
      headers: req.headers.set('X-Requested-With', 'XMLHttpRequest')
    });
    return next.handle(xhr);
  }
}

@NgModule({
  declarations: [PrivacyComponent],
  imports: [RouterModule.forRoot(routes), FormsModule],
  exports: [RouterModule],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: XhrInterceptor, multi: true }]
})
export class AppRoutingModule {}
