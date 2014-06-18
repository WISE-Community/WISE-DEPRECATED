/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
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
package org.wise.portal.service.vle;

import java.util.List;

import org.wise.portal.dao.annotation.AnnotationDao;
import org.wise.portal.dao.crater.CRaterRequestDao;
import org.wise.portal.dao.ideabasket.IdeaBasketDao;
import org.wise.portal.dao.node.NodeDao;
import org.wise.portal.dao.peerreview.PeerReviewGateDao;
import org.wise.portal.dao.peerreview.PeerReviewWorkDao;
import org.wise.portal.dao.statistics.VLEStatisticsDao;
import org.wise.portal.dao.status.RunStatusDao;
import org.wise.portal.dao.status.StudentStatusDao;
import org.wise.portal.dao.userinfo.UserInfoDao;
import org.wise.portal.dao.work.StepWorkCacheDao;
import org.wise.portal.dao.work.StepWorkDao;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.cRater.CRaterRequest;
import org.wise.vle.domain.ideabasket.IdeaBasket;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewGate;
import org.wise.vle.domain.peerreview.PeerReviewWork;
import org.wise.vle.domain.statistics.VLEStatistics;
import org.wise.vle.domain.status.RunStatus;
import org.wise.vle.domain.status.StudentStatus;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;
import org.wise.vle.domain.work.StepWorkCache;


/**
 * @author h
 * @version $Id:$
 */
public interface VLEService {

	//setters
	
	public void setUserInfoDao(UserInfoDao<UserInfo> userInfoDao);
	
	public void setAnnotationDao(AnnotationDao<Annotation> annotationDao);
	
	public void setPeerReviewWorkDao(PeerReviewWorkDao<PeerReviewWork> peerReviewWorkDao);
	
	public void setPeerReviewGateDao(PeerReviewGateDao<PeerReviewGate> peerReviewGateDao);

	public void setNodeDao(NodeDao<Node> nodeDao);
	
	public void setStepWorkDao(StepWorkDao<StepWork> stepWorkDao);
	
	public void setStepWorkCacheDao(StepWorkCacheDao<StepWorkCache> stepWorkCacheDao);
	
	public void setVleStatisticsDao(VLEStatisticsDao<VLEStatistics> vleStatisticsDao);
	
	public void setStudentStatusDao(StudentStatusDao<StudentStatus> studentStatusDao);
	
	public void setRunStatusDao(RunStatusDao<RunStatus> runStatusDao);
	
	public void setIdeaBasketDao(IdeaBasketDao<IdeaBasket> ideaBasketDao);
	
	public void setCRaterRequestDao(CRaterRequestDao<CRaterRequest> cRaterRequestDao);
	
	//UserInfo functions
	
	public UserInfo getUserInfoById(Long id);
	
	public void saveUserInfo(UserInfo userInfo);
	
	public UserInfo getUserInfoByWorkgroupId(Long workgroupId);
	
	public UserInfo getUserInfoOrCreateByWorkgroupId(Long workgroupId);
	
	public List<UserInfo> getUserInfoByWorkgroupIds(List<String> workgroupIds);
	
	public List<UserInfo> getUserInfosThatHaveWorkedToday(List<UserInfo> userInfos);
	
	//Annotation functions
	
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
	
	public List<Annotation> getAnnotationList();
	
	//PeerRevieWork functions
	
	public PeerReviewWork getPeerReviewWorkById(Long id);
	
	public void savePeerReviewWork(PeerReviewWork peerReviewWork);
	
	public List<PeerReviewWork> getPeerReviewWorkByRun(Long runId);
	
	public List<PeerReviewWork> getPeerReviewWorkByRunPeriodNode(Long runId, Long periodId, Node node);
	
	public List<PeerReviewWork> getUnassignedPeerReviewWorkList(Long runId, Long periodId, Node node);
	
	public PeerReviewWork getPeerReviewWorkByRunPeriodNodeStepWorkReviewer(Long runId, Long periodId, Node node, StepWork stepWork, UserInfo reviewer);
	
	public PeerReviewWork setPeerReviewAnnotation(Long runId, Long periodId, Node node, StepWork stepWork, UserInfo reviewer, Annotation annotation);
	
	public PeerReviewWork getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo);
	
	public PeerReviewWork getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(Long runId, Long periodId, Node node, UserInfo worker);
	
	public PeerReviewWork getPeerReviewWorkByRunPeriodNodeWorkerUserInfoReviewerUserInfo(Long runId, Long periodId, Node node, UserInfo workerUserInfo, UserInfo reviewerUserInfo);
	
	public void setAuthorAsReviewer(PeerReviewWork peerReviewWork);
	
	public boolean isAuthorSetAsReviewer(PeerReviewWork peerReviewWork);
	
	public UserInfo getAuthorUserInfo();
	
	public PeerReviewWork getOrCreateAuthorReviewWork(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo);
	
	public PeerReviewWork setUserAsAuthorReviewer(Long runId, Long periodId, Node node, UserInfo userInfo);
	
	public void matchUserToAuthor(Long runId, Long periodId, Node node, UserInfo userInfo, PeerReviewWork userWork);
	
	public boolean isUserReviewingAuthor(Long runId, Long periodId, Node node, UserInfo userInfo);
	
	//PeerReviewGate functions
	
	public PeerReviewGate getPeerReviewGateById(Long id);
	
	public void savePeerReviewGate(PeerReviewGate peerReviewGate);
	
	public PeerReviewGate getPeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node);
	
	public PeerReviewGate getOrCreatePeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node);
	
	public boolean calculatePeerReviewOpen(Long runId, Long periodId, Node node, int numWorkgroups, int openPercentageTrigger, int openNumberTrigger);
	
	public boolean peerReviewGateOpenPercentageTriggerSatisfied(int numWorkgroupsSubmitted, int numWorkgroups, int openPercentageTrigger);
	
	public boolean peerReviewGateOpenNumberTriggerSatisfied(int numWorkgroupsSubmitted, int openNumberTrigger);
	
	//Node functions
	
	public Node getNodeById(Long id);
	
	public void saveNode(Node node);
	
	public Node getNodeByNodeIdAndRunId(String nodeId, String runId);
	
	public Node getNodeByNodeIdAndRunId(String nodeId, String runId, boolean createIfNotFound);
	
	public List<Node> getNodesByNodeIdsAndRunId(List<String> nodeIds, String runId);
	
	public List<Node> getNodesByRunId(String runId);
	
	//StepWork functions
	
	public StepWork getStepWorkById(Long id);
	
	public void saveStepWork(StepWork stepWork);
	
	public List<StepWork> getStepWorksByUserInfo(UserInfo userInfo);
	
	public StepWork getLatestStepWorkByUserInfo(UserInfo userInfo);
	
	public StepWork getLatestStepWorkByUserInfoAndNode(UserInfo userInfo,Node node);
	
	public List<StepWork> getStepWorksByUserInfoAndNode(UserInfo userInfo,Node node);
	
	public List<StepWork> getStepWorksByUserInfoAndNodeList(UserInfo userInfo, List<Node> nodeList);
	
	public List<StepWork> getStepWorksByUserInfosAndNode(List<UserInfo> userInfos, Node node);
	
	public List<StepWork> getStepWorksByNode(Node node);
	
	public StepWork getStepWorkByStepWorkId(Long id);
	
	public StepWork getStepWorkByUserIdAndData(UserInfo userInfo,String data);
	
	//StepWorkCache functions
	
	public StepWorkCache getStepWorkCacheById(Long id);
	
	public void saveStepWorkCache(StepWorkCache stepWorkCache);
	
	public StepWorkCache getStepWorkCacheByUserInfo(UserInfo userInfo);
	
	public StepWorkCache getStepWorkCacheByUserInfoGetRevisions(UserInfo userInfo, boolean getRevisions);
	
	//VLEStatistics functions
	
	public VLEStatistics getVLEStatisticsById(Long id);
	
	public void saveVLEStatistics(VLEStatistics vleStatistics);
	
	public List<VLEStatistics> getVLEStatistics();
	
	//StudentStatus functions
	
	public StudentStatus getStudentStatusById(Long id);
	
	public void saveStudentStatus(StudentStatus studentStatus);
	
	public StudentStatus getStudentStatusByWorkgroupId(Long workgroupId);
	
	public List<StudentStatus> getStudentStatusesByPeriodId(Long periodId);
	
	public List<StudentStatus> getStudentStatusesByRunId(Long runId);
	
	//RunStatus functions
	
	public RunStatus getRunStatusById(Long id);
	
	public void saveRunStatus(RunStatus runStatus);
	
	public RunStatus getRunStatusByRunId(Long runId);
	
	//IdeaBasket functions
	
	public IdeaBasket getIdeaBasketById(Long id);
	
	public void saveIdeaBasket(IdeaBasket ideaBasket);
	
	public IdeaBasket getIdeaBasketByRunIdWorkgroupId(long runId, long workgroupId);
	
	public List<IdeaBasket> getLatestIdeaBasketsForRunId(long runId);
	
	public List<IdeaBasket> getLatestIdeaBasketsForRunIdWorkgroupIds(long runId, List<Long> workgroupIds);
	
	public List<IdeaBasket> getIdeaBasketsForRunId(long runId);
	
	public IdeaBasket getPublicIdeaBasketForRunIdPeriodId(long runId, long periodId);

	//CRaterRequest functions
	
	public CRaterRequest getCRaterRequestById(Long id);
	
	public void saveCRaterRequest(CRaterRequest cRaterRequest);
	
	public CRaterRequest getCRaterRequestByStepWorkIdNodeStateId(StepWork stepWork, Long nodeStateId);
	
	public List<CRaterRequest> getIncompleteCRaterRequests();
	
}
