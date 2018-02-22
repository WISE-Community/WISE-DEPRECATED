import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { FeaturesComponent } from './features/features.component';
import { NewsComponent } from "./news/news.component";

const routes: Routes = [
  { path: 'about', component: AboutComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'news', component: NewsComponent }
];

@NgModule({
  declarations: [ AboutComponent, FeaturesComponent, NewsComponent ],
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule, AboutComponent, FeaturesComponent, NewsComponent ]
})
export class AppRoutingModule { }
