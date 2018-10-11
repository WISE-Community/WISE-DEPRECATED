import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { Teacher } from "../../domain/teacher";
import { Student } from "../../domain/student";
import { ConfigService } from "../../services/config.service";

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
  runId: number;
  projectId: number;
  isStudent: boolean = false;
  isSignedIn: boolean = false;
  isSendingRequest: boolean = false;
  isRecaptchaEnabled: boolean = false;
  recaptchaPublicKey: string = "";
  recaptchaResponse: string = "";
  message: string = "";

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private configService: ConfigService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.isSignedIn = this.userService.isSignedIn();
    this.isStudent = this.userService.isStudent();
    this.obtainRunIdOrProjectIdIfNecessary();
    this.showEmailIfNecessary();
    this.showRecaptchaIfNecessary();
    this.populateFieldsIfSignedIn();
  }

  obtainRunIdOrProjectIdIfNecessary() {
    this.route.queryParams.subscribe(params => {
      this.runId = params['runId'];
      this.projectId = params['projectId'];
    });
  }

  showEmailIfNecessary() {
    if (!this.isStudent) {
      this.contactFormGroup.addControl('email', new FormControl('', [Validators.required, Validators.email]));
    }
  }

  showRecaptchaIfNecessary() {
    if (!this.isSignedIn) {
      this.configService.getConfig().subscribe((config) => {
        if (config != null) {
          this.recaptchaPublicKey = this.configService.getRecaptchaPublicKey();
          if (this.recaptchaPublicKey != null) {
            this.contactFormGroup.addControl('recaptcha', new FormControl('', [Validators.required]));
            this.isRecaptchaEnabled = true;
          }
        }
      });
    }
  }

  populateFieldsIfSignedIn() {
    if (this.isSignedIn) {
      if (this.isStudent) {
        const user = <Student>this.userService.getUser().getValue();
        this.setControlFieldValue('name', user.firstName + ' ' + user.lastName);
      } else {
        const user = <Teacher>this.userService.getUser().getValue();
        this.setControlFieldValue('name', user.firstName + ' ' + user.lastName);
        this.setControlFieldValue('email', user.email);
      }
    }
  }

  submit() {
    const name = this.getName();
    const email = this.getEmail();
    const issueType = this.getIssueType();
    const summary = this.getSummary();
    const description = this.getDescription();
    const runId = this.getRunId();
    const projectId = this.getProjectId();
    const userAgent = this.getUserAgent();
    const recaptchaResponse = this.getRecaptchaResponse();
    this.setIsSendingRequest(true);
    this.userService.sendContactMessage(name, email, issueType, summary, description, runId,
        projectId, userAgent, recaptchaResponse)
      .subscribe((response) => {
        this.handleSendContactMessageResponse(response);
      });
  }

  handleSendContactMessageResponse(response: any) {
    if (response.status == "success") {
      this.setMessage("Your message has been sent. Thank you for contacting WISE. We will try to get back to you as soon as possible.");
      this.routeToContactCompletePage();
    } else if (response.status == "failure") {
      this.setMessage("There was a problem with submitting the form. Please try again.");
      if (this.isRecaptchaEnabled) {
        this.resetRecaptcha();
      }
    }
    this.setIsSendingRequest(false);
  }

  setControlFieldValue(name: string, value: string) {
    this.contactFormGroup.controls[name].setValue(value);
  }

  getControlFieldValue(fieldName) {
    return this.contactFormGroup.get(fieldName).value;
  }

  getName() {
    return this.getControlFieldValue('name');
  }

  getEmail() {
    let email = null;
    if (!this.isStudent) {
      email = this.getControlFieldValue('email');
    }
    return email;
  }

  getIssueType() {
    return this.getControlFieldValue('issueType');
  }

  getSummary() {
    return this.getControlFieldValue('summary');
  }

  getDescription() {
    return this.getControlFieldValue('description');
  }

  getRunId() {
    return this.runId;
  }

  getProjectId() {
    return this.projectId;
  }

  getUserAgent() {
    return navigator.userAgent;
  }

  routeToContactCompletePage() {
    this.router.navigate(['contact/complete', {}]);
  }

  recaptchResolved(recaptchaResponse) {
    this.recaptchaResponse = recaptchaResponse;
  }

  getRecaptchaResponse() {
    return this.recaptchaResponse;
  }

  resetRecaptcha() {
    this.contactFormGroup.get('recaptcha').reset();
  }

  setIsSendingRequest(value: boolean) {
    this.isSendingRequest = value;
  }

  setMessage(message: string) {
    this.message = message;
  }
}
