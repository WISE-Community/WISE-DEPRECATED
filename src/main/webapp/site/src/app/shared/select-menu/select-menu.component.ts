import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-select-menu',
  templateUrl: './select-menu.component.html',
  styleUrls: ['./select-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectMenuComponent implements OnInit {

  @Input()
  options: { value: string, viewValue: string }[] = []; // options for the select menu

  @Input()
  placeholderText: string = 'Select on option'; // placeholder text

  @Input()
  floatLabel: string = 'auto'; // when to show the floating label ('always', 'auto' or 'never')

  @Input()
  disable: boolean = false; // whether select is disabled

  @Input()
  value: string = ''; // selected value

  @Output('update')
  change: EventEmitter<string> = new EventEmitter<string>(); // change event emitter

  constructor() { }

  ngOnInit() {
  }

  changed() {
    this.change.emit(this.value);
  }

}
