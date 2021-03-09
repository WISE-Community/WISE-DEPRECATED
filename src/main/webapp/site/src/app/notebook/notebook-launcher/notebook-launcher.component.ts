import { Component, Input } from '@angular/core';
import { NotebookService } from '../../../../../wise5/services/notebookService';

@Component({
  selector: 'notebook-launcher',
  templateUrl: 'notebook-launcher.component.html'
})
export class NotebookLauncherComponent {
  @Input()
  notebookConfig: any;

  label: string = '';

  constructor(private NotebookService: NotebookService) {}

  ngOnInit(): void {
    this.label = this.notebookConfig.itemTypes.note.label.link;
  }

  showNotes(): void {
    this.NotebookService.setNotesVisible(true);
  }
}
