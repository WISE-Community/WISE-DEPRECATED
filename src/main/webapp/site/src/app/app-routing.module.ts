import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent }      from './about/about.component';
import { NewsComponent } from "./news/news.component";
import { StudentComponent } from './student/student.component';

const routes: Routes = [
  { path: 'about', component: AboutComponent },
  { path: 'news', component: NewsComponent },
  { path: 'student', component: StudentComponent }
];

@NgModule({
  declarations: [ AboutComponent, NewsComponent ],
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule, AboutComponent, NewsComponent ]
})
export class AppRoutingModule { }
