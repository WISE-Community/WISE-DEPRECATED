package org.wise.portal.dao.annotation;

import java.util.List;

import net.sf.sail.webapp.dao.SimpleDao;

import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;

public interface AnnotationDao<T extends Annotation> extends SimpleDao<T> {
	
	public Annotation getAnnotationById(Long id);
	
	public void saveAnnotation(Annotation annotation);
	
	public List<Annotation> getAnnotationByFromWorkgroupAndWorkByToWorkgroup(UserInfo fromWorkgroup, List<StepWork> workByToWorkgroup, Class<?> clazz);
	
	public List<Annotation> getAnnotationByFromWorkgroupsAndWorkByToWorkgroup(List<UserInfo> fromWorkgroups, List<StepWork> workByToWorkgroup, Class<?> clazz);
	
	public List<? extends Annotation> getAnnotationByRunId(Long runId, Class<?> clazz);
	
	public List<? extends Annotation> getAnnotationByRunIdAndType(Long runId, String type, Class<?> clazz);
	
	public Annotation getAnnotationByUserInfoAndStepWork(UserInfo userInfo, StepWork stepWork, String type);
	
	public Annotation getAnnotationByFromUserInfoToUserInfoStepWorkType(UserInfo fromUserInfo, UserInfo toUserInfo, StepWork stepWork, String type);
	
	public List<Annotation> getAnnotationByFromWorkgroupsAndStepWork(List<UserInfo> fromWorkgroups, StepWork stepWork, String type);
	
	public List<Annotation> getAnnotationByStepWork(StepWork stepWork, Class<?> clazz);
	
	public List<Annotation> getAnnotationByFromUserToUserType(List<UserInfo> fromUsers, UserInfo toUser, String annotationType);
	
	public List<Annotation> getAnnotationByToUserType(UserInfo toUser, String annotationType);
	
	public Annotation getAnnotationByStepWorkAndAnnotationType(StepWork stepWork, String annotationType);
	
	public Annotation getLatestAnnotationByStepWork(List<StepWork> stepWorks, List<String> workgroupIds, String type);
	
	public Annotation getLatestAnnotationByStepWork(List<StepWork> stepWorks, String type);
	
	public Annotation getLatestCRaterScoreByStepWork(List<StepWork> stepWorks);
	
	public Annotation getLatestAnnotationScoreByStepWork(List<StepWork> stepWorks, List<String> workgroupIds);
	
	public Annotation getLatestAnnotationCommentByStepWork(List<StepWork> stepWorks, List<String> workgroupIds);
	
	public Annotation getCRaterAnnotationByStepWork(StepWork stepWork);
	
	public List<Annotation> getAnnotationByStepWorkList(List<StepWork> stepWorkList);
	
	public List<Annotation> getAnnotationList();
}
