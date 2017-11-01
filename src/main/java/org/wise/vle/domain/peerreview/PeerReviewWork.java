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
package org.wise.vle.domain.peerreview;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.wise.vle.domain.PersistableDomain;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;

@Entity
@Table(name="peerreviewwork")
@Inheritance(strategy=InheritanceType.JOINED)
public class PeerReviewWork extends PersistableDomain {

  protected static Long authorWorkgroupId = -2L;

  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Long id = null;

  @Column(name="runId")
  private Long runId = null;

  @Column(name="periodId")
  private Long periodId = null;

  @ManyToOne(cascade = {CascadeType.PERSIST})
  private UserInfo userInfo;

  @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.MERGE})
  private Node node;

  @ManyToOne(cascade = {CascadeType.PERSIST})
  private StepWork stepWork;

  @ManyToOne(cascade = {CascadeType.PERSIST})
  private UserInfo reviewerUserInfo;

  @ManyToOne(cascade = {CascadeType.PERSIST})
  private Annotation annotation;

  @Override
  protected Class<?> getObjectClass() {
    // TODO Auto-generated method stub
    return null;
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

  public UserInfo getUserInfo() {
    return userInfo;
  }

  public void setUserInfo(UserInfo userInfo) {
    this.userInfo = userInfo;
  }

  public Node getNode() {
    return node;
  }

  public void setNode(Node node) {
    this.node = node;
  }

  public StepWork getStepWork() {
    return stepWork;
  }

  public void setStepWork(StepWork stepWork) {
    this.stepWork = stepWork;
  }

  public UserInfo getReviewerUserInfo() {
    return reviewerUserInfo;
  }

  public void setReviewerUserInfo(UserInfo reviewerUserInfo) {
    this.reviewerUserInfo = reviewerUserInfo;
  }

  public Annotation getAnnotation() {
    return annotation;
  }

  public void setAnnotation(Annotation annotation) {
    this.annotation = annotation;
  }

  public static Long getAuthorWorkgroupId() {
    return authorWorkgroupId;
  }
}
