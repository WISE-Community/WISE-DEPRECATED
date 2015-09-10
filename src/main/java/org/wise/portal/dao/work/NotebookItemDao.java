package org.wise.portal.dao.work;

import org.wise.portal.dao.SimpleDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.vle.domain.work.NotebookItem;

import java.util.List;

/**
 * Domain Access Object for NotebookItem
 * @author Hiroki Terashima
 */
public interface NotebookItemDao<T extends NotebookItem> extends SimpleDao<T> {

    List<NotebookItem> getNotebookItemListByParams(
            Integer id, Run run, Group period, WISEWorkgroup workgroup,
            String nodeId, String componentId);
}
