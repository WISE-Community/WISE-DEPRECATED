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
package org.wise.portal.domain.portal.impl;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.wise.portal.domain.portal.PortalStatistics;
import org.json.JSONException;
import org.json.JSONObject;

@Entity
@Table(name = "portal_statistics")
public class  PortalStatisticsImpl implements PortalStatistics {

  @Transient
  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", columnDefinition = "smallint")
  public Integer id = null;

  @Column(name = "timestamp")
  private Date timestamp;

  @Column(name = "totalNumberStudents")
  private Long totalNumberStudents;

  @Column(name = "totalNumberStudentLogins")
  private Long totalNumberStudentLogins;

  @Column(name = "totalNumberTeachers")
  private Long totalNumberTeachers;

  @Column(name = "totalNumberTeacherLogins")
  private Long totalNumberTeacherLogins;

  @Column(name = "totalNumberProjects")
  private Long totalNumberProjects;

  @Column(name = "totalNumberRuns")
  private Long totalNumberRuns;

  @Column(name = "totalNumberProjectsRun")
  private Long totalNumberProjectsRun;

  public Serializable getId() {
    return this.id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  public Date getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(Date timestamp) {
    this.timestamp = timestamp;
  }

  public Long getTotalNumberStudents() {
    return totalNumberStudents;
  }

  public void setTotalNumberStudents(Long totalNumberStudents) {
    this.totalNumberStudents = totalNumberStudents;
  }

  public Long getTotalNumberStudentLogins() {
    return totalNumberStudentLogins;
  }

  public void setTotalNumberStudentLogins(Long totalNumberStudentLogins) {
    this.totalNumberStudentLogins = totalNumberStudentLogins;
  }

  public Long getTotalNumberTeachers() {
    return totalNumberTeachers;
  }

  public void setTotalNumberTeachers(Long totalNumberTeachers) {
    this.totalNumberTeachers = totalNumberTeachers;
  }

  public Long getTotalNumberTeacherLogins() {
    return totalNumberTeacherLogins;
  }

  public void setTotalNumberTeacherLogins(Long totalNumberTeacherLogins) {
    this.totalNumberTeacherLogins = totalNumberTeacherLogins;
  }

  public Long getTotalNumberProjects() {
    return totalNumberProjects;
  }

  public void setTotalNumberProjects(Long totalNumberProjects) {
    this.totalNumberProjects = totalNumberProjects;
  }

  public Long getTotalNumberRuns() {
    return totalNumberRuns;
  }

  public void setTotalNumberRuns(Long totalNumberRuns) {
    this.totalNumberRuns = totalNumberRuns;
  }

  public Long getTotalNumberProjectsRun() {
    return totalNumberProjectsRun;
  }

  public void setTotalNumberProjectsRun(Long totalNumberProjectsRun) {
    this.totalNumberProjectsRun = totalNumberProjectsRun;
  }

  /**
   * Get the JSONObject representation of this object
   */
  public JSONObject getJSONObject() {
    JSONObject jsonObject = new JSONObject();
    try {
      Long timestampMilliseconds = null;
      if (timestamp != null) {
        timestampMilliseconds = timestamp.getTime();
      }

      jsonObject.put("timestamp", timestampMilliseconds);
      jsonObject.put("totalNumberStudents", totalNumberStudents);
      jsonObject.put("totalNumberStudentLogins", totalNumberStudentLogins);
      jsonObject.put("totalNumberTeachers", totalNumberTeachers);
      jsonObject.put("totalNumberTeacherLogins", totalNumberTeacherLogins);
      jsonObject.put("totalNumberProjects", totalNumberProjects);
      jsonObject.put("totalNumberRuns", totalNumberRuns);
      jsonObject.put("totalNumberProjectsRun", totalNumberProjectsRun);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return jsonObject;
  }
}
