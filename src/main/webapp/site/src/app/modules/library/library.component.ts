import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LibraryService } from "../../services/library.service";
import { LibraryGroup } from "./libraryGroup";

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LibraryComponent implements OnInit {

  libraryGroups: LibraryGroup[] = [];
  filteredLibraryGroups: LibraryGroup[] = [];
  filter: string = '';
  arrangement: string = 'californiaIntegrated';
  expandedGroups: object = {};
  initialGroup: number = 0;

  constructor(private libraryService: LibraryService) { }

  ngOnInit() {
    this.getLibraryGroups();
  }

  getLibraryGroups() {
    this.libraryService.getLibraryGroups()
      .subscribe(libraryGroups => {
        this.libraryGroups = libraryGroups;
        this.filteredLibraryGroups = libraryGroups;
        this.filterUpdated(this.filter);

        // randomly select group to expand on load
        this.initialGroup = Math.floor(Math.random() * (this.libraryGroups.length));
      });
  }

  filterUpdated(value: string) {
    this.filter = value;
    //this.filteredRuns = this.search ? this.performFilter(this.search) : this.runs;
  }
}
