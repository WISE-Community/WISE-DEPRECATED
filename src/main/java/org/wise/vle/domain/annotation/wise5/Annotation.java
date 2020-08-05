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
import org.wise.vle.domain.work.NotebookItem;
import org.wise.vle.domain.work.StudentWork;

import javax.persistence.*;
import java.sql.Timestamp;

/**
 * WISE5 Annotation Domain Object Annotations are what users annotate on other user's work, such as
 * Comments, Scores, Flags.
 *
 * @author Hiroki Terashima
 */
@Entity(name = "wise5Annotation")
@Table(name = "annotations", indexes = {
    @Index(columnList = "runId", name = "annotationsRunIdIndex"),
    @Index(columnList = "toWorkgroupId", name = "annotationsToWorkgroupIdIndex") })
@Getter
@Setter
public class Annotation extends PersistableDomain {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Integer id = null;

  @ManyToOne(targetEntity = RunImpl.class, cascade = {
      CascadeType.PERSIST }, fetch = FetchType.LAZY)
  @JoinColumn(name = "runId", nullable = false)
  @JsonIgnore
  private Run run;

  @ManyToOne(targetEntity = PersistentGroup.class, cascade = {
      CascadeType.PERSIST }, fetch = FetchType.LAZY)
  @JoinColumn(name = "periodId", nullable = false)
  @JsonIgnore
  private Group period;

  @ManyToOne(targetEntity = WorkgroupImpl.class, cascade = {
      CascadeType.PERSIST }, fetch = FetchType.LAZY)
  @JoinColumn(name = "fromWorkgroupId", nullable = true)
  @JsonIgnore
  private Workgroup fromWorkgroup;

  @ManyToOne(targetEntity = WorkgroupImpl.class, cascade = {
      CascadeType.PERSIST }, fetch = FetchType.LAZY)
  @JoinColumn(name = "toWorkgroupId", nullable = false)
  @JsonIgnore
  private Workgroup toWorkgroup;

  @Column(name = "nodeId", length = 30, nullable = true)
  private String nodeId;

  @Column(name = "componentId", length = 30, nullable = true)
  private String componentId;

  @ManyToOne(targetEntity = StudentWork.class, cascade = {
      CascadeType.PERSIST }, fetch = FetchType.LAZY)
  @JoinColumn(name = "studentWorkId", nullable = true)
  @JsonIgnore
  private StudentWork studentWork;

  @Column(name = "localNotebookItemId", length = 30, nullable = true)
  private String localNotebookItemId;

  @ManyToOne(targetEntity = NotebookItem.class, cascade = {
      CascadeType.PERSIST }, fetch = FetchType.LAZY)
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

  @Transient
  private long runId;

  @Transient
  private long periodId;

  @Transient
  private long toWorkgroupId;

  @Transient
  private long fromWorkgroupId;

  @Transient
  private long studentWorkId;

  @Override
  protected Class<?> getObjectClass() {
    return Annotation.class;
  }

  public void convertToClientAnnotation() {
    this.setRunId(this.getRun().getId());
    this.setPeriodId(this.getPeriod().getId());
    this.setToWorkgroupId(this.getToWorkgroup().getId());
    if (this.getFromWorkgroup() != null) {
      this.setFromWorkgroupId(this.getFromWorkgroup().getId());
    }
    if (this.getStudentWork() != null) {
      this.setStudentWorkId(this.getStudentWork().getId());
    }
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

      if (fromWorkgroup != null) {
        Long fromWorkgroupId = fromWorkgroup.getId();
        eventJSONObject.put("fromWorkgroupId", fromWorkgroupId);
      }

      if (toWorkgroup != null) {
        Long toWorkgroupId = toWorkgroup.getId();
        eventJSONObject.put("toWorkgroupId", toWorkgroupId);
      }

      if (nodeId != null) {
        eventJSONObject.put("nodeId", nodeId);
      }

      if (componentId != null) {
        eventJSONObject.put("componentId", componentId);
      }

      if (studentWork != null) {
        eventJSONObject.put("studentWorkId", studentWork.getId());
      }

      if (localNotebookItemId != null) {
        eventJSONObject.put("localNotebookItemId", localNotebookItemId);
      }

      if (notebookItem != null) {
        eventJSONObject.put("notebookItemId", notebookItem.getId());
      }

      if (type != null) {
        eventJSONObject.put("type", type);
      }

      if (data != null) {
        try {
          eventJSONObject.put("data", new JSONObject(data));
        } catch (JSONException e) {
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
