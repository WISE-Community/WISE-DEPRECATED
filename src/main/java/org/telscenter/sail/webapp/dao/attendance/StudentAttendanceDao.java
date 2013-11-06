package org.telscenter.sail.webapp.dao.attendance;

import java.util.List;

import org.telscenter.sail.webapp.domain.attendance.StudentAttendance;

import net.sf.sail.webapp.dao.SimpleDao;

public interface StudentAttendanceDao<T extends StudentAttendance> extends SimpleDao<T> {

	public List<StudentAttendance> getStudentAttendanceByRunId(Long runId);

	public List<StudentAttendance> getStudentAttendanceByRunIdAndPeriod(Long runId, int lookBackNumDays);
}
