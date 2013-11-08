package org.telscenter.sail.webapp.service.attendance;

import java.util.Date;
import java.util.List;

import org.telscenter.sail.webapp.dao.attendance.StudentAttendanceDao;
import org.telscenter.sail.webapp.domain.attendance.StudentAttendance;

public interface StudentAttendanceService {

	/**
	 * Create a new row in the student attendance table
	 */
	public void addStudentAttendanceEntry(Long workgroupId, Long runId, Date loginTimestamp, String presentUserIds, String absentUserIds);
	
	/**
	 * Get the a list of StudentAttendance object that have the given runId
	 * @param runId the id of the run we want StudentAttendance objects for
	 */
	public List<StudentAttendance> getStudentAttendanceByRunId(Long runId);

	/**
	 * Get the a list of StudentAttendance object that have the given runId
	 * @param runId the id of the run we want StudentAttendance objects for
	 * @param lookBackNumDays int how many days to look back 
	 */
	public List<StudentAttendance> getStudentAttendanceByRunIdAndPeriod(Long runId, int lookBackNumDays);
	
	public StudentAttendanceDao<StudentAttendance> getStudentAttendanceDao();

	public void setStudentAttendanceDao(StudentAttendanceDao<StudentAttendance> studentAttendanceDao);
}
