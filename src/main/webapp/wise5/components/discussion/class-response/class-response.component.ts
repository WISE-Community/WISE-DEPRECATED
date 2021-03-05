import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ConfigService } from '../../../services/configService';

@Component({
  selector: 'class-response',
  templateUrl: 'class-response.component.html',
  styleUrls: ['class-response.component.scss']
})
export class ClassResponse {
  @Input()
  response: any;

  @Input()
  numreplies: number;

  @Input()
  mode: any;

  @Input()
  isdisabled: any;

  @Output()
  submitButtonClicked: any = new EventEmitter();

  @Output()
  deleteButtonClicked: any = new EventEmitter();

  @Output()
  undoDeleteButtonClicked: any = new EventEmitter();

  urlMatcher: any = /((http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?)/g;
  expanded: boolean = false;
  repliesToShow: any[] = [];

  constructor(private ConfigService: ConfigService) {}

  ngOnInit(): void {
    this.isdisabled = this.isdisabled === 'true';
    this.injectLinksIntoResponse();
    this.injectLinksIntoReplies();
    if (this.hasAnyReply()) {
      this.showLastReply();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.numreplies != null && !changes.numreplies.isFirstChange()) {
      this.expanded = true;
      this.injectLinksIntoReplies();
      this.showAllReplies();
    }
  }

  injectLinksIntoResponse(): void {
    this.response.studentData.responseTextHTML = this.injectLinks(
      this.response.studentData.response
    );
  }

  injectLinksIntoReplies(): void {
    this.response.replies.forEach((replyComponentState: any): void => {
      replyComponentState.studentData.responseHTML = this.injectLinks(
        replyComponentState.studentData.response
      );
    });
  }

  injectLinks(response: string): string {
    return response.replace(this.urlMatcher, (match) => {
      let matchUrl = match;
      if (!match.startsWith('http')) {
        /*
         * The url does not begin with http so we will add // to the beginning of it so that the
         * browser treats the url as an absolute link and not a relative link. The browser will also
         * use the same protocol that the current page is loaded with (http or https).
         */
        matchUrl = '//' + match;
      }
      return `<a href="${matchUrl}" target="_blank">${match}</a>`;
    });
  }

  getAvatarColorForWorkgroupId(workgroupId: number): string {
    return this.ConfigService.getAvatarColorForWorkgroupId(workgroupId);
  }

  adjustClientSaveTime(time: any): number {
    return this.ConfigService.convertToClientTimestamp(time);
  }

  replyEntered($event: any): void {
    if (this.isEnterKeyEvent($event)) {
      $event.preventDefault();
      this.response.replyText = this.removeLastChar(this.response.replyText);
      this.expandAndShowAllReplies();
      this.submitButtonClicked.emit(this.response);
    }
  }

  isEnterKeyEvent(event: any): boolean {
    return event.keyCode == 13 && !event.shiftKey && this.response.replyText;
  }

  removeLastChar(responseText: string): string {
    return responseText.substring(0, responseText.length - 1);
  }

  delete(componentState: any): void {
    if (confirm($localize`Are you sure you want to delete this post?`)) {
      this.deleteButtonClicked.emit(componentState);
    }
  }

  undoDelete(componentState: any): void {
    if (confirm($localize`Are you sure you want to show this post?`)) {
      this.undoDeleteButtonClicked.emit(componentState);
    }
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.showAllReplies();
    } else {
      this.showLastReply();
    }
  }

  hasAnyReply(): boolean {
    return this.response.replies.length > 0;
  }

  showLastReply(): void {
    if (this.response.replies.length > 0) {
      this.repliesToShow = [this.response.replies[this.response.replies.length - 1]];
    }
  }

  showAllReplies(): void {
    this.repliesToShow = this.response.replies;
  }

  expandAndShowAllReplies(): void {
    this.expanded = true;
    this.showAllReplies();
  }
}
