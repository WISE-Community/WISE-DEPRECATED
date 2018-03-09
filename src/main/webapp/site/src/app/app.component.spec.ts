import { TestBed, async } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { AppComponent } from './app.component';
import { HeaderModule } from "./modules/header/header.module";
import { FooterModule } from "./modules/footer/footer.module";
import { AppRoutingModule } from "./app-routing.module";
import { UserService } from "./services/user.service";

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' },
        { provide: UserService }
      ],
      declarations: [
        AppComponent
      ],
      imports: [
        AppRoutingModule,
        FooterModule,
        HeaderModule
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'app'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('app');
  }));
});
