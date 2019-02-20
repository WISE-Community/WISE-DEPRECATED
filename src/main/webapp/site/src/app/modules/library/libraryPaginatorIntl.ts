import { I18n } from "@ngx-translate/i18n-polyfill";
import { MatPaginatorIntl } from "@angular/material";
import { Injectable } from "@angular/core";

@Injectable()
export class LibraryPaginatorIntl extends MatPaginatorIntl {
  itemsPerPageLabel = this.i18n('Show:');
  nextPageLabel     = this.i18n('Next page');
  previousPageLabel = this.i18n('Previous page');

  constructor(private i18n: I18n) {
    super();
  }

  getRangeLabel = function (page, pageSize, length) {
    if (length == 0 || pageSize == 0) { 
      return this.i18n('0 of {{total}}', {total: length});
    }
    length = Math.max(length, 0); 
    const startIndex = page * pageSize; 
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize; 
    return this.i18n('{{start}} - {{end}} of {{total}}', {start: startIndex + 1, end: endIndex, total: length});
  };
}
