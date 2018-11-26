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
package org.wise.portal.domain.attendance.impl;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import lombok.Getter;
import lombok.Setter;
import org.wise.portal.domain.attendance.StudentAttendance;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@Entity
@Table(name = StudentAttendanceImpl.DATA_STORE_NAME)
@Getter
@Setter
public class StudentAttendanceImpl implements StudentAttendance {

  @Transient
  private static final long serialVersionUID = 1L;

  @Transient
  public static final String DATA_STORE_NAME = "student_attendance";

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", columnDefinition = "int")
  private Integer id = null;

  @Column(name = "workgroupId")
  private Long workgroupId;

  @Column(name = "runId")
  private Long runId;

  @Column(name = "loginTimestamp")
  private Date loginTimestamp;

  @Column(name = "presentUserIds")
  private String presentUserIds;

  @Column(name = "absentUserIds")
  private String absentUserIds;

  public StudentAttendanceImpl() {
  }

  /**
   * Constructor that populates the fields
   * @param workgroupId
   * @param runId
   * @param loginTimestamp
   * @param presentUserIds
   * @param absentUserIds
   */
  public StudentAttendanceImpl(Long workgroupId, Long runId, Date loginTimestamp,
      String presentUserIds, String absentUserIds) {
    super();
    setWorkgroupId(workgroupId);
    setRunId(runId);
    setLoginTimestamp(loginTimestamp);
    setPresentUserIds(presentUserIds);
    setAbsentUserIds(absentUserIds);
  }

  public JSONObject toJSONObject() {
    JSONObject jsonObject = new JSONObject();

    try {
      jsonObject.put("id", getId());
      jsonObject.put("workgroupId", getWorkgroupId());
      jsonObject.put("runId", getRunId());

      Date loginTimestamp = getLoginTimestamp();
      if (loginTimestamp != null) {
        jsonObject.put("loginTimestamp", loginTimestamp.getTime());
      } else {
        jsonObject.put("loginTimestamp", JSONObject.NULL);
      }
      jsonObject.put("presentUserIds", new JSONArray(getPresentUserIds()));
      jsonObject.put("absentUserIds", new JSONArray(getAbsentUserIds()));
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return jsonObject;
  }
}
