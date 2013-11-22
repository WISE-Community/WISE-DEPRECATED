package org.wise.portal.service.attendance.impl;

import java.util.Date;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.attendance.StudentAttendanceDao;
import org.wise.portal.domain.attendance.StudentAttendance;
import org.wise.portal.domain.attendance.impl.StudentAttendanceImpl;
import org.wise.portal.service.attendance.StudentAttendanceService;

public class StudentAttendanceServiceImpl implements StudentAttendanceService {
	
	private StudentAttendanceDao<StudentAttendance> studentAttendanceDao;

	/**
	 * Create a new row in the student attendance table
	 * @see org.wise.portal.service.attendance.StudentAttendanceService#addStudentAttendanceEntry(java.lang.Long, java.lang.Long, java.util.Date, java.lang.String, java.lang.String)
	 */
	@Transactional()
	public void addStudentAttendanceEntry(Long workgroupId, Long runId, Date loginTimestamp, String presentUserIds, String absentUserIds) {
		StudentAttendance studentAttendance = new StudentAttendanceImpl(workgroupId, runId, loginTimestamp, presentUserIds, absentUserIds);
		studentAttendanceDao.save(studentAttendance);
	}
	
	/**
	 * Get the a list of StudentAttendance object that have the given runId
	 * @param runId the id of the run we want StudentAttendance objects for
	 * @see org.wise.portal.service.attendance.StudentAttendanceService#getStudentAttendanceByRunId(java.lang.Long)
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
	 * @see org.wise.portal.service.attendance.StudentAttendanceService#getStudentAttendanceDao()
	 */
	public StudentAttendanceDao<StudentAttendance> getStudentAttendanceDao() {
		return studentAttendanceDao;
	}

	/**
	 * 
	 * @see org.wise.portal.service.attendance.StudentAttendanceService#setStudentAttendanceDao(org.wise.portal.dao.attendance.StudentAttendanceDao)
	 */
	public void setStudentAttendanceDao(
			StudentAttendanceDao<StudentAttendance> studentAttendanceDao) {
		this.studentAttendanceDao = studentAttendanceDao;
	}
}
