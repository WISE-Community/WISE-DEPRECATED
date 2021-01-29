import { ComponentService } from '../componentService';
import { ConfigService } from '../../services/configService';
import { TeacherDataService } from '../../services/teacherDataService';
import { UtilService } from '../../services/utilService';
import { UpgradeModule } from '@angular/upgrade/static';
import { StudentDataService } from '../../services/studentDataService';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class DiscussionService extends ComponentService {
  TeacherDataService: TeacherDataService;

  constructor(
    private upgrade: UpgradeModule,
    private http: HttpClient,
    private ConfigService: ConfigService,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    super(StudentDataService, UtilService);
    if (['classroomMonitor', 'author'].includes(this.ConfigService.getMode())) {
      /*
       * In the Classroom Monitor, we need access to the TeacherDataService so we can retrieve posts
       * for all students.
       */
      this.TeacherDataService = this.upgrade.$injector.get('TeacherDataService');
    }
  }

  getComponentTypeLabel() {
    return this.getTranslation('discussion.componentTypeLabel');
  }

  getTranslation(key: string) {
    return this.upgrade.$injector.get('$filter')('translate')(key);
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'Discussion';
    component.prompt = '';
    component.isStudentAttachmentEnabled = true;
    component.gateClassmateResponses = true;
    return component;
  }

  isCompleted(component: any, componentStates: any[], componentEvents: any[], nodeEvents: any[]) {
    if (this.hasShowWorkConnectedComponentThatHasWork(component)) {
      return this.hasNodeEnteredEvent(nodeEvents);
    }
    return this.hasAnyComponentStateWithResponse(componentStates);
  }

  hasAnyComponentStateWithResponse(componentStates: any[]) {
    for (const componentState of componentStates) {
      if (componentState.studentData.response != null) {
        return true;
      }
    }
    return false;
  }

  hasShowWorkConnectedComponentThatHasWork(componentContent: any) {
    const connectedComponents = componentContent.connectedComponents;
    if (connectedComponents != null) {
      for (const connectedComponent of connectedComponents) {
        if (connectedComponent.type === 'showWork') {
          const componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
            connectedComponent.nodeId,
            connectedComponent.componentId
          );
          if (componentStates.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  hasNodeEnteredEvent(nodeEvents: any[]) {
    for (const nodeEvent of nodeEvents) {
      if (nodeEvent.event === 'nodeEntered') {
        return true;
      }
    }
    return false;
  }

  getClassmateResponses(runId: number, periodId: number, components: any[]) {
    return new Promise((resolve, reject) => {
      let params = new HttpParams()
        .set('runId', runId + '')
        .set('periodId', periodId + '')
        .set('getStudentWork', true + '')
        .set('getAnnotations', true + '');
      for (const component of components) {
        params = params.append('components', JSON.stringify(component));
      }
      const options = {
        params: params
      };
      const url = this.ConfigService.getConfigParam('studentDataURL');
      this.http
        .get(url, options)
        .toPromise()
        .then((data) => {
          resolve(data);
        });
    });
  }

  workgroupHasWorkForComponent(workgroupId: number, componentId: string) {
    return (
      this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(
        workgroupId,
        componentId
      ).length > 0
    );
  }

  getPostsAssociatedWithComponentIdsAndWorkgroupId(componentIds: string[], workgroupId: number) {
    let allPosts = [];
    const topLevelComponentStateIdsFound = [];
    const componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentIds(
      workgroupId,
      componentIds
    );
    for (const componentState of componentStates) {
      const componentStateIdReplyingTo = componentState.studentData.componentStateIdReplyingTo;
      if (this.isTopLevelPost(componentState)) {
        if (
          !this.isTopLevelComponentStateIdFound(topLevelComponentStateIdsFound, componentState.id)
        ) {
          allPosts = allPosts.concat(
            this.getPostAndAllRepliesByComponentIds(componentIds, componentState.id)
          );
          topLevelComponentStateIdsFound.push(componentState.id);
        }
      } else {
        if (
          !this.isTopLevelComponentStateIdFound(
            topLevelComponentStateIdsFound,
            componentStateIdReplyingTo
          )
        ) {
          allPosts = allPosts.concat(
            this.getPostAndAllRepliesByComponentIds(componentIds, componentStateIdReplyingTo)
          );
          topLevelComponentStateIdsFound.push(componentStateIdReplyingTo);
        }
      }
    }
    return allPosts;
  }

  isTopLevelPost(componentState: any) {
    return componentState.studentData.componentStateIdReplyingTo == null;
  }

  isTopLevelComponentStateIdFound(
    topLevelComponentStateIdsFound: string[],
    componentStateId: string
  ) {
    return topLevelComponentStateIdsFound.indexOf(componentStateId) !== -1;
  }

  getPostAndAllRepliesByComponentIds(componentIds: string[], componentStateId: string) {
    const postAndAllReplies = [];
    const componentStatesForComponentIds = this.TeacherDataService.getComponentStatesByComponentIds(
      componentIds
    );
    for (const componentState of componentStatesForComponentIds) {
      if (componentState.id === componentStateId) {
        postAndAllReplies.push(componentState);
      } else {
        const componentStateIdReplyingTo = componentState.studentData.componentStateIdReplyingTo;
        if (componentStateIdReplyingTo === componentStateId) {
          postAndAllReplies.push(componentState);
        }
      }
    }
    return postAndAllReplies;
  }

  componentUsesSaveButton() {
    return false;
  }

  componentUsesSubmitButton() {
    return false;
  }

  componentStateHasStudentWork(componentState: any, componentContent: any) {
    if (this.isStudentWorkHasAttachment(componentState)) {
      return true;
    }
    if (this.isComponentHasStarterSentence(componentContent)) {
      return (
        this.isStudentWorkHasText(componentState) &&
        this.isStudentResponseDifferentFromStarterSentence(componentState, componentContent)
      );
    } else {
      return this.isStudentWorkHasText(componentState);
    }
  }

  isComponentHasStarterSentence(componentContent: any) {
    const starterSentence = componentContent.starterSentence;
    return starterSentence != null && starterSentence !== '';
  }

  isStudentResponseDifferentFromStarterSentence(componentState: any, componentContent: any) {
    const response = componentState.studentData.response;
    const starterSentence = componentContent.starterSentence;
    return response !== starterSentence;
  }

  isStudentWorkHasText(componentState: any) {
    const response = componentState.studentData.response;
    return response != null && response !== '';
  }

  isStudentWorkHasAttachment(componentState: any) {
    const attachments = componentState.studentData.attachments;
    return attachments != null && attachments.length > 0;
  }
}
