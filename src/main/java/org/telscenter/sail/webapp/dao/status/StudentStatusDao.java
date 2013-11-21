package org.telscenter.sail.webapp.dao.status;

import java.util.List;

import vle.domain.status.StudentStatus;
import net.sf.sail.webapp.dao.SimpleDao;

public interface StudentStatusDao<T extends StudentStatus> extends SimpleDao<StudentStatus> {

	public StudentStatus getStudentStatusByWorkgroupId(Long workgroupId);
	
	public List<StudentStatus> getStudentStatusesByPeriodId(Long periodId);
	
	public List<StudentStatus> getStudentStatusesByRunId(Long runId);
}
