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
package org.wise.vle.domain.status;

import java.sql.Timestamp;
import java.util.Calendar;

import javax.persistence.*;

import org.wise.vle.domain.PersistableDomain;

/**
 * @author Geoffrey Kwan
 */
@Entity
@Table(name = "studentstatus",
  indexes = { @Index(columnList = "runId", name = "studentstatusRunIdIndex"), @Index(columnList = "workgroupId", name = "studentstatusWorkgroupIdIndex")} )
public class StudentStatus extends PersistableDomain {

  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Long id = null;

  @Column(name = "runId")
  private Long runId = null;

  @Column(name = "periodId")
  private Long periodId = null;

  @Column(name = "workgroupId")
  private Long workgroupId = null;

  @Column(name = "timestamp")
  private Timestamp timestamp = null;

  @Column(name = "status", length = 5120000, columnDefinition = "mediumtext")
  private String status = null;

  public StudentStatus() {
  }

  /**
   * Constructor for StudentStatus
   * @param runId the run id
   * @param periodId the period id
   * @param workgroupId the workgroup id
   * @param status a JSON string containing the student status
   */
  public StudentStatus(Long runId, Long periodId, Long workgroupId, String status) {
    setRunId(runId);
    setPeriodId(periodId);
    setWorkgroupId(workgroupId);
    setStatus(status);
    Calendar now = Calendar.getInstance();
    setTimestamp(new Timestamp(now.getTimeInMillis()));
  }

  @Override
  protected Class<?> getObjectClass() {
    return StudentStatus.class;
  }

  public Long getRunId() {
    return runId;
  }

  public void setRunId(Long runId) {
    this.runId = runId;
  }

  public Long getPeriodId() {
    return periodId;
  }

  public void setPeriodId(Long periodId) {
    this.periodId = periodId;
  }

  public Long getWorkgroupId() {
    return workgroupId;
  }

  public void setWorkgroupId(Long workgroupId) {
    this.workgroupId = workgroupId;
  }

  public Timestamp getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(Timestamp timestamp) {
    this.timestamp = timestamp;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}
