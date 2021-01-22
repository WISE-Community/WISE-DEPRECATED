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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent implements OnInit {
  @Input()
  placeholderText: string = $localize`Search`; // placeholder text

  @Input()
  disable: boolean = false; // whether input is disabled

  @Input()
  value: string = ''; // search string

  @Input()
  debounce: number = 250; // time to wait for changes (milliseconds)

  @Output('update')
  change: EventEmitter<string> = new EventEmitter<string>(); // change event emitter

  searchField = new FormControl(''); // form control for the search input

  constructor() {}

  ngOnInit() {
    this.searchField = new FormControl({
      value: this.value,
      disabled: this.disable
    });
    this.searchField.valueChanges
      .pipe(debounceTime(this.debounce)) // wait specified interval for any changes
      .pipe(distinctUntilChanged()) // only emit event if search string has changed
      .subscribe((value) => {
        this.change.emit(this.searchField.value);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value) {
      this.value = changes.value.currentValue;
      this.searchField.setValue(this.value);
    }

    if (changes.disable) {
      this.disable = changes.disable.currentValue;
      this.disable ? this.searchField.disable() : this.searchField.enable();
    }
  }

  clear() {
    this.searchField.setValue('');
  }
}
