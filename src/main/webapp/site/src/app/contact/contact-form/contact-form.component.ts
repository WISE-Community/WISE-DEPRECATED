import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { Teacher } from "../../domain/teacher";
import { Student } from "../../domain/student";

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContactFormComponent implements OnInit {

  issueTypes: object[] = [
    { key: "TROUBLE_LOGGING_IN", value: "Trouble Signing In" },
    { key: "NEED_HELP_USING_WISE", value: "Need Help Using WISE" },
    { key: "PROJECT_PROBLEMS", value: "Problems with a Project" },
    { key: "STUDENT_MANAGEMENT", value: "Student Management" },
    { key: "AUTHORING", value: "Need Help with Authoring" },
    { key: "FEEDBACK", value: "Feedback to WISE" },
    { key: "OTHER", value: "Other Problem" }
  ]
  contactFormGroup: FormGroup = this.fb.group({
    name: new FormControl( '', [Validators.required]),
    issueType: new FormControl('', [Validators.required]),
    summary: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required])
  });
  message: string = "";
  runId: number;
  projectId: number;
  isStudent: boolean = false;
  isSendingRequest = false;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private route: ActivatedRoute,
              private router: Router) {
    this.isStudent = this.userService.isStudent();
  }

  ngOnInit() {
    if (!this.isStudent) {
      this.contactFormGroup.addControl('email', new FormControl('', [Validators.required]));
    }
    this.route.queryParams.subscribe(params => {
      this.runId = params['runId'];
      this.projectId = params['projectId'];
    });
    this.populateFieldsIfSignedIn();
  }

  populateFieldsIfSignedIn() {
    if (this.userService.isSignedIn()) {
      if (this.userService.isTeacher()) {
        const user = <Teacher>this.userService.getUser().getValue();
        this.setControlFieldValue('name', user.firstName + ' ' + user.lastName);
        this.setControlFieldValue('email', user.email);
      } else if (this.userService.isStudent()) {
        const user = <Student>this.userService.getUser().getValue();
        this.setControlFieldValue('name', user.firstName + ' ' + user.lastName);
      }
    }
  }

  submit() {
    const name = this.getControlFieldValue('name');
    const issueType = this.getControlFieldValue('issueType');
    const summary = this.getControlFieldValue('summary');
    const description = this.getControlFieldValue('description');
    const runId = this.runId;
    const projectId = this.projectId;
    const userAgent = navigator.userAgent;
    let email = null;
    if (!this.isStudent) {
      email = this.getControlFieldValue('email');
    }
    this.isSendingRequest = true;
    this.userService.sendContactMessage(
      name, email, issueType, summary, description, runId, projectId, userAgent)
      .subscribe((response) => {
        if (response.status == "success") {
          this.message = "Your message has been sent. Thank you for contacting WISE. We will try to get back to you as soon as possible.";
          this.routeToContactCompletePage();
        } else if (response.status == "failure") {
          this.message = "There was a problem with submitting the form. Please try again.";
        }
        this.isSendingRequest = false;
      });
  }

  getControlFieldValue(fieldName) {
    return this.contactFormGroup.get(fieldName).value;
  }

  setControlFieldValue(name: string, value: string) {
    this.contactFormGroup.controls[name].setValue(value);
  }

  clearControlFieldValue(fieldName) {
    this.contactFormGroup.get(fieldName).setValue('');
  }

  clearFields() {
    this.clearControlFieldValue('name');
    this.clearControlFieldValue('email');
    this.clearControlFieldValue('issueType');
    this.clearControlFieldValue('summary');
    this.clearControlFieldValue('description');
  }

  routeToContactCompletePage() {
    this.router.navigate(['contact/complete', {}]);
  }
}
