import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { FeaturesComponent } from './features/features.component';
import { NewsComponent } from "./news/news.component";
import { HomeComponent } from "./home/home.component";

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'news', component: NewsComponent }
];

@NgModule({
  declarations: [ AboutComponent, FeaturesComponent, HomeComponent, NewsComponent ],
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
