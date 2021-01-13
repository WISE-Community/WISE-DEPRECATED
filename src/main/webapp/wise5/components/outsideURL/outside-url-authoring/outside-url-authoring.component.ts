import { Component, ViewEncapsulation } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProjectAssetService } from '../../../../site/src/app/services/projectAssetService';
import { ComponentAuthoring } from '../../../authoringTool/components/component-authoring.component';
import { ConfigService } from '../../../services/configService';
import { NodeService } from '../../../services/nodeService';
import { TeacherProjectService } from '../../../services/teacherProjectService';
import { OutsideURLService } from '../outsideURLService';

@Component({
  selector: 'outside-url-authoring',
  templateUrl: 'outside-url-authoring.component.html',
  styleUrls: ['outside-url-authoring.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OutsideUrlAuthoring extends ComponentAuthoring {
  isShowOERs: boolean;
  allOpenEducationalResources: any[];
  filteredOpenEducationalResources: any[];
  outsideURLIFrameId: string;
  subjects: any[] = [
    {
      value: 'Earth and Space Sciences',
      label: $localize`Earth and Space Sciences`
    },
    {
      value: 'Life Sciences',
      label: $localize`Life Sciences`
    },
    {
      value: 'Physical Sciences',
      label: $localize`Physical Sciences`
    },
    {
      value: 'Engineering, Technology, and Applications of Science',
      label: $localize`Engineering, Technology, and Applications of Science`
    }
  ];
  searchText: string;
  selectedSubjects: any[];
  urlChange: Subject<string> = new Subject<string>();
  widthChange: Subject<string> = new Subject<string>();
  heightChange: Subject<string> = new Subject<string>();
  urlChangedSubscription: Subscription;
  widthChangedSubscription: Subscription;
  heightChangedSubscription: Subscription;

  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected OutsideURLService: OutsideURLService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService
  ) {
    super(ConfigService, NodeService, ProjectAssetService, ProjectService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.outsideURLIFrameId = 'outsideResource_' + this.componentId;
    this.isShowOERs = this.componentContent.url === '';
    this.searchText = '';
    this.selectedSubjects = [];
    this.OutsideURLService.getOpenEducationalResources().then((openEducationalResources: any) => {
      this.allOpenEducationalResources = openEducationalResources.sort((a, b) =>
        a.metadata.title.localeCompare(b.metadata.title)
      );
      this.filteredOpenEducationalResources = this.allOpenEducationalResources;
    });
    this.urlChangedSubscription = this.urlChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((url: string) => {
        this.authoringComponentContent.url = url;
        this.authoringComponentContent.info = null;
        this.componentChanged();
      });
    this.widthChangedSubscription = this.widthChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
    this.heightChangedSubscription = this.heightChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
  }

  ngOnDestroy() {
    this.urlChangedSubscription.unsubscribe();
    this.widthChangedSubscription.unsubscribe();
    this.heightChangedSubscription.unsubscribe();
  }

  chooseOpenEducationalResource(openEducationalResource: any): void {
    this.authoringComponentContent.url = openEducationalResource.url;
    this.authoringComponentContent.info = openEducationalResource.info;
    this.componentChanged();
  }

  isResourceSelected(resourceUrl: string): boolean {
    return resourceUrl === this.authoringComponentContent.url;
  }

  reloadResource(): void {
    const iframe: any = document.getElementById(this.outsideURLIFrameId);
    iframe.src = '';
    iframe.src = this.authoringComponentContent.url;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedSubjects = [];
    this.searchFieldChanged();
  }

  searchFieldChanged(): void {
    this.filteredOpenEducationalResources = this.allOpenEducationalResources.filter((oer) => {
      if (this.isAnySubjectChosen()) {
        return (
          this.isTextMatch(this.searchText, JSON.stringify(oer)) &&
          this.isSubjectMatch(this.selectedSubjects, oer)
        );
      }
      return this.isTextMatch(this.searchText, JSON.stringify(oer));
    });
  }

  isTextMatch(searchText: string, testText: string): boolean {
    return testText.toLowerCase().includes(searchText.toLowerCase());
  }

  isAnySubjectChosen(): boolean {
    return this.selectedSubjects.length > 0;
  }

  isSubjectMatch(selectedSubjects: any[], resource: any): boolean {
    for (const subject of selectedSubjects) {
      if (resource.metadata.subjects.includes(subject)) {
        return true;
      }
    }
    return false;
  }
}
