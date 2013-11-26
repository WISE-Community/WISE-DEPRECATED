package org.wise.portal.dao.status;

import org.wise.portal.dao.SimpleDao;
import org.wise.vle.domain.status.RunStatus;


public interface RunStatusDao<T extends RunStatus> extends SimpleDao<RunStatus> {

	public RunStatus getRunStatusById(Long id);
	
	public void saveRunStatus(RunStatus runStatus);
	
	public RunStatus getRunStatusByRunId(Long runId);
}
