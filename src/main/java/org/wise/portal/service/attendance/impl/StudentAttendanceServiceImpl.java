/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.service.attendance.impl;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.attendance.StudentAttendanceDao;
import org.wise.portal.domain.attendance.StudentAttendance;
import org.wise.portal.domain.attendance.impl.StudentAttendanceImpl;
import org.wise.portal.service.attendance.StudentAttendanceService;

@Service
public class StudentAttendanceServiceImpl implements StudentAttendanceService {

  @Autowired
  private StudentAttendanceDao<StudentAttendance> studentAttendanceDao;

  /**
   * Create a new row in the student attendance table
   * @see StudentAttendanceService#addStudentAttendanceEntry(Long, Long, Date, String, String)
   */
  @Transactional()
  public void addStudentAttendanceEntry(Long workgroupId, Long runId, Date loginTimestamp,
      String presentUserIds, String absentUserIds) {
    StudentAttendance studentAttendance = new StudentAttendanceImpl(workgroupId, runId,
        loginTimestamp, presentUserIds, absentUserIds);
    studentAttendanceDao.save(studentAttendance);
  }

  /**
   * Get the a list of StudentAttendance object that have the given runId
   * @param runId the id of the run we want StudentAttendance objects for
   * @see StudentAttendanceService#getStudentAttendanceByRunId(Long)
   */
  public List<StudentAttendance> getStudentAttendanceByRunId(Long runId) {
    List<StudentAttendance> studentAttendanceList =
        studentAttendanceDao.getStudentAttendanceByRunId(runId);
    return studentAttendanceList;
  }

  @Override
  public List<StudentAttendance> getStudentAttendanceByRunIdAndPeriod(Long runId, int lookBackNumDays) {
    List<StudentAttendance> studentAttendanceList =
        studentAttendanceDao.getStudentAttendanceByRunIdAndPeriod(runId,lookBackNumDays);
    return studentAttendanceList;
  }
}
