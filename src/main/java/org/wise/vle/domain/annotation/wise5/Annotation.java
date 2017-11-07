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
package org.wise.vle.domain.annotation.wise5;

import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.vle.domain.PersistableDomain;
import org.wise.vle.domain.work.NotebookItem;
import org.wise.vle.domain.work.StudentWork;

import javax.persistence.*;
import java.sql.Timestamp;

/**
 * WISE5 Annotation Domain Object
 * Annotations are what users annotate on other
 * user's work, such as Comments, Scores, Flags.
 *
 * @author Hiroki Terashima
 */
@Entity(name = "wise5Annotation")
@Table(name = "annotations",  indexes = {
  @Index(columnList = "runId", name = "annotationsRunIdIndex"),
  @Index(columnList = "toWorkgroupId", name = "annotationsToWorkgroupIdIndex")})
public class Annotation extends PersistableDomain {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Integer id = null;

  @ManyToOne(targetEntity = RunImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "runId", nullable = false)
  private Run run;

  @ManyToOne(targetEntity = PersistentGroup.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "periodId", nullable = false)
  private Group period;

  @ManyToOne(targetEntity = WorkgroupImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "fromWorkgroupId", nullable = true)
  private Workgroup fromWorkgroup;

  @ManyToOne(targetEntity = WorkgroupImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "toWorkgroupId", nullable = false)
  private Workgroup toWorkgroup;

  @Column(name = "nodeId", length = 30, nullable = true)
  private String nodeId;

  @Column(name = "componentId", length = 30, nullable = true)
  private String componentId;

  @ManyToOne(targetEntity = StudentWork.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "studentWorkId", nullable = true)
  private StudentWork studentWork;

  @Column(name = "localNotebookItemId", length = 30, nullable = true)
  private String localNotebookItemId;

  @ManyToOne(targetEntity = NotebookItem.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "notebookItemId", nullable = true)
  private NotebookItem notebookItem;

  @Column(name = "type", length = 30, nullable = false)
  private String type;

  @Column(name = "data", length = 65536, columnDefinition = "text", nullable = false)
  private String data;

  @Column(name = "clientSaveTime", nullable = false)
  private Timestamp clientSaveTime;

  @Column(name = "serverSaveTime", nullable = false)
  private Timestamp serverSaveTime;

  public Timestamp getClientSaveTime() {
    return clientSaveTime;
  }

  public void setClientSaveTime(Timestamp clientSaveTime) {
    this.clientSaveTime = clientSaveTime;
  }

  public Timestamp getServerSaveTime() {
    return serverSaveTime;
  }

  public void setServerSaveTime(Timestamp serverSaveTime) {
    this.serverSaveTime = serverSaveTime;
  }

  public Run getRun() {
    return run;
  }

  public void setRun(Run run) {
    this.run = run;
  }

  public Group getPeriod() {
    return period;
  }

  public void setPeriod(Group period) {
    this.period = period;
  }

  public Workgroup getFromWorkgroup() {
    return fromWorkgroup;
  }

  public void setFromWorkgroup(Workgroup fromWorkgroup) {
    this.fromWorkgroup = fromWorkgroup;
  }

  public Workgroup getToWorkgroup() {
    return toWorkgroup;
  }

  public void setToWorkgroup(Workgroup toWorkgroup) {
    this.toWorkgroup = toWorkgroup;
  }

  public String getNodeId() {
    return nodeId;
  }

  public void setNodeId(String nodeId) {
    this.nodeId = nodeId;
  }

  public String getComponentId() {
    return componentId;
  }

  public void setComponentId(String componentId) {
    this.componentId = componentId;
  }

  public StudentWork getStudentWork() {
    return studentWork;
  }

  public void setStudentWork(StudentWork studentWork) {
    this.studentWork = studentWork;
  }

  public String getLocalNotebookItemId() {
    return localNotebookItemId;
  }

  public void setLocalNotebookItemId(String localNotebookItemId) {
    this.localNotebookItemId = localNotebookItemId;
  }

  public NotebookItem getNotebookItem() {
    return notebookItem;
  }

  public void setNotebookItem(NotebookItem notebookItem) {
    this.notebookItem = notebookItem;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getData() {
    return data;
  }

  public void setData(String data) {
    this.data = data;
  }

  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  @Override
  protected Class<?> getObjectClass() {
    return Annotation.class;
  }

  /**
   * Get the JSON representation of the Event
   * @return a JSONObject with the values from the Event
   */
  public JSONObject toJSON() {
    JSONObject eventJSONObject = new JSONObject();

    try {
      if (this.id != null) {
        eventJSONObject.put("id", this.id);
      }

      if (this.run != null) {
        Long runId = this.run.getId();
        eventJSONObject.put("runId", runId);
      }

      if (this.period != null) {
        Long periodId = this.period.getId();
        eventJSONObject.put("periodId", periodId);
      }

      if (this.fromWorkgroup != null) {
        Long fromWorkgroupId = this.fromWorkgroup.getId();
        eventJSONObject.put("fromWorkgroupId", fromWorkgroupId);
      }

      if (this.toWorkgroup != null) {
        Long toWorkgroupId = this.toWorkgroup.getId();
        eventJSONObject.put("toWorkgroupId", toWorkgroupId);
      }

      if (this.nodeId != null) {
        eventJSONObject.put("nodeId", this.nodeId);
      }

      if (this.componentId != null) {
        eventJSONObject.put("componentId", this.componentId);
      }

      if (this.studentWork != null) {
        eventJSONObject.put("studentWorkId", this.studentWork.getId());
      }

      if (this.localNotebookItemId != null) {
        eventJSONObject.put("localNotebookItemId", this.localNotebookItemId);
      }

      if (this.notebookItem != null) {
        eventJSONObject.put("notebookItemId", this.notebookItem.getId());
      }

      if (this.type != null) {
        eventJSONObject.put("type", this.type);
      }

      if (this.data != null) {
        try {
          eventJSONObject.put("data", new JSONObject(this.data));
        } catch (JSONException e) {
          eventJSONObject.put("data", this.data);
        }
      }

      if (this.clientSaveTime != null) {
        eventJSONObject.put("clientSaveTime", clientSaveTime.getTime());
      }

      if (this.serverSaveTime != null) {
        eventJSONObject.put("serverSaveTime", serverSaveTime.getTime());
      }

    } catch (JSONException e) {
      e.printStackTrace();
    }
    return eventJSONObject;
  }
}
