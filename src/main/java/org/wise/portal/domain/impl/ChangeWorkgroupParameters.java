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
package org.wise.portal.domain.impl;

import java.io.Serializable;

import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;

/**
 * @author Sally Ahn
 */
public class ChangeWorkgroupParameters implements Serializable {

  private static final long serialVersionUID = 1L;

  private User student;

  private Workgroup workgroupFrom;

  private Workgroup workgroupTo;

  private Long workgroupToId;

  private Long runId;

  private Long periodId;

  public void setStudent(User student) {
    this.student = student;
  }

  public User getStudent() {
    return this.student;
  }

  public void setWorkgroupFrom(Workgroup workgroup) {
    this.workgroupFrom = workgroup;
  }

  public Workgroup getWorkgroupFrom() {
    return this.workgroupFrom;
  }

  public void setWorkgroupTo(Workgroup workgroup) {
    this.workgroupTo = workgroup;
  }

  public Workgroup getWorkgroupTo() {
    return this.workgroupTo;
  }

  /**
   * @return the workgroupToId
   */
  public Long getWorkgroupToId() {
    return workgroupToId;
  }

  /**
   * @param workgroupToId the workgroupToId to set
   */
  public void setWorkgroupToId(Long workgroupToId) {
    this.workgroupToId = workgroupToId;
  }

  /**
   * @return the runId
   */
  public Long getRunId() {
    return runId;
  }

  /**
   * @param runId the runId to set
   */
  public void setRunId(Long runId) {
    this.runId = runId;
  }

  /**
   * @return the periodId
   */
  public Long getPeriodId() {
    return periodId;
  }

  /**
   * @param periodId the periodId to set
   */
  public void setPeriodId(Long periodId) {
    this.periodId = periodId;
  }
}
