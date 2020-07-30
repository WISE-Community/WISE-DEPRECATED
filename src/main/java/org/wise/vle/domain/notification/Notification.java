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
package org.wise.vle.domain.notification;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.Setter;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.vle.domain.PersistableDomain;

import javax.persistence.*;
import java.sql.Timestamp;

/**
 * Domain object representing a notification (student-student, teacher-student) (used in WISE5)
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "notification",  indexes = {
    @Index(columnList = "runId", name = "notificationRunIdIndex"),
    @Index(columnList = "toWorkgroupId", name = "notificationToWorkgroupIdIndex"),
    @Index(columnList = "fromWorkgroupId", name = "notificationFromWorkgroupIdIndex")
})
@Getter
@Setter
public class Notification extends PersistableDomain {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Integer id = null;

  @ManyToOne(targetEntity = RunImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "runId", nullable = false)
  @JsonIgnore
  private Run run;

  @ManyToOne(targetEntity = PersistentGroup.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "periodId", nullable = false)
  @JsonIgnore
  private Group period;

  @ManyToOne(targetEntity = WorkgroupImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "toWorkgroupId", nullable = false)
  @JsonIgnore
  private Workgroup toWorkgroup;

  @ManyToOne(targetEntity = WorkgroupImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "fromWorkgroupId", nullable = false)
  @JsonIgnore
  private Workgroup fromWorkgroup;

  @Column(name = "groupId", length = 30)
  private String groupId;  // id of the group of notifications this notification belongs to, if any.

  @Column(name = "nodeId", length = 30)
  private String nodeId;  // which node created this notification, if any

  @Column(name = "componentId", length = 30)
  private String componentId;  // which component created this notification, if any

  @Column(name = "componentType", length = 30)
  private String componentType;  // type of component that created this notification, if any

  @Column(name = "type", nullable = false)
  private String type;  // type of this notification, ex: component, node, vle, teacherToStudent, etc

  @Column(name = "message", nullable = false)
  private String message;  // message of the notification

  @Column(name = "data", length = 5120000, columnDefinition = "mediumtext")
  private String data;  // other specific information about this notification

  @Column(name = "timeGenerated", nullable = false)
  private Timestamp timeGenerated;  // when this notification was generated, client time

  @Column(name = "timeDismissed")
  private Timestamp timeDismissed;  // when this notification was dismissed, client time

  @Column(name = "serverSaveTime", nullable = false)
  private Timestamp serverSaveTime;

  @Transient
  private long runId;

  @Transient
  private long periodId;

  @Transient
  private long toWorkgroupId;

  @Transient
  private long fromWorkgroupId;

  @Override
  protected Class<?> getObjectClass() {
    return Notification.class;
  }

  public void convertToClientNotification() {
    this.setRunId(this.getRun().getId());
    this.setPeriodId(this.getPeriod().getId());
    this.setToWorkgroupId(this.getToWorkgroup().getId());
    this.setFromWorkgroupId(this.getFromWorkgroup().getId());
  }

  public long getRunId() {
    return run.getId();
  }

  public long getPeriodId() {
    return period.getId();
  }

  public long getToWorkgroupId() {
    return toWorkgroup.getId();
  }

  public long getFromWorkgroupId() {
    return fromWorkgroup.getId();
  }

  public JSONObject toJSON() {
    JSONObject notificationJSONObject = new JSONObject();
    try {
      if (id != null) {
        notificationJSONObject.put("id", id);
      }

      if (run != null) {
        Long runId = run.getId();
        notificationJSONObject.put("runId", runId);
      }

      if (period != null) {
        Long periodId = period.getId();
        notificationJSONObject.put("periodId", periodId);
      }

      if (toWorkgroup != null) {
        Long toWorkgroupId = toWorkgroup.getId();
        notificationJSONObject.put("toWorkgroupId", toWorkgroupId);
      }

      if (fromWorkgroup != null) {
        Long fromWorkgroupId = fromWorkgroup.getId();
        notificationJSONObject.put("fromWorkgroupId", fromWorkgroupId);
      }

      if (groupId != null) {
        notificationJSONObject.put("groupId", groupId);
      }

      if (nodeId != null) {
        notificationJSONObject.put("nodeId", nodeId);
      }

      if (componentId != null) {
        notificationJSONObject.put("componentId", componentId);
      }

      if (componentType != null) {
        notificationJSONObject.put("componentType", componentType);
      }

      if (type != null) {
        notificationJSONObject.put("type", type);
      }

      if (message != null) {
        notificationJSONObject.put("message", message);
      }

      if (data != null) {
        notificationJSONObject.put("data", new JSONObject(data));
      }

      if (serverSaveTime != null) {
        notificationJSONObject.put("serverSaveTime", serverSaveTime.getTime());
      }

      if (timeGenerated != null) {
        notificationJSONObject.put("timeGenerated", timeGenerated.getTime());
      }

      if (timeDismissed != null) {
        notificationJSONObject.put("timeDismissed", timeDismissed.getTime());
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return notificationJSONObject;
  }
}
