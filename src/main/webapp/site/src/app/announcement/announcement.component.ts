import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnnouncementComponent implements OnInit {
  @Input()
  message: string = '';

  @Input()
  action: string = '';

  @Output('callback')
  doCallback: EventEmitter<any> = new EventEmitter<any>();

  @Output('dismiss')
  doDismiss: EventEmitter<any> = new EventEmitter<any>();

  show: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  dismiss() {
    this.doDismiss.emit();
    this.show = false;
  }

  callback() {
    this.doCallback.emit();
  }
}
