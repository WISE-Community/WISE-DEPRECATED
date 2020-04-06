import { Component } from '@angular/core';
import { LibraryService } from '../../../services/library.service';

@Component({
  selector: 'app-home-page-project-library',
  templateUrl: './home-page-project-library.component.html',
  styleUrls: ['./home-page-project-library.component.scss', '../library/library.component.scss']
})
export class HomePageProjectLibraryComponent {
  constructor(private libraryService: LibraryService) {
    libraryService.getOfficialLibraryProjects();
  }

  ngOnDestroy() {
    this.libraryService.clearAll();
  }
}
