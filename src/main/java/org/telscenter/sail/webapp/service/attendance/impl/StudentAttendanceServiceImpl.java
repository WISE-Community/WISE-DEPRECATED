package org.telscenter.sail.webapp.service.attendance.impl;

import java.util.Date;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.telscenter.sail.webapp.dao.attendance.StudentAttendanceDao;
import org.telscenter.sail.webapp.domain.attendance.StudentAttendance;
import org.telscenter.sail.webapp.domain.attendance.impl.StudentAttendanceImpl;
import org.telscenter.sail.webapp.service.attendance.StudentAttendanceService;

public class StudentAttendanceServiceImpl implements StudentAttendanceService {
	
	private StudentAttendanceDao<StudentAttendance> studentAttendanceDao;

	/**
	 * Create a new row in the student attendance table
	 * @see org.telscenter.sail.webapp.service.attendance.StudentAttendanceService#addStudentAttendanceEntry(java.lang.Long, java.lang.Long, java.util.Date, java.lang.String, java.lang.String)
	 */
	@Transactional()
	public void addStudentAttendanceEntry(Long workgroupId, Long runId, Date loginTimestamp, String presentUserIds, String absentUserIds) {
		StudentAttendance studentAttendance = new StudentAttendanceImpl(workgroupId, runId, loginTimestamp, presentUserIds, absentUserIds);
		studentAttendanceDao.save(studentAttendance);
	}
	
	/**
	 * Get the a list of StudentAttendance object that have the given runId
	 * @param runId the id of the run we want StudentAttendance objects for
	 * @see org.telscenter.sail.webapp.service.attendance.StudentAttendanceService#getStudentAttendanceByRunId(java.lang.Long)
	 */
	public List<StudentAttendance> getStudentAttendanceByRunId(Long runId) {
		List<StudentAttendance> studentAttendanceList = studentAttendanceDao.getStudentAttendanceByRunId(runId);
		return studentAttendanceList;
	}
	
	@Override
	public List<StudentAttendance> getStudentAttendanceByRunIdAndPeriod(Long runId, int lookBackNumDays) {
		List<StudentAttendance> studentAttendanceList = studentAttendanceDao.getStudentAttendanceByRunIdAndPeriod(runId,lookBackNumDays);
		return studentAttendanceList;
	}
	
	/**
	 * 
	 * @see org.telscenter.sail.webapp.service.attendance.StudentAttendanceService#getStudentAttendanceDao()
	 */
	public StudentAttendanceDao<StudentAttendance> getStudentAttendanceDao() {
		return studentAttendanceDao;
	}

	/**
	 * 
	 * @see org.telscenter.sail.webapp.service.attendance.StudentAttendanceService#setStudentAttendanceDao(org.telscenter.sail.webapp.dao.attendance.StudentAttendanceDao)
	 */
	public void setStudentAttendanceDao(
			StudentAttendanceDao<StudentAttendance> studentAttendanceDao) {
		this.studentAttendanceDao = studentAttendanceDao;
	}
}
