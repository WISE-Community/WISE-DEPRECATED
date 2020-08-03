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

import java.sql.Timestamp;
import java.util.Calendar;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.json.JSONArray;
import org.json.JSONException;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.vle.domain.PersistableDomain;

import lombok.Getter;
import lombok.Setter;

/**
 * Domain object representing assets uploaded by the student like images and video (used in WISE5)
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "notebookItems",  indexes = {
    @Index(columnList = "runId", name = "notebookItemsRunIdIndex"),
    @Index(columnList = "workgroupId", name = "notebookItemsWorkgroupIdIndex")})
@Getter
@Setter
public class NotebookItem extends PersistableDomain {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Integer id = null;

  @ManyToOne(targetEntity = RunImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "runId", nullable = false)
  private Run run;

  @ManyToOne(targetEntity = PersistentGroup.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "periodId")
  @JsonIgnore
  private Group period;

  @ManyToOne(targetEntity = WorkgroupImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "workgroupId", nullable = false)
  @JsonIgnore
  private Workgroup workgroup;

  @Column(name = "nodeId", length = 30, nullable = true)
  private String nodeId;

  @Column(name = "componentId", length = 30, nullable = true)
  private String componentId;

  @OneToOne(targetEntity = StudentWork.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "studentWorkId", nullable = true)
  @JsonIgnore
  private StudentWork studentWork;

  @OneToOne(targetEntity = StudentAsset.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "studentAssetId", nullable = true)
  @JsonIgnore
  private StudentAsset studentAsset;

  @Column(name = "localNotebookItemId", length = 30, nullable = true)
  private String localNotebookItemId;  // ex: [ "1", "letterToACongressperson", "z5hc4jeu12" ]

  @Column(name = "parentNotebookItemId")
  private Integer parentNotebookItemId;

  @Column(name = "`groups`")
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
}
