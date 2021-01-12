import * as angular from 'angular';
import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigService } from './configService';
import { ProjectService } from './projectService';
import { UtilService } from './utilService';
import { Notification } from '../../site/src/app/domain/notification';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class NotificationService {
  notifications: Notification[] = [];
  private notificationChangedSource: Subject<any> = new Subject<any>();
  public notificationChanged$: Observable<any> = this.notificationChangedSource.asObservable();
  private setGlobalMessageSource: Subject<any> = new Subject<any>();
  public setGlobalMessage$: Observable<any> = this.setGlobalMessageSource.asObservable();
  private setIsJSONValidSource: Subject<any> = new Subject<any>();
  public setIsJSONValid$: Observable<any> = this.setIsJSONValidSource.asObservable();
  private serverConnectionStatusSource: Subject<any> = new Subject<any>();
  public serverConnectionStatus$: Observable<any> = this.serverConnectionStatusSource.asObservable();
  private viewCurrentAmbientNotificationSource: Subject<any> = new Subject<any>();
  public viewCurrentAmbientNotification$: Observable<any> = this.viewCurrentAmbientNotificationSource.asObservable();

  constructor(
    private upgrade: UpgradeModule,
    private http: HttpClient,
    private ConfigService: ConfigService,
    private ProjectService: ProjectService,
    private UtilService: UtilService
  ) {}

  /**
   * Creates a new notification object
   * @param notificationType type of notification [component, node, annotation, etc]
   * @param nodeId id of node
   * @param componentId id of component
   * @param fromWorkgroupId id of workgroup that created this notification
   * @param toWorkgroupId id of workgroup this notification is for
   * @param message notification message
   * @param data other extra information about this notification
   * @param groupId id that groups multiple notifications together
   * @returns newly created notification object
   */
  createNewNotification(
    runId,
    periodId,
    notificationType,
    nodeId,
    componentId,
    fromWorkgroupId,
    toWorkgroupId,
    message,
    data = null,
    groupId = null
  ): Notification {
    const nodePosition = this.ProjectService.getNodePositionById(nodeId);
    const nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    let componentType = null;
    if (component != null) {
      componentType = component.type;
    }
    return new Notification({
      id: null,
      runId: runId,
      periodId: periodId,
      type: notificationType,
      nodeId: nodeId,
      groupId: groupId,
      componentId: componentId,
      componentType: componentType,
      nodePosition: nodePosition,
      nodePositionAndTitle: nodePositionAndTitle,
      fromWorkgroupId: fromWorkgroupId,
      toWorkgroupId: toWorkgroupId,
      message: message,
      data: data,
      timeGenerated: Date.parse(new Date().toString()),
      timeDismissed: null
    });
  }

  retrieveNotifications() {
    if (this.ConfigService.isPreview()) {
      this.notifications = [];
      return;
    }
    const options: any = {};
    if (this.ConfigService.getMode() === 'studentRun') {
      options.params = new HttpParams()
        .set('periodId', this.ConfigService.getPeriodId())
        .set('toWorkgroupId', this.ConfigService.getWorkgroupId());
    }
    return this.http
      .get(this.ConfigService.getNotificationURL(), options)
      .toPromise()
      .then((notifications: any) => {
        this.notifications = notifications;
        this.notifications.map((notification: Notification) => {
          this.setNotificationNodePositionAndTitle(notification);
        });
        return this.notifications;
      });
  }

  setNotificationNodePositionAndTitle(notification: Notification) {
    notification.nodePosition = this.ProjectService.getNodePositionById(notification.nodeId);
    notification.nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(
      notification.nodeId
    );
  }

  sendNotificationForScore(notificationForScore) {
    const notificationType = notificationForScore.notificationType;
    if (notificationForScore.isNotifyTeacher || notificationForScore.isNotifyStudent) {
      const fromWorkgroupId = this.ConfigService.getWorkgroupId();
      const runId = this.ConfigService.getRunId();
      const periodId = this.ConfigService.getPeriodId();
      const notificationGroupId = runId + '_' + this.UtilService.generateKey(10); // links student and teacher notifications together
      const notificationData: any = {};
      if (notificationForScore.isAmbient) {
        notificationData.isAmbient = true;
      }
      if (notificationForScore.dismissCode != null) {
        notificationData.dismissCode = notificationForScore.dismissCode;
      }
      if (notificationForScore.isNotifyStudent) {
        this.sendNotificationToUser(
          notificationForScore.notificationMessageToStudent,
          fromWorkgroupId,
          notificationForScore,
          runId,
          periodId,
          notificationType,
          this.ConfigService.getWorkgroupId(),
          notificationData,
          notificationGroupId
        ).then((notification) => {
          this.addNotification(notification);
        });
      }
      if (notificationForScore.isNotifyTeacher) {
        this.sendNotificationToUser(
          notificationForScore.notificationMessageToTeacher,
          fromWorkgroupId,
          notificationForScore,
          runId,
          periodId,
          notificationType,
          this.ConfigService.getTeacherWorkgroupId(),
          notificationData,
          notificationGroupId
        );
      }
    }
  }

  private sendNotificationToUser(
    notificationMessageTemplate: string,
    fromWorkgroupId: number,
    notificationForScore: any,
    runId: number,
    periodId: any,
    notificationType: string,
    toWorkgroupId: number,
    notificationData: any,
    notificationGroupId: string
  ) {
    const notificationMessage = notificationMessageTemplate
      .replace('{{username}}', this.ConfigService.getUsernameByWorkgroupId(fromWorkgroupId))
      .replace('{{score}}', notificationForScore.score)
      .replace('{{dismissCode}}', notificationForScore.dismissCode);
    const notification = this.createNewNotification(
      runId,
      periodId,
      notificationType,
      notificationForScore.nodeId,
      notificationForScore.componentId,
      fromWorkgroupId,
      toWorkgroupId,
      notificationMessage,
      notificationData,
      notificationGroupId
    );
    return this.saveNotificationToServer(notification);
  }

  saveNotificationToServer(notification) {
    if (this.ConfigService.isPreview()) {
      return this.pretendServerRequest(notification);
    } else {
      return this.http
        .post(this.ConfigService.getNotificationURL(), notification)
        .toPromise()
        .then((notification: Notification) => {
          return notification;
        });
    }
  }

  dismissNotification(notification) {
    if (this.ConfigService.isPreview()) {
      return this.pretendServerRequest(notification);
    }
    notification.timeDismissed = Date.parse(new Date().toString());
    return this.http
      .post(`${this.ConfigService.getNotificationURL()}/dismiss`, notification)
      .toPromise()
      .then((notification: Notification) => {
        this.addNotification(notification);
      });
  }

  pretendServerRequest(notification) {
    return Promise.resolve(notification);
  }

  /**
   * Returns all notifications for the given parameters
   * @param args object of optional parameters to filter on
   * (e.g. nodeId, componentId, toWorkgroupId, fromWorkgroupId, periodId, type)
   * @returns array of notificaitons
   */
  getNotifications(args) {
    let notifications = this.notifications;
    for (const p in args) {
      if (args.hasOwnProperty(p) && args[p] !== null) {
        notifications = notifications.filter((notification) => {
          return notification[p] === args[p];
        });
      }
    }
    return notifications;
  }

  /**
   * Returns all CRaterResult notifications for given parameters
   * TODO: expand to encompass other notification types that should be shown in classroom monitor
   * @param args object of optional parameters to filter on (e.g. nodeId, componentId, toWorkgroupId, fromWorkgroupId, periodId)
   * @returns array of cRater notificaitons
   */
  getAlertNotifications(args) {
    // get all CRaterResult notifications for the given parameters
    // TODO: expand to encompass other notification types that should be shown to teacher
    let alertNotifications = [];
    const nodeId = args.nodeId;
    const params = args;
    params.type = 'CRaterResult';

    if (args.periodId) {
      params.periodId = args.periodId === -1 ? null : args.periodId;
    }

    if (nodeId && this.ProjectService.isGroupNode(nodeId)) {
      const groupNode = this.ProjectService.getNodeById(nodeId);
      const children = groupNode.ids;
      for (let childId of children) {
        params.nodeId = childId;
        const childAlerts = this.getAlertNotifications(args);
        alertNotifications = alertNotifications.concat(childAlerts);
      }
    } else {
      alertNotifications = this.getNotifications(params);
    }
    return alertNotifications;
  }

  addNotification(notification: Notification) {
    this.setNotificationNodePositionAndTitle(notification);
    for (let n = 0; n < this.notifications.length; n++) {
      if (this.notifications[n].id === notification.id) {
        this.notifications[n] = notification;
        this.broadcastNotificationChanged(notification);
        return;
      }
    }
    this.notifications.push(notification);
    this.broadcastNotificationChanged(notification);
  }

  broadcastNotificationChanged(notification: any) {
    this.notificationChangedSource.next(notification);
  }

  showJSONValidMessage() {
    this.setIsJSONValidMessage(true);
  }

  showJSONInvalidMessage() {
    this.setIsJSONValidMessage(false);
  }

  hideJSONValidMessage() {
    this.setIsJSONValidMessage(null);
  }

  /**
   * Show the message in the toolbar that says "JSON Valid" or "JSON Invalid".
   * @param isJSONValid
   * true if we want to show "JSON Valid"
   * false if we want to show "JSON Invalid"
   * null if we don't want to show anything
   */
  setIsJSONValidMessage(isJSONValid) {
    this.broadcastSetIsJSONValid({ isJSONValid: isJSONValid });
  }

  broadcastSetGlobalMessage(args) {
    this.setGlobalMessageSource.next(args);
  }

  broadcastSetIsJSONValid(args) {
    this.setIsJSONValidSource.next(args);
  }

  broadcastServerConnectionStatus(isConnected: boolean) {
    this.serverConnectionStatusSource.next(isConnected);
  }

  broadcastViewCurrentAmbientNotification(args: any) {
    this.viewCurrentAmbientNotificationSource.next(args);
  }
}
