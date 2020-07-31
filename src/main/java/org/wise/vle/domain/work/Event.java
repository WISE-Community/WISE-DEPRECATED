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
package org.wise.vle.domain.work;

import lombok.Getter;
import lombok.Setter;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.vle.domain.PersistableDomain;

import javax.persistence.*;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.Index;
import javax.persistence.Table;

import java.sql.Timestamp;

/**
 * Domain object representing an event that occur in the VLE (used in WISE5). An Event can be a
 * mouse click, step_enter, model_state_changed, etc.
 *
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "events", indexes = { @Index(columnList = "runId", name = "eventsRunIdIndex"),
    @Index(columnList = "workgroupId", name = "eventsWorkgroupIdIndex"),
    @Index(columnList = "projectId", name = "eventsProjectIdIndex"),
    @Index(columnList = "userId", name = "eventsUserIdIndex") })
@Getter
@Setter
public class Event extends PersistableDomain {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Integer id = null;

  @ManyToOne(targetEntity = ProjectImpl.class, cascade = {
      CascadeType.PERSIST }, fetch = FetchType.LAZY)
  @JoinColumn(name = "projectId", nullable = true)
  private Project project;

  @ManyToOne(targetEntity = RunImpl.class, cascade = {
      CascadeType.PERSIST }, fetch = FetchType.LAZY)
  @JoinColumn(name = "runId", nullable = true)
  private Run run;

  @ManyToOne(targetEntity = PersistentGroup.class, cascade = {
      CascadeType.PERSIST }, fetch = FetchType.LAZY)
  @JoinColumn(name = "periodId")
  private Group period;

  @ManyToOne(targetEntity = WorkgroupImpl.class, cascade = {
      CascadeType.PERSIST }, fetch = FetchType.LAZY)
  @JoinColumn(name = "workgroupId", nullable = true)
  private Workgroup workgroup;

  @ManyToOne(targetEntity = UserImpl.class, cascade = {
      CascadeType.PERSIST }, fetch = FetchType.LAZY)
  @JoinColumn(name = "userId", nullable = true)
  private User user;

  @Column(name = "nodeId", length = 30)
  private String nodeId;

  @Column(name = "componentId", length = 30)
  private String componentId;

  @Column(name = "componentType", length = 30)
  private String componentType;

  @Column(name = "context", nullable = false, length = 30)
  private String context;

  @Column(name = "category", nullable = false)
  private String category;

  @Column(name = "event", nullable = false)
  private String event;

  @Column(name = "data", length = 65536, columnDefinition = "text")
  private String data;

  @Column(name = "clientSaveTime", nullable = false)
  private Timestamp clientSaveTime;

  @Column(name = "serverSaveTime", nullable = false)
  private Timestamp serverSaveTime;

  @Override
  protected Class<?> getObjectClass() {
    return Event.class;
  }

  public JSONObject toJSON() {
    JSONObject eventJSONObject = new JSONObject();
    try {
      if (id != null) {
        eventJSONObject.put("id", id);
      }

      if (run != null) {
        Long runId = run.getId();
        eventJSONObject.put("runId", runId);
      }

      if (period != null) {
        Long periodId = period.getId();
        eventJSONObject.put("periodId", periodId);
      }

      if (workgroup != null) {
        Long workgroupId = workgroup.getId();
        eventJSONObject.put("workgroupId", workgroupId);
      }

      if (nodeId != null) {
        eventJSONObject.put("nodeId", nodeId);
      }

      if (componentId != null) {
        eventJSONObject.put("componentId", componentId);
      }

      if (componentType != null) {
        eventJSONObject.put("componentType", componentType);
      }

      if (context != null) {
        eventJSONObject.put("context", context);
      }

      if (category != null) {
        eventJSONObject.put("category", category);
      }

      if (event != null) {
        eventJSONObject.put("event", event);
      }

      if (data != null) {
        try {
          eventJSONObject.put("data", new JSONObject(data));
        } catch (Exception e) {
          eventJSONObject.put("data", data);
        }
      }

      if (clientSaveTime != null) {
        eventJSONObject.put("clientSaveTime", clientSaveTime.getTime());
      }

      if (serverSaveTime != null) {
        eventJSONObject.put("serverSaveTime", serverSaveTime.getTime());
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return eventJSONObject;
  }
}
