package org.wise.portal.dao.peerreview;


import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewGate;

import net.sf.sail.webapp.dao.SimpleDao;

public interface PeerReviewGateDao<T extends PeerReviewGate> extends SimpleDao<T> {

	public PeerReviewGate getPeerReviewGateById(Long id);
	
	public void savePeerReviewGate(PeerReviewGate peerReviewGate);
	
	public PeerReviewGate getPeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node);
	
	public PeerReviewGate getOrCreatePeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node);
	
	public boolean calculatePeerReviewOpen(Long runId, Long periodId, Node node, int numWorkgroups, int openPercentageTrigger, int openNumberTrigger);
	
	public boolean peerReviewGateOpenPercentageTriggerSatisfied(int numWorkgroupsSubmitted, int numWorkgroups, int openPercentageTrigger);
	
	public boolean peerReviewGateOpenNumberTriggerSatisfied(int numWorkgroupsSubmitted, int openNumberTrigger);
}
