/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
package org.wise.portal.domain.portal;

import java.util.Date;

import org.json.JSONObject;
import org.wise.portal.domain.Persistable;

/**
 * @author Geoffrey Kwan
 */
public interface PortalStatistics extends Persistable {

  Date getTimestamp();

  void setTimestamp(Date timestamp);

  Long getTotalNumberStudents();

  void setTotalNumberStudents(Long totalNumberStudents);

  Long getTotalNumberStudentLogins();

  void setTotalNumberStudentLogins(Long totalNumberStudentLogins);

  Long getTotalNumberTeachers();

  void setTotalNumberTeachers(Long totalNumberTeachers);

  Long getTotalNumberTeacherLogins();

  void setTotalNumberTeacherLogins(Long totalNumberTeacherLogins);

  Long getTotalNumberProjects();

  void setTotalNumberProjects(Long totalNumberProjects);

  Long getTotalNumberRuns();

  void setTotalNumberRuns(Long totalNumberRuns);

  Long getTotalNumberProjectsRun();

  void setTotalNumberProjectsRun(Long totalNumberProjectsRun);

  JSONObject getJSONObject();
}
