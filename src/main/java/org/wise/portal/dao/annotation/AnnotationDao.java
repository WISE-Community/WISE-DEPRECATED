/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 * 
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.dao.annotation;

import java.util.List;

import org.wise.portal.dao.SimpleDao;
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
	
	public Annotation getAnnotationByFromUserInfoToUserInfoNodeIdType(UserInfo fromUserInfo, UserInfo toUserInfo, String nodeId, String type);
	
	public Annotation getAnnotationByFromUserInfoToUserInfoType(UserInfo fromUserInfo, UserInfo toUserInfo, String type);
	
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
	
	public List<Annotation> getAnnotationByFromWorkgroupsToWorkgroupWithoutWork(List<UserInfo> fromUsers, UserInfo toUser, List<String> annotationTypes);
	
	public List<Annotation> getAnnotationsByRunIdAndNodeId(Long runId, String nodeId);
	
	public List<Annotation> getAnnotationList();
}
