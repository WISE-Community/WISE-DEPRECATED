import { Component, EventEmitter, Input, Output } from "@angular/core";


@Component({
  selector: 'notebook-launcher',
  templateUrl: 'notebook-launcher.component.html'
})
export class NotebookLauncherComponent {
  
  @Input()
  config: any;

  @Input()
  noteCount: number;

  @Input()
  notesVisible: boolean;

  @Output()
  onOpen: EventEmitter<any> = new EventEmitter();

  translationData: any;
  isOpen: boolean;

  ngOnInit(): void {
    this.translationData = {
      noteLabel: this.config.itemTypes.note.label.singular
    }
  }

  fabAction($event: any): void {
    if (this.notesVisible) {
      this.open($event, 'new');
    } else {
      this.open($event, 'note');
    }
  }

  open($event: any, target: any): void {
    $event.stopPropagation();
    this.onOpen.emit({value: target, event: $event});
    this.isOpen = false;
  }

  fabLabel(): string {
    if (this.notesVisible) {
      return $localize`Add ${ this.config.itemTypes.note.label.singular }`;
    } else {
      return this.config.label;
    }
  }

  isShowButton(): boolean {
    return !this.notesVisible || this.config.itemTypes.note.enableAddNote;
  }
}