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
package org.wise.portal.service.vle.impl;

import java.util.List;
import java.util.Map;

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
import org.wise.portal.service.vle.VLEService;
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
public class VLEServiceImpl implements VLEService {

	private UserInfoDao<UserInfo> userInfoDao;
	private AnnotationDao<Annotation> annotationDao;
	private PeerReviewWorkDao<PeerReviewWork> peerReviewWorkDao;
	private PeerReviewGateDao<PeerReviewGate> peerReviewGateDao;
	private NodeDao<Node> nodeDao;
	private StepWorkDao<StepWork> stepWorkDao;
	private StepWorkCacheDao<StepWorkCache> stepWorkCacheDao;
	private VLEStatisticsDao<VLEStatistics> vleStatisticsDao;
	private StudentStatusDao<StudentStatus> studentStatusDao;
	private RunStatusDao<RunStatus> runStatusDao;
	private IdeaBasketDao<IdeaBasket> ideaBasketDao;
	private CRaterRequestDao<CRaterRequest> cRaterRequestDao;

	public void setUserInfoDao(UserInfoDao<UserInfo> userInfoDao) {
		this.userInfoDao = userInfoDao;
	}
	
	public void setAnnotationDao(AnnotationDao<Annotation> annotationDao) {
		this.annotationDao = annotationDao;
	}
	
	public void setPeerReviewWorkDao(PeerReviewWorkDao<PeerReviewWork> peerReviewWorkDao) {
		this.peerReviewWorkDao = peerReviewWorkDao;
	}
	
	public void setPeerReviewGateDao(PeerReviewGateDao<PeerReviewGate> peerReviewGateDao) {
		this.peerReviewGateDao = peerReviewGateDao;
	}

	public void setNodeDao(NodeDao<Node> nodeDao) {
		this.nodeDao = nodeDao;
	}

	public void setStepWorkDao(StepWorkDao<StepWork> stepWorkDao) {
		this.stepWorkDao = stepWorkDao;
	}

	public void setStepWorkCacheDao(StepWorkCacheDao<StepWorkCache> stepWorkCacheDao) {
		this.stepWorkCacheDao = stepWorkCacheDao;
	}

	public void setVleStatisticsDao(VLEStatisticsDao<VLEStatistics> vleStatisticsDao) {
		this.vleStatisticsDao = vleStatisticsDao;
	}

	public void setStudentStatusDao(StudentStatusDao<StudentStatus> studentStatusDao) {
		this.studentStatusDao = studentStatusDao;
	}

	public void setRunStatusDao(RunStatusDao<RunStatus> runStatusDao) {
		this.runStatusDao = runStatusDao;
	}

	public void setIdeaBasketDao(IdeaBasketDao<IdeaBasket> ideaBasketDao) {
		this.ideaBasketDao = ideaBasketDao;
	}
	
	public void setCRaterRequestDao(CRaterRequestDao<CRaterRequest> cRaterRequestDao) {
		this.cRaterRequestDao = cRaterRequestDao;
	}

	/**
	 * @see org.wise.portal.service.vle.VLEService#getUserInfoByWorkgroupId(java.lang.Long)
	 */
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
	public List<UserInfo> getUserInfosThatHaveWorkedToday(List<UserInfo> userInfos) {
		return userInfoDao.getUserInfosThatHaveWorkedToday(userInfos);
	}
	
	@Override
	public List<Annotation> getAnnotationByFromWorkgroupAndWorkByToWorkgroup(UserInfo fromWorkgroup, List<StepWork> workByToWorkgroup, Class<?> clazz) {
		return annotationDao.getAnnotationByFromWorkgroupAndWorkByToWorkgroup(fromWorkgroup, workByToWorkgroup, clazz);
	}

	@Override
	public List<Annotation> getAnnotationByFromWorkgroupsAndWorkByToWorkgroup(List<UserInfo> fromWorkgroups, List<StepWork> workByToWorkgroup, Class<?> clazz) {
		return annotationDao.getAnnotationByFromWorkgroupsAndWorkByToWorkgroup(fromWorkgroups, workByToWorkgroup, clazz);
	}

	@Override
	public List<? extends Annotation> getAnnotationByRunId(Long runId, Class<?> clazz) {
		return annotationDao.getAnnotationByRunId(runId, clazz);
	}

	@Override
	public List<? extends Annotation> getAnnotationByRunIdAndType(Long runId, String type, Class<?> clazz) {
		return annotationDao.getAnnotationByRunIdAndType(runId, type, clazz);
	}

	@Override
	public Annotation getAnnotationByUserInfoAndStepWork(UserInfo userInfo, StepWork stepWork, String type) {
		return annotationDao.getAnnotationByUserInfoAndStepWork(userInfo, stepWork, type);
	}

	@Override
	public Annotation getAnnotationByFromUserInfoToUserInfoStepWorkType(UserInfo fromUserInfo, UserInfo toUserInfo, StepWork stepWork, String type) {
		return annotationDao.getAnnotationByFromUserInfoToUserInfoStepWorkType(fromUserInfo, toUserInfo, stepWork, type);
	}

	@Override
	public List<Annotation> getAnnotationByFromWorkgroupsAndStepWork(List<UserInfo> fromWorkgroups, StepWork stepWork, String type) {
		return annotationDao.getAnnotationByFromWorkgroupsAndStepWork(fromWorkgroups, stepWork, type);
	}

	@Override
	public List<Annotation> getAnnotationByStepWork(StepWork stepWork, Class<?> clazz) {
		return annotationDao.getAnnotationByStepWork(stepWork, clazz);
	}

	@Override
	public List<Annotation> getAnnotationByFromUserToUserType(List<UserInfo> fromUsers, UserInfo toUser, String annotationType) {
		return annotationDao.getAnnotationByFromUserToUserType(fromUsers, toUser, annotationType);
	}

	@Override
	public List<Annotation> getAnnotationByToUserType(UserInfo toUser, String annotationType) {
		return annotationDao.getAnnotationByToUserType(toUser, annotationType);
	}

	@Override
	public Annotation getAnnotationByStepWorkAndAnnotationType(StepWork stepWork, String annotationType) {
		return annotationDao.getAnnotationByStepWorkAndAnnotationType(stepWork, annotationType);
	}

	@Override
	public Annotation getLatestAnnotationByStepWork(List<StepWork> stepWorks, List<String> workgroupIds, String type) {
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
	public Annotation getLatestAnnotationScoreByStepWork(List<StepWork> stepWorks, List<String> workgroupIds) {
		return annotationDao.getLatestAnnotationScoreByStepWork(stepWorks, workgroupIds);
	}

	@Override
	public Annotation getLatestAnnotationCommentByStepWork(List<StepWork> stepWorks, List<String> workgroupIds) {
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
	public List<PeerReviewWork> getPeerReviewWorkByRun(Long runId) {
		return peerReviewWorkDao.getPeerReviewWorkByRun(runId);
	}

	@Override
	public List<PeerReviewWork> getPeerReviewWorkByRunPeriodNode(Long runId, Long periodId, Node node) {
		return peerReviewWorkDao.getPeerReviewWorkByRunPeriodNode(runId, periodId, node);
	}

	@Override
	public List<PeerReviewWork> getUnassignedPeerReviewWorkList(Long runId, Long periodId, Node node) {
		return peerReviewWorkDao.getUnassignedPeerReviewWorkList(runId, periodId, node);
	}

	@Override
	public PeerReviewWork getPeerReviewWorkByRunPeriodNodeStepWorkReviewer(Long runId, Long periodId, Node node, StepWork stepWork, UserInfo reviewer) {
		return peerReviewWorkDao.getPeerReviewWorkByRunPeriodNodeStepWorkReviewer(runId, periodId, node, stepWork, reviewer);
	}

	@Override
	public PeerReviewWork setPeerReviewAnnotation(Long runId, Long periodId, Node node, StepWork stepWork, UserInfo reviewer, Annotation annotation) {
		return peerReviewWorkDao.setPeerReviewAnnotation(runId, periodId, node, stepWork, reviewer, annotation);
	}

	@Override
	public PeerReviewWork getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo) {
		return peerReviewWorkDao.getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(runId, periodId, node, reviewerUserInfo);
	}

	@Override
	public PeerReviewWork getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(Long runId, Long periodId, Node node, UserInfo worker) {
		return peerReviewWorkDao.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(runId, periodId, node, worker);
	}

	@Override
	public PeerReviewWork getPeerReviewWorkByRunPeriodNodeWorkerUserInfoReviewerUserInfo(Long runId, Long periodId, Node node, UserInfo workerUserInfo, UserInfo reviewerUserInfo) {
		return peerReviewWorkDao.getPeerReviewWorkByRunPeriodNodeWorkerUserInfoReviewerUserInfo(runId, periodId, node, workerUserInfo, reviewerUserInfo);
	}

	@Override
	public void setAuthorAsReviewer(PeerReviewWork peerReviewWork) {
		peerReviewWorkDao.setAuthorAsReviewer(peerReviewWork);
	}

	@Override
	public boolean isAuthorSetAsReviewer(PeerReviewWork peerReviewWork) {
		return peerReviewWorkDao.isAuthorSetAsReviewer(peerReviewWork);
	}

	@Override
	public UserInfo getAuthorUserInfo() {
		return peerReviewWorkDao.getAuthorUserInfo();
	}

	@Override
	public PeerReviewWork getOrCreateAuthorReviewWork(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo) {
		return peerReviewWorkDao.getOrCreateAuthorReviewWork(runId, periodId, node, reviewerUserInfo);
	}

	@Override
	public PeerReviewWork setUserAsAuthorReviewer(Long runId, Long periodId, Node node, UserInfo userInfo) {
		return peerReviewWorkDao.setUserAsAuthorReviewer(runId, periodId, node, userInfo);
	}

	@Override
	public void matchUserToAuthor(Long runId, Long periodId, Node node, UserInfo userInfo, PeerReviewWork userWork) {
		peerReviewWorkDao.matchUserToAuthor(runId, periodId, node, userInfo, userWork);
	}

	@Override
	public boolean isUserReviewingAuthor(Long runId, Long periodId, Node node, UserInfo userInfo) {
		return peerReviewWorkDao.isUserReviewingAuthor(runId, periodId, node, userInfo);
	}

	@Override
	public PeerReviewGate getPeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node) {
		return peerReviewGateDao.getPeerReviewGateByRunIdPeriodIdNodeId(runId, periodId, node);
	}

	@Override
	public PeerReviewGate getOrCreatePeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node) {
		return peerReviewGateDao.getOrCreatePeerReviewGateByRunIdPeriodIdNodeId(runId, periodId, node);
	}

	@Override
	public boolean calculatePeerReviewOpen(Long runId, Long periodId, Node node, int numWorkgroups, int openPercentageTrigger, int openNumberTrigger) {
		return peerReviewGateDao.calculatePeerReviewOpen(runId, periodId, node, numWorkgroups, openPercentageTrigger, openNumberTrigger);
	}

	@Override
	public boolean peerReviewGateOpenPercentageTriggerSatisfied(int numWorkgroupsSubmitted, int numWorkgroups, int openPercentageTrigger) {
		return peerReviewGateDao.peerReviewGateOpenPercentageTriggerSatisfied(numWorkgroupsSubmitted, numWorkgroups, openPercentageTrigger);
	}

	@Override
	public boolean peerReviewGateOpenNumberTriggerSatisfied(int numWorkgroupsSubmitted, int openNumberTrigger) {
		return peerReviewGateDao.peerReviewGateOpenNumberTriggerSatisfied(numWorkgroupsSubmitted, openNumberTrigger);
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
	public List<StepWork> getStepWorksByNodeId(Long id) {
		return stepWorkDao.getStepWorksByNodeId(id);
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
	public StepWorkCache getStepWorkCacheByUserInfo(UserInfo userInfo) {
		return stepWorkCacheDao.getStepWorkCacheByUserInfo(userInfo);
	}

	@Override
	public StepWorkCache getStepWorkCacheByUserInfoGetRevisions(UserInfo userInfo, boolean getRevisions) {
		return stepWorkCacheDao.getStepWorkCacheByUserInfoGetRevisions(userInfo, getRevisions);
	}

	@Override
	public List<VLEStatistics> getVLEStatistics() {
		return vleStatisticsDao.getVLEStatistics();
	}

	@Override
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
	public RunStatus getRunStatusByRunId(Long runId) {
		return runStatusDao.getRunStatusByRunId(runId);
	}

	@Override
	public IdeaBasket getIdeaBasketByRunIdWorkgroupId(long runId, long workgroupId) {
		return ideaBasketDao.getIdeaBasketByRunIdWorkgroupId(runId, workgroupId);
	}

	@Override
	public List<IdeaBasket> getLatestIdeaBasketsForRunId(long runId) {
		return ideaBasketDao.getLatestIdeaBasketsForRunId(runId);
	}

	@Override
	public List<IdeaBasket> getLatestIdeaBasketsForRunIdWorkgroupIds(long runId, List<Long> workgroupIds) {
		return ideaBasketDao.getLatestIdeaBasketsForRunIdWorkgroupIds(runId, workgroupIds);
	}

	@Override
	public List<IdeaBasket> getIdeaBasketsForRunId(long runId) {
		return ideaBasketDao.getIdeaBasketsForRunId(runId);
	}

	@Override
	public IdeaBasket getPublicIdeaBasketForRunIdPeriodId(long runId, long periodId) {
		return ideaBasketDao.getPublicIdeaBasketForRunIdPeriodId(runId, periodId);
	}

	@Override
	public CRaterRequest getCRaterRequestByStepWorkIdNodeStateId(StepWork stepWork, Long nodeStateId) {
		return cRaterRequestDao.getCRaterRequestByStepWorkIdNodeStateId(stepWork, nodeStateId);
	}

	@Override
	public List<CRaterRequest> getIncompleteCRaterRequests() {
		return cRaterRequestDao.getIncompleteCRaterRequests();
	}
}
