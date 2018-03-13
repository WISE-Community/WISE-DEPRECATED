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

import org.apache.commons.lang3.RandomStringUtils;
import org.json.JSONArray;
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
import java.util.Calendar;

/**
 * Domain object representing assets uploaded by the student like images and video (used in WISE5)
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "notebookItems",  indexes = {
  @Index(columnList = "runId", name = "notebookItemsRunIdIndex"),
  @Index(columnList = "workgroupId", name = "notebookItemsWorkgroupIdIndex")})
public class NotebookItem extends PersistableDomain {

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
  @JoinColumn(name = "workgroupId", nullable = false)
  private Workgroup workgroup;

  @Column(name = "nodeId", length = 30, nullable = true)
  private String nodeId;

  @Column(name = "componentId", length = 30, nullable = true)
  private String componentId;

  @OneToOne(targetEntity = StudentWork.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "studentWorkId", nullable = true)
  private StudentWork studentWork;

  @OneToOne(targetEntity = StudentAsset.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "studentAssetId", nullable = true)
  private StudentAsset studentAsset;

  @Column(name = "localNotebookItemId", length = 30, nullable = true)
  private String localNotebookItemId;  // ex: [ "1", "letterToACongressperson", "z5hc4jeu12" ]

  @Column(name = "parentNotebookItemId")
  private Integer parentNotebookItemId;

  @Column(name = "groups")
  private String groups;

  @Column(name = "type", length = 30, nullable = true)
  private String type;  // ex: [ "note", "bookmark", "question" ]

  @Column(name = "title", nullable = true)
  private String title;  // ex: "my note on step 1.2"

  @Column(name = "content", columnDefinition = "text", nullable = true)
  private String content; // ex: { note: "my notes with attachments", attachments: [ {studentAssetId: 1, url: "car.png" } ] }

  @Column(name = "clientSaveTime", nullable = false)
  private Timestamp clientSaveTime;

  @Column(name = "serverSaveTime", nullable = false)
  private Timestamp serverSaveTime;

  @Column(name = "clientDeleteTime", nullable = true)
  private Timestamp clientDeleteTime;

  @Column(name = "serverDeleteTime", nullable = true)
  private Timestamp serverDeleteTime;

  @Override
  protected Class<?> getObjectClass() {
    return NotebookItem.class;
  }

  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
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

  public Workgroup getWorkgroup() {
    return workgroup;
  }

  public void setWorkgroup(Workgroup workgroup) {
    this.workgroup = workgroup;
  }

  public String getNodeId() {
    return nodeId;
  }

  public void setNodeId(String nodeId) {
    this.nodeId = nodeId;
  }

  public StudentWork getStudentWork() {
    return studentWork;
  }

  public void setStudentWork(StudentWork studentWork) {
    this.studentWork = studentWork;
  }

  public StudentAsset getStudentAsset() {
    return studentAsset;
  }

  public void setStudentAsset(StudentAsset studentAsset) {
    this.studentAsset = studentAsset;
  }

  public String getLocalNotebookItemId() {
    return localNotebookItemId;
  }

  public void setLocalNotebookItemId(String localNotebookItemId) {
    this.localNotebookItemId = localNotebookItemId;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public String getComponentId() {
    return componentId;
  }

  public void setComponentId(String componentId) {
    this.componentId = componentId;
  }

  public Timestamp getServerSaveTime() {
    return serverSaveTime;
  }

  public void setServerSaveTime(Timestamp serverSaveTime) {
    this.serverSaveTime = serverSaveTime;
  }

  public Timestamp getClientDeleteTime() {
    return clientDeleteTime;
  }

  public void setClientDeleteTime(Timestamp clientDeleteTime) {
    this.clientDeleteTime = clientDeleteTime;
  }

  public Timestamp getServerDeleteTime() {
    return serverDeleteTime;
  }

  public void setServerDeleteTime(Timestamp serverDeleteTime) {
    this.serverDeleteTime = serverDeleteTime;
  }

  public Timestamp getClientSaveTime() {
    return clientSaveTime;
  }

  public void setClientSaveTime(Timestamp clientSaveTime) {
    this.clientSaveTime = clientSaveTime;
  }

  public Integer getParentNotebookItemId() {
    return parentNotebookItemId;
  }

  public void setParentNotebookItemId(Integer parentNotebookItemId) {
    this.parentNotebookItemId = parentNotebookItemId;
  }

  public String getGroups() {
    return groups;
  }

  public void setGroups(String groups) {
    this.groups = groups;
  }

  /**
   * Get the JSON representation of the NotebookItem
   * @return a JSONObject with the values from the NotebookItem
   */
  public JSONObject toJSON() {
    JSONObject notebookItemJSONObject = new JSONObject();

    try {

      if (id != null) {
        notebookItemJSONObject.put("id", id);
      }

      if (run != null) {
        Long runId = run.getId();
        notebookItemJSONObject.put("runId", runId);
      }

      if (period != null) {
        Long periodId = period.getId();
        notebookItemJSONObject.put("periodId", periodId);
      }

      if (workgroup != null) {
        Long workgroupId = workgroup.getId();
        notebookItemJSONObject.put("workgroupId", workgroupId);
      }

      if (nodeId != null) {
        notebookItemJSONObject.put("nodeId", nodeId);
      }

      if (componentId != null) {
        notebookItemJSONObject.put("componentId", componentId);
      }

      if (studentWork != null) {
        notebookItemJSONObject.put("studentWorkId", studentWork.getId());
      }

      if (studentAsset != null) {
        notebookItemJSONObject.put("studentAssetId", studentAsset.getId());
      }

      if (localNotebookItemId != null) {
        notebookItemJSONObject.put("localNotebookItemId", localNotebookItemId);
      }

      if (type != null) {
        notebookItemJSONObject.put("type", type);
      }

      if (title != null) {
        notebookItemJSONObject.put("title", title);
      }

      if (content != null) {
        notebookItemJSONObject.put("content", content);
      }

      if (clientSaveTime != null) {
        notebookItemJSONObject.put("clientSaveTime", clientSaveTime.getTime());
      }

      if (serverSaveTime != null) {
        notebookItemJSONObject.put("serverSaveTime", serverSaveTime.getTime());
      }

      if (clientDeleteTime != null) {
        notebookItemJSONObject.put("clientDeleteTime", clientDeleteTime.getTime());
      }

      if (serverDeleteTime != null) {
        notebookItemJSONObject.put("serverDeleteTime", serverDeleteTime.getTime());
      }

      if (groups != null) {
        notebookItemJSONObject.put("groups", new JSONArray(groups));
      }

      if (parentNotebookItemId != null) {
        notebookItemJSONObject.put("parentNotebookItemId", parentNotebookItemId);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return notebookItemJSONObject;
  }

  public boolean isInGroup(String groupName) {
    if (groups != null) {
      try {
        JSONArray groupsArray = new JSONArray(groups);
        for (int i = 0; i < groupsArray.length(); i++) {
          String group = (String) groupsArray.get(i);
          if (group.equals(groupName)) {
            return true;
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return false;
  }

  public NotebookItem copy() {
    NotebookItem notebookItem = new NotebookItem();
    notebookItem.setRun(getRun());
    notebookItem.setPeriod(getPeriod());
    notebookItem.setWorkgroup(getWorkgroup());
    notebookItem.setNodeId(getNodeId());
    notebookItem.setComponentId(getComponentId());
    notebookItem.setStudentWork(getStudentWork());
    notebookItem.setStudentAsset(getStudentAsset());
    notebookItem.setLocalNotebookItemId(getLocalNotebookItemId());
    notebookItem.setParentNotebookItemId(getParentNotebookItemId());
    notebookItem.setType(getType());
    notebookItem.setTitle(getTitle());
    notebookItem.setContent(getContent());
    notebookItem.setClientSaveTime(getClientSaveTime());
    notebookItem.setGroups(getGroups());
    Calendar now = Calendar.getInstance();
    Timestamp serverSaveTimestamp = new Timestamp(now.getTimeInMillis());
    notebookItem.setServerSaveTime(serverSaveTimestamp);
    return notebookItem;
  }

  public NotebookItem copy(Workgroup workgroup, String clientSaveTime) {
    NotebookItem notebookItem = new NotebookItem();
    notebookItem.setRun(getRun());
    notebookItem.setPeriod(getPeriod());
    notebookItem.setWorkgroup(workgroup);
    notebookItem.setNodeId(getNodeId());
    notebookItem.setComponentId(getComponentId());
    notebookItem.setStudentWork(getStudentWork());
    notebookItem.setStudentAsset(getStudentAsset());
    notebookItem.setLocalNotebookItemId(RandomStringUtils.randomAlphanumeric(10).toLowerCase());
    notebookItem.setParentNotebookItemId(getId());
    notebookItem.setType(getType());
    notebookItem.setTitle(getTitle());
    notebookItem.setContent(getContent());
    notebookItem.setClientSaveTime(new Timestamp(new Long(clientSaveTime)));
    Calendar now = Calendar.getInstance();
    Timestamp serverSaveTimestamp = new Timestamp(now.getTimeInMillis());
    notebookItem.setServerSaveTime(serverSaveTimestamp);
    return notebookItem;
  }
}
