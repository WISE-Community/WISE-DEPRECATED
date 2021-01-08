import { OverlayContainer } from '@angular/cdk/overlay';
import { inject, ComponentFixture, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

export class SelectMenuTestHelper {
  private _container: OverlayContainer;
  private _containerElement: HTMLElement;
  private _trigger: HTMLElement;

  public constructor(private _fixture: ComponentFixture<any>) {
    inject([OverlayContainer], (oc: OverlayContainer) => {
      this._container = oc;
      this._containerElement = oc.getContainerElement();
    })();
  }

  public triggerMenu() {
    this._fixture.detectChanges();
    this._trigger = this._fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
    this._trigger.click();
    this._fixture.detectChanges();
  }

  public getOptions(): HTMLElement[] {
    return Array.from(
      this._containerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>
    );
  }

  public selectOption(option: HTMLElement) {
    option.click();
    this._fixture.detectChanges();
    this._trigger.click();
    this._fixture.detectChanges();
    flush();
  }

  public selectOptionByKey(options: HTMLElement[], key: string) {
    options.forEach((option: HTMLElement) => {
      if (option.innerText.trim() === key) {
        this.selectOption(option);
      }
    });
  }

  public cleanup() {
    this._container.ngOnDestroy();
  }
}
