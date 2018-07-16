import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BlurbComponent } from './blurb.component';
import { SharedModule } from "../shared.module";

describe('BlurbComponent', () => {
  let component: BlurbComponent;
  let fixture: ComponentFixture<BlurbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [ SharedModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlurbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
