import { MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from '@angular/core';

@Injectable()
export class LibraryPaginatorIntl extends MatPaginatorIntl {
  itemsPerPageLabel = $localize`Show:`;
  nextPageLabel = $localize`Next page`;
  previousPageLabel = $localize`Previous page`;

  getRangeLabel = function (page, pageSize, length) {
    if (length == 0 || pageSize == 0) {
      return $localize`0 of ${length}:total:`;
    }
    const startIndex = page * pageSize + 1;
    const endIndex =
      startIndex < length ? Math.min(startIndex + pageSize - 1, length) : startIndex + pageSize - 1;
    return $localize`${startIndex}:start: - ${endIndex}:end: of ${length}:total:`;
  };
}
