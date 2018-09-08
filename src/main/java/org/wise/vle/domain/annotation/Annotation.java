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
package org.wise.vle.domain.annotation;

import java.sql.Timestamp;

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

import lombok.Getter;
import lombok.Setter;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.vle.domain.PersistableDomain;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;

/**
 * Domain representing Annotation.
 * Annotations are what users annotate on other
 * user's work, such as Comments, Scores, Flags.
 *
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "annotation")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
public class Annotation extends PersistableDomain {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long id = null;

  @ManyToOne(cascade = {CascadeType.PERSIST})
  private UserInfo fromUser;  // who created this annotation

  @ManyToOne(cascade = {CascadeType.PERSIST})
  private UserInfo toUser;  // who this annotation is for

  @ManyToOne(cascade = {CascadeType.PERSIST})
  private StepWork stepWork;   // the work that is being annotated

  @Column(name = "annotateTime")
  private Timestamp annotateTime;  // when the work was actually annotated

  @Column(name = "postTime")
  private Timestamp postTime;  // when this annotation was saved

  @Column(name = "runId")
  private Long runId = null;

  @Column(name = "type")
  private String type = null;

  @Column(name = "data", length = 512000, columnDefinition  =  "mediumtext")
  private String data = null;

  @Column(name = "nodeId")
  private String nodeId = null;

  @Override
  protected Class<?> getObjectClass() {
    return Annotation.class;
  }

  /**
   * populates the data of the annotation
   */
  public void setData(String data) {
    // to be overridden by subclass.
    this.data = data;
  }

  /**
   * Returns the data associated with this stepWork
   * @return
   */
  public String getData() {
    return this.data;
  }

  /**
   * Returns the node id
   * @return
   */
  public String getNodeId() {
    return nodeId;
  }

  /**
   * Sets the node id
   * @param nodeId
   */
  public void setNodeId(String nodeId) {
    this.nodeId = nodeId;
  }

  /**
   * The default constructor for Annotation
   */
  public Annotation() {
  }

  /**
   * The constructor for Annotation
   * @param type the annotation type
   */
  public Annotation(String type) {
    this.type = type;
  }

  /**
   * Constructor for Annotation
   * @param stepWork
   * @param fromUser who this annotation is from
   * @param toUser who this annotation is for
   * @param runId
   * @param postTime
   * @param type
   * @param data
   */
  public Annotation(StepWork stepWork, UserInfo fromUser, UserInfo toUser, Long runId, Timestamp postTime, String type, String data, String nodeId) {
    setStepWork(stepWork);
    setFromUser(fromUser);
    setToUser(toUser);
    setRunId(runId);
    setPostTime(postTime);
    setType(type);
    setData(data);
    setNodeId(nodeId);
  }

  public JSONObject getAnnotationForNodeStateId(Long nodeStateId) {
    try {
      JSONObject dataJSON = new JSONObject(this.data);
      if (dataJSON != null) {
        JSONArray valueArray = dataJSON.getJSONArray("value");
        if (valueArray != null) {
          for (int i=0; i<valueArray.length(); i++) {
            JSONObject nodeStateCRaterAnnotation = valueArray.getJSONObject(i);
            long nodeStateIdFromAnnotation = nodeStateCRaterAnnotation.getLong("nodeStateId");
            if (nodeStateId != null && nodeStateId.equals(nodeStateIdFromAnnotation)) {
              return nodeStateCRaterAnnotation;
            }

          }
        }
      }
    } catch (JSONException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    return null;
  }

  public void appendNodeStateAnnotation(JSONObject nodeStateAnnotation) {
    try {
      JSONObject dataJSON = new JSONObject(this.data);
      if (dataJSON != null) {
        JSONArray valueArray = dataJSON.getJSONArray("value");
        if (valueArray != null) {
          valueArray.put(nodeStateAnnotation);
          this.data = dataJSON.toString();
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  public static JSONObject createCRaterNodeStateAnnotation(Long nodeStateId, int score, String concepts, JSONObject studentResponse, String cRaterResponse) {
    JSONObject cRaterNodeStateAnnotation = new JSONObject();

    try {
      cRaterNodeStateAnnotation.put("nodeStateId", nodeStateId);
      cRaterNodeStateAnnotation.put("score", score);
      cRaterNodeStateAnnotation.put("concepts", concepts);
      cRaterNodeStateAnnotation.put("studentResponse", studentResponse);
      cRaterNodeStateAnnotation.put("cRaterResponse", cRaterResponse);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return cRaterNodeStateAnnotation;
  }
}
