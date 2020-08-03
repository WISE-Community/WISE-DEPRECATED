import { MatPaginatorIntl } from "@angular/material/paginator";
import { Injectable } from "@angular/core";

@Injectable()
export class LibraryPaginatorIntl extends MatPaginatorIntl {
  itemsPerPageLabel = $localize`Show:`;
  nextPageLabel     = $localize`Next page`;
  previousPageLabel = $localize`Previous page`;

  constructor() {
    super();
  }

  getRangeLabel = function (page, pageSize, length) {
    if (length == 0 || pageSize == 0) {
      return $localize`0 of ${length}:total:`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return $localize`${startIndex}:start: - ${endIndex}:end: of ${length}:total:`;
  };
}
