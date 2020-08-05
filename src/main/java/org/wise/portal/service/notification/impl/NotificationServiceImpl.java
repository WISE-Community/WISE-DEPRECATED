package org.wise.portal.service.notification.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.notification.NotificationDao;
import org.wise.portal.service.notification.NotificationService;
import org.wise.vle.domain.notification.Notification;

@Service
public class NotificationServiceImpl implements NotificationService {

  @Autowired
  NotificationDao<Notification> notificationDao;

  public Notification getNotificationById(Integer notificationId) throws ObjectNotFoundException {
    return (Notification) notificationDao.getById(notificationId);
  }

  public Notification saveNotification(Notification notification) {
    notificationDao.save(notification);
    return notification;
  }

}
