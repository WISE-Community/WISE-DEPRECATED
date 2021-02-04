'use strict';

import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProjectAssetService } from '../../../../site/src/app/services/projectAssetService';
import { ComponentAuthoring } from '../../../authoringTool/components/component-authoring.component';
import { ConfigService } from '../../../services/configService';
import { NodeService } from '../../../services/nodeService';
import { TeacherProjectService } from '../../../services/teacherProjectService';
import { UtilService } from '../../../services/utilService';

@Component({
  selector: 'audio-oscillator-authoring',
  templateUrl: 'audio-oscillator-authoring.component.html',
  styleUrls: ['audio-oscillator-authoring.component.scss']
})
export class AudioOscillatorAuthoring extends ComponentAuthoring {
  sineChecked: boolean;
  squareChecked: boolean;
  triangleChecked: boolean;
  sawtoothChecked: boolean;
  inputChange: Subject<string> = new Subject<string>();
  inputChangeSubscription: Subscription;

  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService,
    protected UtilService: UtilService
  ) {
    super(ConfigService, NodeService, ProjectAssetService, ProjectService);
    this.inputChangeSubscription = this.inputChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.populateCheckedOscillatorTypes();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.inputChangeSubscription.unsubscribe();
  }

  populateCheckedOscillatorTypes(): void {
    if (this.authoringComponentContent.oscillatorTypes.includes('sine')) {
      this.sineChecked = true;
    }
    if (this.authoringComponentContent.oscillatorTypes.includes('square')) {
      this.squareChecked = true;
    }
    if (this.authoringComponentContent.oscillatorTypes.includes('triangle')) {
      this.triangleChecked = true;
    }
    if (this.authoringComponentContent.oscillatorTypes.includes('sawtooth')) {
      this.sawtoothChecked = true;
    }
  }

  oscillatorTypeClicked(): void {
    this.authoringComponentContent.oscillatorTypes = [];
    if (this.sineChecked) {
      this.authoringComponentContent.oscillatorTypes.push('sine');
    }
    if (this.squareChecked) {
      this.authoringComponentContent.oscillatorTypes.push('square');
    }
    if (this.triangleChecked) {
      this.authoringComponentContent.oscillatorTypes.push('triangle');
    }
    if (this.sawtoothChecked) {
      this.authoringComponentContent.oscillatorTypes.push('sawtooth');
    }
    this.componentChanged();
  }
}
