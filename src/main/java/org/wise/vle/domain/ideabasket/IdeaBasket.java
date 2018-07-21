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
package org.wise.vle.domain.ideabasket;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Calendar;

import javax.persistence.*;

import lombok.Getter;
import lombok.Setter;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.vle.domain.PersistableDomain;

/**
 * @author Geoffrey Kwan
 */
@Entity
@Table(name = "ideabasket", indexes = { @Index(columnList = "runId,workgroupId", name = "ideabasketRunIdAndWorkgroupIdIndex") } )
@Getter
@Setter
public class IdeaBasket extends PersistableDomain implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long id = null;

  @Column(name = "runId")
  private Long runId = null;

  @Column(name = "workgroupId")
  private Long workgroupId = null;

  @Column(name = "projectId")
  private Long projectId = null;

  @Column(name = "data", length = 512000, columnDefinition = "mediumtext")
  private String data = null;

  @Column(name = "postTime")
  private Timestamp postTime;

  @Column(name = "periodId")
  private Long periodId = null;

  @Column(name = "isPublic")
  private Boolean isPublic = false;

  //the action that is being performed to create this new basket revision (only used for public idea basket)
  @Column(name = "action")
  private String action = "";

  //the workgroup id performing the action to create a new basket revision (only used for public idea basket)
  @Column(name = "actionPerformer")
  private Long actionPerformer = null;

  //the idea id for the action being performed (only used for public idea basket)
  @Column(name = "ideaId")
  private Long ideaId = null;

  //the workgroup id of the owner of the idea that the action is being performed on (only used for public idea basket)
  @Column(name = "ideaWorkgroupId")
  private Long ideaWorkgroupId = null;

  public IdeaBasket() {
  }

  /**
   * Constructor that does not populate the data field
   * @param runId
   * @param projectId
   * @param workgroupId
   */
  public IdeaBasket(long runId, long periodId, long projectId, long workgroupId) {
    this.runId = runId;
    this.projectId = projectId;
    this.workgroupId = workgroupId;
    Calendar now = Calendar.getInstance();
    this.postTime = new Timestamp(now.getTimeInMillis());
  }

  /**
   * Constructor that populates the values
   * @param runId the id of the run
   * @param projectId the id of the project
   * @param workgroupId the id of the workgroup
   * @param data the idea basket JSON
   */
  public IdeaBasket(long runId, long periodId, long projectId, long workgroupId, String data, boolean isPublic) {
    this.runId = runId;
    this.projectId = projectId;
    this.periodId = periodId;
    this.workgroupId = workgroupId;
    Calendar now = Calendar.getInstance();
    this.postTime = new Timestamp(now.getTimeInMillis());
    this.data = data;
    this.isPublic = isPublic;
  }

  /**
   * Constructor that populates the values
   * @param runId the id of the run
   * @param projectId the id of the project
   * @param workgroupId the id of the workgroup
   * @param data the idea basket JSON
   */
  public IdeaBasket(long runId, long periodId, long projectId, long workgroupId, String data, boolean isPublic, String action, Long actionPerformer, Long ideaId, Long ideaWorkgroupId) {
    this.runId = runId;
    this.projectId = projectId;
    this.periodId = periodId;
    this.workgroupId = workgroupId;
    Calendar now = Calendar.getInstance();
    this.postTime = new Timestamp(now.getTimeInMillis());
    this.data = data;
    this.isPublic = isPublic;
    this.action = action;
    this.actionPerformer = actionPerformer;
    this.ideaId = ideaId;
    this.ideaWorkgroupId = ideaWorkgroupId;
  }


  public Boolean isPublic() {
    return isPublic;
  }

  public void setPublic(Boolean isPublic) {
    this.isPublic = isPublic;
  }

  @Override
  protected Class<?> getObjectClass() {
    return IdeaBasket.class;
  }

  /**
   * Get the JSON object representation of the IdeaBasket
   * @return a JSONObject containing the data from the idea basket
   */
  public JSONObject toJSONObject() {
    JSONObject jsonObject = null;
    String dataString = "";
    dataString = getData();
    if (dataString == null) {
      /*
       * the data is null so we will create and return a JSONObject
       * that has the metadata for the idea basket
       */
      try {
        jsonObject = new JSONObject();
        jsonObject.put("id", getId());
        jsonObject.put("runId", getRunId());
        jsonObject.put("periodId", getPeriodId());
        jsonObject.put("workgroupId", getWorkgroupId());
        jsonObject.put("projectId", getProjectId());
        jsonObject.put("isPublic", isPublic());
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else {
      /*
       * the data is not null so we will create a JSONObject from
       * the data string and inject metadata values if they are
       * not already present in the data string
       */
      try {
        jsonObject = new JSONObject(dataString);
        if (!jsonObject.has("id")) {
          jsonObject.put("id", getId());
        }

        if (!jsonObject.has("runId")) {
          jsonObject.put("runId", getRunId());
        }

        if (!jsonObject.has("periodId")) {
          jsonObject.put("periodId", getPeriodId());
        }

        if (!jsonObject.has("workgroupId")) {
          jsonObject.put("workgroupId", getWorkgroupId());
        }

        if (!jsonObject.has("projectId")) {
          jsonObject.put("projectId", getProjectId());
        }

        if (!jsonObject.has("isPublic")) {
          jsonObject.put("isPublic", isPublic());
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return jsonObject;
  }

  /**
   * Get the JSON string representation of the IdeaBasket
   * @return
   */
  public String toJSONString() {
    String jsonString = null;
    JSONObject jsonObject = toJSONObject();

    try {
      if (jsonObject != null) {
        jsonString = jsonObject.toString(3);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return jsonString;
  }
}
