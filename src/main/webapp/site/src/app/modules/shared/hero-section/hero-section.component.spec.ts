import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroSectionComponent } from './hero-section.component';
import { SharedModule } from "../shared.module";

describe('HeroSectionComponent', () => {
  let component: HeroSectionComponent;
  let fixture: ComponentFixture<HeroSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [ SharedModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
