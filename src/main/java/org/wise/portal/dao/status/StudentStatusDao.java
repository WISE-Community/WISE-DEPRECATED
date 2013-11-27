package org.wise.portal.dao.status;

import java.util.List;

import org.wise.portal.dao.SimpleDao;
import org.wise.vle.domain.status.StudentStatus;


public interface StudentStatusDao<T extends StudentStatus> extends SimpleDao<StudentStatus> {

	public StudentStatus getStudentStatusById(Long id);
	
	public void saveStudentStatus(StudentStatus studentStatus);
	
	public StudentStatus getStudentStatusByWorkgroupId(Long workgroupId);
	
	public List<StudentStatus> getStudentStatusesByPeriodId(Long periodId);
	
	public List<StudentStatus> getStudentStatusesByRunId(Long runId);
}
