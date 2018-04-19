import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { LibraryComponent } from './library.component';
import { LibraryGroupThumbsComponent } from "./library-group-thumbs/library-group-thumbs.component";
import { LibraryProjectComponent, LibraryProjectDetailsComponent } from "./library-project/library-project.component";
import { LibraryProjectDisciplineIconComponent } from "./library-project-discipline-icon/library-project-discipline-icon.component";
import { LibraryService } from "../../services/library.service";
import { SharedModule } from "../shared/shared.module";

import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatOptionModule,
  MatSelectModule,
  MatTooltipModule} from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatOptionModule,
  MatSelectModule,
  MatTooltipModule
];

describe('LibraryComponent', () => {
  let component: LibraryComponent;
  let fixture: ComponentFixture<LibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        materialModules,
        ReactiveFormsModule,
        SharedModule
      ],
      declarations: [
        LibraryComponent,
        LibraryGroupThumbsComponent,
        LibraryProjectComponent,
        LibraryProjectDetailsComponent,
        LibraryProjectDisciplineIconComponent
      ],
      providers: [
        HttpClient,
        HttpHandler,
        LibraryService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
