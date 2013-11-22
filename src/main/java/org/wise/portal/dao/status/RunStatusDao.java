package org.wise.portal.dao.status;

import org.wise.vle.domain.status.RunStatus;

import net.sf.sail.webapp.dao.SimpleDao;

public interface RunStatusDao<T extends RunStatus> extends SimpleDao<RunStatus> {

	public RunStatus getRunStatusByRunId(Long runId);
}
