import { Component, ViewEncapsulation } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProjectAssetService } from '../../../../site/src/app/services/projectAssetService';
import { ComponentAuthoring } from '../../../authoringTool/components/component-authoring.component';
import { ConfigService } from '../../../services/configService';
import { NodeService } from '../../../services/nodeService';
import { TeacherProjectService } from '../../../services/teacherProjectService';
import { UtilService } from '../../../services/utilService';

@Component({
  selector: 'multiple-choice-authoring',
  templateUrl: 'multiple-choice-authoring.component.html',
  styleUrls: ['multiple-choice-authoring.component.scss']
})
export class MultipleChoiceAuthoring extends ComponentAuthoring {
  allowedConnectedComponentTypes = ['MultipleChoice'];
  choiceTextChange: Subject<string> = new Subject<string>();
  feedbackTextChange: Subject<string> = new Subject<string>();
  choiceTextChangeSubscription: Subscription;
  feedbackTextChangeSubscription: Subscription;

  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService,
    protected UtilService: UtilService
  ) {
    super(ConfigService, NodeService, ProjectAssetService, ProjectService);
    this.choiceTextChangeSubscription = this.choiceTextChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
    this.feedbackTextChangeSubscription = this.feedbackTextChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
  }

  ngOnDestroy(): void {
    this.choiceTextChangeSubscription.unsubscribe();
    this.feedbackTextChangeSubscription.unsubscribe();
  }

  feedbackChanged(): void {
    let show = true;
    if (!this.componentHasFeedback()) {
      show = false;
    }
    this.setShowSubmitButtonValue(show);
    this.componentChanged();
  }

  componentHasFeedback(): boolean {
    for (const choice of this.authoringComponentContent.choices) {
      if (choice.isCorrect || (choice.feedback != null && choice.feedback !== '')) {
        return true;
      }
    }
    return false;
  }

  addChoice(): void {
    const newChoice = {
      id: this.UtilService.generateKey(10),
      text: '',
      feedback: '',
      isCorrect: false
    };
    this.authoringComponentContent.choices.push(newChoice);
    this.componentChanged();
  }

  deleteChoice(choiceId: string): void {
    if (confirm($localize`Are you sure you want to delete this choice?`)) {
      const choices = this.authoringComponentContent.choices;
      for (let c = 0; c < choices.length; c++) {
        if (choices[c].id === choiceId) {
          choices.splice(c, 1);
          break;
        }
      }
      this.componentChanged();
    }
  }

  moveChoiceUp(choiceId: string): void {
    const choices = this.authoringComponentContent.choices;
    for (let c = 0; c < choices.length; c++) {
      const choice = choices[c];
      if (choice.id === choiceId) {
        if (c !== 0) {
          choices.splice(c, 1);
          choices.splice(c - 1, 0, choice);
        }
        break;
      }
    }
    this.componentChanged();
  }

  moveChoiceDown(choiceId: string): void {
    const choices = this.authoringComponentContent.choices;
    for (let c = 0; c < choices.length; c++) {
      const choice = choices[c];
      if (choice.id === choiceId) {
        if (c !== choices.length - 1) {
          choices.splice(c, 1);
          choices.splice(c + 1, 0, choice);
        }
        break;
      }
    }
    this.componentChanged();
  }

  chooseChoiceAsset(choice: any): void {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'choice',
      targetObject: choice
    };
    this.openAssetChooser(params);
  }

  assetSelected({ nodeId, componentId, assetItem, target, targetObject }): void {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    if (target === 'choice') {
      targetObject.text = `<img src="${assetItem.fileName}"/>`;
      this.componentChanged();
    }
  }
}
