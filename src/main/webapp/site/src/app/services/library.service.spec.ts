import { TestBed, inject } from '@angular/core/testing';
import { LibraryService } from './library.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { configureTestSuite } from 'ng-bullet';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('LibraryService', () => {
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [LibraryService],
      imports: [HttpClientTestingModule, RouterTestingModule]
    });
  });

  it('should be created', inject([LibraryService], (service: LibraryService) => {
    expect(service).toBeTruthy();
  }));

  it('should convert LibraryGroup JSON object into LibraryGroup object', inject(
    [LibraryService],
    (service: LibraryService) => {
      const libraryGroupsJSON = [
        {
          id: '6thGrade',
          name: '6th grade projects',
          type: 'group',
          children: [
            {
              id: 2,
              dateCreated: '2019-02-21',
              name: 'sample project',
              owner: {},
              sharedOwners: [],
              projectThumb: '17/assets/projectThumb.png',
              type: 'project',
              wiseVersion: 5
            }
          ]
        }
      ];
      const convertedLibraryGroups = service.convertLibraryGroups(libraryGroupsJSON);
      expect(convertedLibraryGroups[0].children[0].constructor.name).toEqual('LibraryProject');
    }
  ));
});
