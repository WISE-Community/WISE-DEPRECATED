import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { FeaturesComponent } from './features/features.component';
import { NewsComponent } from "./news/news.component";
import { HomeModule } from "./home/home.module";

const routes: Routes = [
  // https://github.com/angular/angular-cli/issues/9825
  // { path: '', loadChildren: 'app/modules/home.module#HomeModule' },
  { path: '', loadChildren: () => HomeModule },
  { path: 'about', component: AboutComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'news', component: NewsComponent }
];

@NgModule({
  declarations: [ AboutComponent, FeaturesComponent, NewsComponent ],
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
