/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
package org.wise.portal.service.vle;

import java.util.List;

import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.cRater.CRaterRequest;
import org.wise.vle.domain.ideabasket.IdeaBasket;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewGate;
import org.wise.vle.domain.peerreview.PeerReviewWork;
import org.wise.vle.domain.portfolio.Portfolio;
import org.wise.vle.domain.statistics.VLEStatistics;
import org.wise.vle.domain.status.RunStatus;
import org.wise.vle.domain.status.StudentStatus;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;

/**
 * Services for the WISE Virtual Learning Environment (WISE VLE v4)
 * @author Hiroki Terashima
 */
public interface VLEService {

  //UserInfo functions

  UserInfo getUserInfoById(Long id);

  void saveUserInfo(UserInfo userInfo);

  UserInfo getUserInfoByWorkgroupId(Long workgroupId);

  UserInfo getUserInfoOrCreateByWorkgroupId(Long workgroupId);

  List<UserInfo> getUserInfoByWorkgroupIds(List<String> workgroupIds);

  List<UserInfo> getUserInfosByWorkgroupIds(List<Long> workgroupIds);

  List<UserInfo> getUserInfosThatHaveWorkedToday(List<UserInfo> userInfos);

  //Annotation functions

  Annotation getAnnotationById(Long id);

  void saveAnnotation(Annotation annotation);

  List<Annotation> getAnnotationByFromWorkgroupAndWorkByToWorkgroup(UserInfo fromWorkgroup, List<StepWork> workByToWorkgroup, Class<?> clazz);

  List<Annotation> getAnnotationByFromWorkgroupsAndWorkByToWorkgroup(List<UserInfo> fromWorkgroups, List<StepWork> workByToWorkgroup, Class<?> clazz);

  List<? extends Annotation> getAnnotationByRunId(Long runId, Class<?> clazz);

  List<? extends Annotation> getAnnotationByRunIdAndType(Long runId, String type, Class<?> clazz);

  Annotation getAnnotationByUserInfoAndStepWork(UserInfo userInfo, StepWork stepWork, String type);

  Annotation getAnnotationByFromUserInfoToUserInfoStepWorkType(UserInfo fromUserInfo, UserInfo toUserInfo, StepWork stepWork, String type);

  Annotation getAnnotationByFromUserInfoToUserInfoNodeIdType(UserInfo fromUserInfo, UserInfo toUserInfo, String nodeId, String type);

  Annotation getAnnotationByFromUserInfoToUserInfoType(UserInfo fromUserInfo, UserInfo toUserInfo, String type);

  List<Annotation> getAnnotationByFromWorkgroupsAndStepWork(List<UserInfo> fromWorkgroups, StepWork stepWork, String type);

  List<Annotation> getAnnotationByStepWork(StepWork stepWork, Class<?> clazz);

  List<Annotation> getAnnotationByFromUserToUserType(List<UserInfo> fromUsers, UserInfo toUser, String annotationType);

  List<Annotation> getAnnotationByToUserType(UserInfo toUser, String annotationType);

  Annotation getAnnotationByStepWorkAndAnnotationType(StepWork stepWork, String annotationType);

  Annotation getLatestAnnotationByStepWork(List<StepWork> stepWorks, List<String> workgroupIds, String type);

  Annotation getLatestAnnotationByStepWork(List<StepWork> stepWorks, String type);

  Annotation getLatestCRaterScoreByStepWork(List<StepWork> stepWorks);

  Annotation getLatestAnnotationScoreByStepWork(List<StepWork> stepWorks, List<String> workgroupIds);

  Annotation getLatestAnnotationCommentByStepWork(List<StepWork> stepWorks, List<String> workgroupIds);

  Annotation getCRaterAnnotationByStepWork(StepWork stepWork);

  List<Annotation> getAnnotationByStepWorkList(List<StepWork> stepWorkList);

  List<Annotation> getAnnotationByFromWorkgroupsToWorkgroupWithoutWork(List<UserInfo> fromUsers, UserInfo toUser, List<String> annotationTypes);

  List<Annotation> getAnnotationsByRunIdAndNodeId(Long runId, String nodeId);

  List<Annotation> getAnnotationList();

  //PeerRevieWork functions

  PeerReviewWork getPeerReviewWorkById(Long id);

  void savePeerReviewWork(PeerReviewWork peerReviewWork);

  List<PeerReviewWork> getPeerReviewWorkByRun(Long runId);

  List<PeerReviewWork> getPeerReviewWorkByRunPeriodNode(Long runId, Long periodId, Node node);

  List<PeerReviewWork> getUnassignedPeerReviewWorkList(Long runId, Long periodId, Node node);

  PeerReviewWork getPeerReviewWorkByRunPeriodNodeStepWorkReviewer(Long runId, Long periodId, Node node, StepWork stepWork, UserInfo reviewer);

  PeerReviewWork setPeerReviewAnnotation(Long runId, Long periodId, Node node, StepWork stepWork, UserInfo reviewer, Annotation annotation);

  PeerReviewWork getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo);

  PeerReviewWork getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(Long runId, Long periodId, Node node, UserInfo worker);

  PeerReviewWork getPeerReviewWorkByRunPeriodNodeWorkerUserInfoReviewerUserInfo(Long runId, Long periodId, Node node, UserInfo workerUserInfo, UserInfo reviewerUserInfo);

  void setAuthorAsReviewer(PeerReviewWork peerReviewWork);

  boolean isAuthorSetAsReviewer(PeerReviewWork peerReviewWork);

  UserInfo getAuthorUserInfo();

  PeerReviewWork getOrCreateAuthorReviewWork(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo);

  PeerReviewWork setUserAsAuthorReviewer(Long runId, Long periodId, Node node, UserInfo userInfo);

  void matchUserToAuthor(Long runId, Long periodId, Node node, UserInfo userInfo, PeerReviewWork userWork);

  boolean isUserReviewingAuthor(Long runId, Long periodId, Node node, UserInfo userInfo);

  //PeerReviewGate functions

  PeerReviewGate getPeerReviewGateById(Long id);

  void savePeerReviewGate(PeerReviewGate peerReviewGate);

  PeerReviewGate getPeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node);

  PeerReviewGate getOrCreatePeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node);

  boolean calculatePeerReviewOpen(Long runId, Long periodId, Node node, int numWorkgroups, int openPercentageTrigger, int openNumberTrigger);

  boolean peerReviewGateOpenPercentageTriggerSatisfied(int numWorkgroupsSubmitted, int numWorkgroups, int openPercentageTrigger);

  boolean peerReviewGateOpenNumberTriggerSatisfied(int numWorkgroupsSubmitted, int openNumberTrigger);

  //Node functions

  Node getNodeById(Long id);

  void saveNode(Node node);

  Node getNodeByNodeIdAndRunId(String nodeId, String runId);

  Node getNodeByNodeIdAndRunId(String nodeId, String runId, boolean createIfNotFound);

  List<Node> getNodesByNodeIdsAndRunId(List<String> nodeIds, String runId);

  List<Node> getNodesByRunId(String runId);

  //StepWork functions

  StepWork getStepWorkById(Long id);

  void saveStepWork(StepWork stepWork);

  List<StepWork> getStepWorksByUserInfo(UserInfo userInfo);

  StepWork getLatestStepWorkByUserInfo(UserInfo userInfo);

  StepWork getLatestStepWorkByUserInfoAndNode(UserInfo userInfo,Node node);

  List<StepWork> getStepWorksByUserInfoAndNode(UserInfo userInfo,Node node);

  List<StepWork> getStepWorksByUserInfoAndNodeList(UserInfo userInfo, List<Node> nodeList);

  List<StepWork> getStepWorksByUserInfosAndNode(List<UserInfo> userInfos, Node node);

  List<StepWork> getStepWorksByUserInfos(List<UserInfo> userInfos);

  List<StepWork> getStepWorksByNode(Node node);

  List<StepWork> getStepWorksByRunId(Long runId);

  StepWork getStepWorkByStepWorkId(Long id);

  StepWork getStepWorkByUserIdAndData(UserInfo userInfo,String data);

  //VLEStatistics functions

  VLEStatistics getVLEStatisticsById(Long id);

  void saveVLEStatistics(VLEStatistics vleStatistics);

  List<VLEStatistics> getVLEStatistics();

  VLEStatistics getLatestVLEStatistics();

  //StudentStatus functions

  void saveStudentStatus(StudentStatus studentStatus);

  StudentStatus getStudentStatusByWorkgroupId(Long workgroupId);

  List<StudentStatus> getStudentStatusesByPeriodId(Long periodId);

  List<StudentStatus> getStudentStatusesByRunId(Long runId);

  //RunStatus functions
  void saveRunStatus(RunStatus runStatus);

  RunStatus getRunStatusByRunId(Long runId);

  //IdeaBasket functions

  IdeaBasket getIdeaBasketById(Long id);

  void saveIdeaBasket(IdeaBasket ideaBasket);

  IdeaBasket getIdeaBasketByRunIdWorkgroupId(long runId, long workgroupId);

  List<IdeaBasket> getLatestIdeaBasketsForRunId(long runId);

  List<IdeaBasket> getLatestIdeaBasketsForRunIdWorkgroupIds(long runId, List<Long> workgroupIds);

  List<IdeaBasket> getIdeaBasketsForRunId(long runId);

  IdeaBasket getPublicIdeaBasketForRunIdPeriodId(long runId, long periodId);

  //Portfolio functions
  Portfolio getPortfolioByRunIdWorkgroupId(long runId, long workgroupId);

  void savePortfolio(Portfolio portfolio);


  //CRaterRequest functions
  CRaterRequest getCRaterRequestById(Long id);

  void saveCRaterRequest(CRaterRequest cRaterRequest);

  CRaterRequest getCRaterRequestByStepWorkIdNodeStateId(StepWork stepWork, Long nodeStateId);

  List<CRaterRequest> getIncompleteCRaterRequests();

}
