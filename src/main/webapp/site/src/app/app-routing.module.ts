import { HTTP_INTERCEPTORS, HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AboutComponent } from './about/about.component';
import { PrivacyComponent } from "./privacy/privacy.component";

const routes: Routes = [
  { path: '', loadChildren: './home/home.module#HomeModule' },
  { path: 'about', component: AboutComponent },
  { path: 'contact', loadChildren: './contact/contact.module#ContactModule' },
  { path: 'features', loadChildren: './features/features.module#FeaturesModule' },
  { path: 'help', loadChildren: './help/help.module#HelpModule' },
  { path: 'join', loadChildren: './register/register.module#RegisterModule' },
  { path: 'login', loadChildren: './login/login.module#LoginModule' },
  { path: 'news', loadChildren: './news/news.module#NewsModule' },
  { path: 'privacy', component: PrivacyComponent }
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
  declarations: [ AboutComponent, PrivacyComponent ],
  imports: [ RouterModule.forRoot(routes), FormsModule ],
  exports: [ RouterModule ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: XhrInterceptor, multi: true }]
})

export class AppRoutingModule { }
