/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.service.vle.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.annotation.AnnotationDao;
import org.wise.portal.dao.crater.CRaterRequestDao;
import org.wise.portal.dao.node.NodeDao;
import org.wise.portal.dao.statistics.VLEStatisticsDao;
import org.wise.portal.dao.status.RunStatusDao;
import org.wise.portal.dao.status.StudentStatusDao;
import org.wise.portal.dao.userinfo.UserInfoDao;
import org.wise.portal.dao.work.StepWorkDao;
import org.wise.portal.service.vle.VLEService;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.cRater.CRaterRequest;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.statistics.VLEStatistics;
import org.wise.vle.domain.status.RunStatus;
import org.wise.vle.domain.status.StudentStatus;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;

/**
 * Services for the WISE Virtual Learning Environment (WISE VLE v4)
 * 
 * @author Geoffrey Kwan
 * @author Hiroki Terashima
 */
@Service
public class VLEServiceImpl implements VLEService {

  @Autowired
  private UserInfoDao<UserInfo> userInfoDao;

  @Autowired
  private AnnotationDao<Annotation> annotationDao;

  @Autowired
  private NodeDao<Node> nodeDao;

  @Autowired
  private StepWorkDao<StepWork> stepWorkDao;

  @Autowired
  private VLEStatisticsDao<VLEStatistics> vleStatisticsDao;

  @Autowired
  private StudentStatusDao<StudentStatus> studentStatusDao;

  @Autowired
  private RunStatusDao<RunStatus> runStatusDao;

  @Autowired
  private CRaterRequestDao<CRaterRequest> cRaterRequestDao;

  @Override
  public UserInfo getUserInfoById(Long id) {
    return userInfoDao.getUserInfoById(id);
  }

  @Override
  public void saveUserInfo(UserInfo userInfo) {
    userInfoDao.saveUserInfo(userInfo);
  }

  @Override
  public UserInfo getUserInfoByWorkgroupId(Long workgroupId) {
    return userInfoDao.getUserInfoByWorkgroupId(workgroupId);
  }

  @Override
  public UserInfo getUserInfoOrCreateByWorkgroupId(Long workgroupId) {
    return userInfoDao.getUserInfoOrCreateByWorkgroupId(workgroupId);
  }

  @Override
  public List<UserInfo> getUserInfoByWorkgroupIds(List<String> workgroupIds) {
    return userInfoDao.getUserInfoByWorkgroupIds(workgroupIds);
  }

  @Override
  public List<UserInfo> getUserInfosByWorkgroupIds(List<Long> workgroupIds) {
    return userInfoDao.getUserInfosByWorkgroupIds(workgroupIds);
  }

  @Override
  public List<UserInfo> getUserInfosThatHaveWorkedToday(List<UserInfo> userInfos) {
    return userInfoDao.getUserInfosThatHaveWorkedToday(userInfos);
  }

  @Override
  public Annotation getAnnotationById(Long id) {
    return annotationDao.getAnnotationById(id);
  }

  @Override
  public void saveAnnotation(Annotation annotation) {
    annotationDao.saveAnnotation(annotation);
  }

  @Override
  public List<Annotation> getAnnotationByFromWorkgroupAndWorkByToWorkgroup(UserInfo fromWorkgroup,
      List<StepWork> workByToWorkgroup, Class<?> clazz) {
    return annotationDao.getAnnotationByFromWorkgroupAndWorkByToWorkgroup(fromWorkgroup,
        workByToWorkgroup, clazz);
  }

  @Override
  public List<Annotation> getAnnotationByFromWorkgroupsAndWorkByToWorkgroup(
      List<UserInfo> fromWorkgroups, List<StepWork> workByToWorkgroup, Class<?> clazz) {
    return annotationDao.getAnnotationByFromWorkgroupsAndWorkByToWorkgroup(fromWorkgroups,
        workByToWorkgroup, clazz);
  }

  @Override
  public List<? extends Annotation> getAnnotationByRunId(Long runId, Class<?> clazz) {
    return annotationDao.getAnnotationByRunId(runId, clazz);
  }

  @Override
  public List<? extends Annotation> getAnnotationByRunIdAndType(Long runId, String type,
      Class<?> clazz) {
    return annotationDao.getAnnotationByRunIdAndType(runId, type, clazz);
  }

  @Override
  public Annotation getAnnotationByUserInfoAndStepWork(UserInfo userInfo, StepWork stepWork,
      String type) {
    return annotationDao.getAnnotationByUserInfoAndStepWork(userInfo, stepWork, type);
  }

  @Override
  public Annotation getAnnotationByFromUserInfoToUserInfoStepWorkType(UserInfo fromUserInfo,
      UserInfo toUserInfo, StepWork stepWork, String type) {
    return annotationDao.getAnnotationByFromUserInfoToUserInfoStepWorkType(fromUserInfo, toUserInfo,
        stepWork, type);
  }

  @Override
  public Annotation getAnnotationByFromUserInfoToUserInfoNodeIdType(UserInfo fromUserInfo,
      UserInfo toUserInfo, String nodeId, String type) {
    return annotationDao.getAnnotationByFromUserInfoToUserInfoNodeIdType(fromUserInfo, toUserInfo,
        nodeId, type);
  }

  @Override
  public List<Annotation> getAnnotationByFromWorkgroupsAndStepWork(List<UserInfo> fromWorkgroups,
      StepWork stepWork, String type) {
    return annotationDao.getAnnotationByFromWorkgroupsAndStepWork(fromWorkgroups, stepWork, type);
  }

  @Override
  public List<Annotation> getAnnotationByStepWork(StepWork stepWork, Class<?> clazz) {
    return annotationDao.getAnnotationByStepWork(stepWork, clazz);
  }

  @Override
  public List<Annotation> getAnnotationByFromUserToUserType(List<UserInfo> fromUsers,
      UserInfo toUser, String annotationType) {
    return annotationDao.getAnnotationByFromUserToUserType(fromUsers, toUser, annotationType);
  }

  @Override
  public List<Annotation> getAnnotationByToUserType(UserInfo toUser, String annotationType) {
    return annotationDao.getAnnotationByToUserType(toUser, annotationType);
  }

  @Override
  public Annotation getAnnotationByStepWorkAndAnnotationType(StepWork stepWork,
      String annotationType) {
    return annotationDao.getAnnotationByStepWorkAndAnnotationType(stepWork, annotationType);
  }

  @Override
  public Annotation getLatestAnnotationByStepWork(List<StepWork> stepWorks,
      List<String> workgroupIds, String type) {
    return annotationDao.getLatestAnnotationByStepWork(stepWorks, workgroupIds, type);
  }

  @Override
  public Annotation getLatestAnnotationByStepWork(List<StepWork> stepWorks, String type) {
    return annotationDao.getLatestAnnotationByStepWork(stepWorks, type);
  }

  @Override
  public Annotation getLatestCRaterScoreByStepWork(List<StepWork> stepWorks) {
    return annotationDao.getLatestCRaterScoreByStepWork(stepWorks);
  }

  @Override
  public Annotation getLatestAnnotationScoreByStepWork(List<StepWork> stepWorks,
      List<String> workgroupIds) {
    return annotationDao.getLatestAnnotationScoreByStepWork(stepWorks, workgroupIds);
  }

  @Override
  public Annotation getLatestAnnotationCommentByStepWork(List<StepWork> stepWorks,
      List<String> workgroupIds) {
    return annotationDao.getLatestAnnotationCommentByStepWork(stepWorks, workgroupIds);
  }

  @Override
  public Annotation getCRaterAnnotationByStepWork(StepWork stepWork) {
    return annotationDao.getCRaterAnnotationByStepWork(stepWork);
  }

  @Override
  public List<Annotation> getAnnotationByStepWorkList(List<StepWork> stepWorkList) {
    return annotationDao.getAnnotationByStepWorkList(stepWorkList);
  }

  @Override
  public List<Annotation> getAnnotationByFromWorkgroupsToWorkgroupWithoutWork(
      List<UserInfo> fromUsers, UserInfo toUser, List<String> annotationTypes) {
    return annotationDao.getAnnotationByFromWorkgroupsToWorkgroupWithoutWork(fromUsers, toUser,
        annotationTypes);
  }

  public Annotation getAnnotationByFromUserInfoToUserInfoType(UserInfo fromUserInfo,
      UserInfo toUserInfo, String type) {
    return annotationDao.getAnnotationByFromUserInfoToUserInfoType(fromUserInfo, toUserInfo, type);
  }

  @Override
  public List<Annotation> getAnnotationsByRunIdAndNodeId(Long runId, String nodeId) {
    return annotationDao.getAnnotationsByRunIdAndNodeId(runId, nodeId);
  }

  @Override
  public List<Annotation> getAnnotationList() {
    return annotationDao.getList();
  }

  @Override
  public Node getNodeById(Long id) {
    return nodeDao.getNodeById(id);
  }

  @Override
  public void saveNode(Node node) {
    nodeDao.saveNode(node);
  }

  @Override
  public Node getNodeByNodeIdAndRunId(String nodeId, String runId) {
    return nodeDao.getNodeByNodeIdAndRunId(nodeId, runId);
  }

  @Override
  public Node getNodeByNodeIdAndRunId(String nodeId, String runId, boolean createIfNotFound) {
    return nodeDao.getNodeByNodeIdAndRunId(nodeId, runId, createIfNotFound);
  }

  @Override
  public List<Node> getNodesByNodeIdsAndRunId(List<String> nodeIds, String runId) {
    return nodeDao.getNodesByNodeIdsAndRunId(nodeIds, runId);
  }

  @Override
  public List<Node> getNodesByRunId(String runId) {
    return nodeDao.getNodesByRunId(runId);
  }

  @Override
  public StepWork getStepWorkById(Long id) {
    return stepWorkDao.getStepWorkById(id);
  }

  @Override
  public void saveStepWork(StepWork stepWork) {
    stepWorkDao.saveStepWork(stepWork);
  }

  @Override
  public List<StepWork> getStepWorksByUserInfo(UserInfo userInfo) {
    return stepWorkDao.getStepWorksByUserInfo(userInfo);
  }

  @Override
  public StepWork getLatestStepWorkByUserInfo(UserInfo userInfo) {
    return stepWorkDao.getLatestStepWorkByUserInfo(userInfo);
  }

  @Override
  public StepWork getLatestStepWorkByUserInfoAndNode(UserInfo userInfo, Node node) {
    return stepWorkDao.getLatestStepWorkByUserInfoAndNode(userInfo, node);
  }

  @Override
  public List<StepWork> getStepWorksByUserInfoAndNode(UserInfo userInfo, Node node) {
    return stepWorkDao.getStepWorksByUserInfoAndNode(userInfo, node);
  }

  @Override
  public List<StepWork> getStepWorksByUserInfoAndNodeList(UserInfo userInfo, List<Node> nodeList) {
    return stepWorkDao.getStepWorksByUserInfoAndNodeList(userInfo, nodeList);
  }

  @Override
  public List<StepWork> getStepWorksByUserInfosAndNode(List<UserInfo> userInfos, Node node) {
    return stepWorkDao.getStepWorksByUserInfosAndNode(userInfos, node);
  }

  @Override
  public List<StepWork> getStepWorksByUserInfos(List<UserInfo> userInfos) {
    return stepWorkDao.getStepWorksByUserInfos(userInfos);
  }

  @Override
  public List<StepWork> getStepWorksByNode(Node node) {
    return stepWorkDao.getStepWorksByNode(node);
  }

  @Override
  public List<StepWork> getStepWorksByRunId(Long runId) {
    return stepWorkDao.getStepWorksByRunId(runId);
  }

  @Override
  public StepWork getStepWorkByStepWorkId(Long id) {
    return stepWorkDao.getStepWorkByStepWorkId(id);
  }

  @Override
  public StepWork getStepWorkByUserIdAndData(UserInfo userInfo, String data) {
    return stepWorkDao.getStepWorkByUserIdAndData(userInfo, data);
  }

  @Override
  public VLEStatistics getVLEStatisticsById(Long id) {
    return vleStatisticsDao.getVLEStatisticsById(id);
  }

  @Override
  public void saveVLEStatistics(VLEStatistics vleStatistics) {
    vleStatisticsDao.saveVLEStatistics(vleStatistics);
  }

  @Override
  public List<VLEStatistics> getVLEStatistics() {
    return vleStatisticsDao.getVLEStatistics();
  }

  @Override
  public VLEStatistics getLatestVLEStatistics() {
    return vleStatisticsDao.getLatestVLEStatistics();
  }

  @Override
  public void saveStudentStatus(StudentStatus studentStatus) {
    studentStatusDao.saveStudentStatus(studentStatus);
  }

  @Override
  @Transactional
  public StudentStatus getStudentStatusByWorkgroupId(Long workgroupId) {
    return studentStatusDao.getStudentStatusByWorkgroupId(workgroupId);
  }

  @Override
  public List<StudentStatus> getStudentStatusesByPeriodId(Long periodId) {
    return studentStatusDao.getStudentStatusesByPeriodId(periodId);
  }

  @Override
  public List<StudentStatus> getStudentStatusesByRunId(Long runId) {
    return studentStatusDao.getStudentStatusesByRunId(runId);
  }

  @Override
  public void saveRunStatus(RunStatus runStatus) {
    runStatusDao.saveRunStatus(runStatus);
  }

  @Override
  public RunStatus getRunStatusByRunId(Long runId) {
    return runStatusDao.getRunStatusByRunId(runId);
  }

  @Override
  public CRaterRequest getCRaterRequestById(Long id) {
    return cRaterRequestDao.getCRaterRequestById(id);
  }

  @Override
  public void saveCRaterRequest(CRaterRequest cRaterRequest) {
    cRaterRequestDao.saveCRaterRequest(cRaterRequest);
  }

  @Override
  public CRaterRequest getCRaterRequestByStepWorkIdNodeStateId(StepWork stepWork,
      Long nodeStateId) {
    return cRaterRequestDao.getCRaterRequestByStepWorkIdNodeStateId(stepWork, nodeStateId);
  }

  @Override
  public List<CRaterRequest> getIncompleteCRaterRequests() {
    return cRaterRequestDao.getIncompleteCRaterRequests();
  }

}
