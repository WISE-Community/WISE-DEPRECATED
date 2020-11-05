import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ConfigService } from "../../services/configService";
import { ProjectAssetService } from "../../../site/src/app/services/projectAssetService";
import ClassicEditor from '../../lib/custom-ckeditor/ckeditor';
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { Subject, Subscription } from "rxjs";

@Component({
  selector: 'wise-ckeditor',
  templateUrl: 'wise-ckeditor.component.html'
})
export class WiseCkeditorComponent {
  public editorClass = ClassicEditor;
  public editor: any;
  public config: any;

  @Input()
  model: any;

  @Output()
  modelChange: EventEmitter<string> = new EventEmitter<string>();

  debouncer: Subject<string> = new Subject<string>();
  debouncerSubscription: Subscription;

  constructor(
      private ConfigService: ConfigService,
      private ProjectAssetService: ProjectAssetService) {
    this.debouncerSubscription = this.debouncer.pipe(debounceTime(1000)).subscribe((value) => {
      this.modelChange.emit(value);
    });
  }

  ngOnInit() {
    this.config = {
      toolbar: {
        items: [
          'heading',
          '|',
          'bold',
          'italic',
          'link',
          'bulletedList',
          'numberedList',
          '|',
          'indent',
          'outdent',
          '|',
          'blockQuote',
          'insertTable',
          'mediaEmbed',
          'insertWISEAsset',
          '|',
          'undo',
          'redo'
        ]
      }
    };
  }

  ngOnDestroy() {
    this.debouncerSubscription.unsubscribe();
  }

  onReady(editor: any) {
    this.editor = editor;
    this.editor.listenTo(this.editor, 'openWISEAssetChooser', (eventInfo) => {
      const params = {
        isPopup: true
      };
      this.ProjectAssetService.openAssetChooser(params).then((result) => {
        const fileName = result.assetItem.fileName;
        const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
        this.editor.fire('insertWISEAsset', { fullFilePath: fullFilePath });
      });
    });
  }

  onChange({ editor }) {
    this.debouncer.next(editor.getData());
  }
}
