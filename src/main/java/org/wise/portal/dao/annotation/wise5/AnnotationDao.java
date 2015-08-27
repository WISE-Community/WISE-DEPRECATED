package org.wise.portal.dao.annotation.wise5;

import org.wise.portal.dao.SimpleDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.vle.domain.annotation.wise5.Annotation;
import org.wise.vle.domain.work.StudentWork;

import java.util.List;

/**
 * @author Hiroki Terashima
 */
public interface AnnotationDao<T extends Annotation> extends SimpleDao<T> {

    /**
     * @return List of Annotations that match the specified parameters
     */
    List<Annotation> getAnnotationsByParams(
            Integer id, Run run, Group period, WISEWorkgroup fromWorkgroup, WISEWorkgroup toWorkgroup,
            String nodeId, String componentId, StudentWork studentWork, String type);
}
