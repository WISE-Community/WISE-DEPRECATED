package org.telscenter.sail.webapp.dao.crater;

import java.util.List;

import vle.domain.cRater.CRaterRequest;
import vle.domain.work.StepWork;
import net.sf.sail.webapp.dao.SimpleDao;

public interface CRaterRequestDao<T extends CRaterRequest> extends SimpleDao<CRaterRequest> {

	public CRaterRequest getCRaterRequestByStepWorkIdNodeStateId(StepWork stepWork, Long nodeStateId);
	
	public List<CRaterRequest> getIncompleteCRaterRequests();
}
