import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-select-menu',
  templateUrl: './select-menu.component.html',
  styleUrls: ['./select-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectMenuComponent implements OnInit {
  @Input()
  disable: boolean = false; // whether select is disabled

  @Input()
  multiple: boolean = false; // whether multiple selections are supported

  @Input()
  options: any[] = []; // options for the select menu

  @Input()
  placeholderText: string = $localize`Select an option`; // placeholder text

  @Input()
  value: any; // selected value

  @Input()
  valueProp: string = 'value'; // name of property in options to use as option value

  @Input()
  viewValueProp: string = 'viewValue'; // name of property in options to use as option display value

  @Output('update')
  change: EventEmitter<string> = new EventEmitter<string>(); // change event emitter

  selectField = new FormControl(''); // form control for the search input

  constructor() {}

  ngOnInit() {
    this.selectField = new FormControl({
      value: this.value,
      disabled: this.disable
    });
    // this.selectField.setValue(this.value);
    this.selectField.valueChanges.subscribe((value) => {
      this.change.emit(this.selectField.value);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value) {
      this.value = changes.value.currentValue;
      this.selectField.setValue(this.value);
    }

    if (changes.disable) {
      this.disable = changes.disable.currentValue;
      this.disable ? this.selectField.disable() : this.selectField.enable();
    }
  }
}
