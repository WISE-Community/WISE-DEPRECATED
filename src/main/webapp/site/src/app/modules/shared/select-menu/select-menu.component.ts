import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-select-menu',
  templateUrl: './select-menu.component.html',
  styleUrls: ['./select-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectMenuComponent implements OnInit {

  selectMenu = new FormControl();

  @Input()
  disable: boolean = false; // whether select is disabled

  @Input()
  floatLabel: string = 'auto'; // when to show the floating label ('always', 'auto' or 'never')

  @Input()
  multiple: boolean = false; // whether multiple selections are supported

  @Input()
  options: any[] = []; // options for the select menu

  @Input()
  placeholderText: string = 'Select an option'; // placeholder text

  @Input()
  value: any; // selected value

  @Input()
  valueProp: string = 'value'; // name of property in options to use as option value

  @Input()
  viewValueProp: string = 'viewValue'; // name of property in options to use as option display value

  @Output('update')
  change: EventEmitter<string> = new EventEmitter<string>(); // change event emitter

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.disable) {
      let disable = changes.disable.currentValue;
      if (disable) {
        this.selectMenu.disable();
      } else {
        this.selectMenu.enable();
      }
    }
  }

  changed() {
    this.change.emit(this.value);
  }
}
