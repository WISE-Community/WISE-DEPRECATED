package org.telscenter.sail.webapp.dao.peerreview;

import java.util.List;

import vle.domain.annotation.Annotation;
import vle.domain.node.Node;
import vle.domain.peerreview.PeerReviewWork;
import vle.domain.user.UserInfo;
import vle.domain.work.StepWork;
import net.sf.sail.webapp.dao.SimpleDao;

public interface PeerReviewWorkDao<T extends PeerReviewWork> extends SimpleDao<T> {

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
}
