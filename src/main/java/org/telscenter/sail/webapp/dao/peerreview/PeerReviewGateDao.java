package org.telscenter.sail.webapp.dao.peerreview;


import vle.domain.node.Node;
import vle.domain.peerreview.PeerReviewGate;
import net.sf.sail.webapp.dao.SimpleDao;

public interface PeerReviewGateDao<T extends PeerReviewGate> extends SimpleDao<T> {

	public PeerReviewGate getPeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node);
	
	public PeerReviewGate getOrCreatePeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node);
	
	public boolean calculatePeerReviewOpen(Long runId, Long periodId, Node node, int numWorkgroups, int openPercentageTrigger, int openNumberTrigger);
	
	public boolean peerReviewGateOpenPercentageTriggerSatisfied(int numWorkgroupsSubmitted, int numWorkgroups, int openPercentageTrigger);
	
	public boolean peerReviewGateOpenNumberTriggerSatisfied(int numWorkgroupsSubmitted, int openNumberTrigger);
}
