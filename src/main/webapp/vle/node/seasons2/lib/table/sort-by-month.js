SortableTable.addSortType('month', function (a, b) {
  var monthData = {
      "jan": { index:  0, num:   1, short_name: 'JAN', long_name: 'January' },
      "feb": { index:  1, num:   2, short_name: 'FEB', long_name: 'February' },
      "mar": { index:  2, num:   3, short_name: 'MAR', long_name: 'March' },
      "apr": { index:  3, num:   4, short_name: 'APR', long_name: 'April' },
      "may": { index:  4, num:   5, short_name: 'MAY', long_name: 'May' },
      "jun": { index:  5, num:   6, short_name: 'JUN', long_name: 'June' },
      "jul": { index:  6, num:   7, short_name: 'JUL', long_name: 'July' },
      "aug": { index:  7, num:   8, short_name: 'AUG', long_name: 'August' },
      "sep": { index:  8, num:   9, short_name: 'SEP', long_name: 'September' },
      "oct": { index:  9, num:  10, short_name: 'OCT', long_name: 'October' },
      "nov": { index: 10, num:  11, short_name: 'NOV', long_name: 'Novemeber' },
      "dec": { index: 11, num:  12, short_name: 'DEC', long_name: 'December' }
    },
    month1 = monthData[a.toLowerCase()].index,
    month2 = monthData[b.toLowerCase()].index;
  return month1 < month2 ? -1 : month1 === month2 ? 0 : 1;
});