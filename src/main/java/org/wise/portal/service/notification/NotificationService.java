package org.wise.portal.service.notification;

import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.vle.domain.notification.Notification;

public interface NotificationService {

  Notification getNotificationById(Integer notificationId) throws ObjectNotFoundException;

  Notification saveNotification(Notification notification);
}
