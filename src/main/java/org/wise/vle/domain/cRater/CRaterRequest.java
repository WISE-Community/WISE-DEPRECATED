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
package org.wise.vle.domain.cRater;

import java.sql.Timestamp;
import java.util.Calendar;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.Getter;
import lombok.Setter;
import org.wise.vle.domain.PersistableDomain;
import org.wise.vle.domain.work.StepWork;

/**
 * Domain representing CRaterRequests, pending and completed.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@Entity
@Table(name = "craterrequest")
@Getter
@Setter
public class CRaterRequest extends PersistableDomain {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long id = null;

  @Column(name = "cRaterItemId", nullable=false)
  private String cRaterItemId;

  @Column(name = "cRaterItemType")
  private String cRaterItemType;

  @JoinColumn(name = "stepWorkId")
  @ManyToOne(cascade = {CascadeType.PERSIST})
  private StepWork stepWork;   // the work that is being cRater annotated

  @Column(name = "nodeStateId", nullable=false)
  private Long nodeStateId;

  @Column(name = "runId", nullable=false)
  private Long runId;

  @Column(name = "timeCreated")
  private Timestamp timeCreated = null;  // when this cRater annotation request was created

  @Column(name = "timeCompleted")
  private Timestamp timeCompleted = null;  // when this cRater annotation request was completed

  @Column(name = "failCount")
  private int failCount = 0;  // number of unsuccessful cRater requests

  @Column(name = "cRaterResponse", length = 2048, columnDefinition = "text")
  private String cRaterResponse = null;

  public CRaterRequest() {
  }

  /**
   * @param cRaterItemId
   * @param stepWork
   * @param nodeStateId
   */
  public CRaterRequest(String cRaterItemId, String cRaterItemType, StepWork stepWork,
      Long nodeStateId, Long runId) {
    super();
    this.cRaterItemId = cRaterItemId;
    this.cRaterItemType = cRaterItemType;
    this.stepWork = stepWork;
    this.nodeStateId = nodeStateId;
    Calendar now = Calendar.getInstance();
    this.timeCreated = new Timestamp(now.getTimeInMillis());
    this.runId = runId;
  }

  @Override
  protected Class<?> getObjectClass() {
    return CRaterRequest.class;
  }
}
