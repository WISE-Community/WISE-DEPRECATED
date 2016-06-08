package org.wise.portal.dao.notification;

import org.wise.portal.dao.SimpleDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.vle.domain.notification.Notification;

import java.util.List;

/**
 * Domain Access Object for Notification
 * @author Hiroki Terashima
 */
public interface NotificationDao<T extends Notification> extends SimpleDao<T> {

    List<Notification> getNotificationListByParams(
            Integer id, Run run, Group period, WISEWorkgroup toWorkgroup,
            String nodeId, String componentId);
}
