import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactFormComponent } from "./contact-form/contact-form.component";
import { ContactCompleteComponent } from "./contact-complete/contact-complete.component";
const contactRoutes: Routes = [
  { path: '', component: ContactFormComponent },
  { path: 'complete', component: ContactCompleteComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(contactRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ContactRoutingModule {}
