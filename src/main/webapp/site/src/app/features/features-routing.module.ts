import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeaturesComponent } from './features.component';

const featuresRoutes: Routes = [{ path: '', component: FeaturesComponent }];

@NgModule({
  imports: [RouterModule.forChild(featuresRoutes)],
  exports: [RouterModule]
})
export class FeaturesRoutingModule {}
