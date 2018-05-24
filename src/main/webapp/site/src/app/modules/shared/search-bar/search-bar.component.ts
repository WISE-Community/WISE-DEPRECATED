import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Subject } from "rxjs/Subject";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent implements OnInit {

  @Input()
  placeholderText: string = 'Search'; // placeholder text

  @Input()
  floatLabel: string = 'auto'; // when to show the floating label ('always', 'auto' or 'never')

  @Input()
  disable: boolean = false; // whether input is disabled

  @Input()
  value: string = ''; // search string

  @Input()
  debounce: number = 250; // time to wait for changes (milliseconds)

  @Output('update')
  change: EventEmitter<string> = new EventEmitter<string>(); // change event emitter

  private searchUpdate: Subject<string> = new Subject<string>(); // temporary changed search string

  constructor() {
    this.change = <any>this.searchUpdate.asObservable()
      .debounceTime(this.debounce) // wait specified interval for any changes
      .distinctUntilChanged(); // only emit event if search string has changed
  }

  ngOnInit() {
  }

  ngOnChanges(changes) {
    if (changes.value) {
      this.value = changes.value.currentValue;
      this.changed();
    }
  }

  changed() {
    this.searchUpdate.next(this.value);
  }

}
