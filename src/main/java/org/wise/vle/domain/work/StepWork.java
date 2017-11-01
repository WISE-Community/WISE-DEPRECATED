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
package org.wise.vle.domain.work;

import java.sql.Timestamp;

import javax.persistence.*;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.vle.domain.PersistableDomain;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.user.UserInfo;

/**
 * Domain representing work for a step (used in WISE4)
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@Entity
@Table(name = "stepwork")
@Inheritance(strategy = InheritanceType.JOINED)
public class StepWork extends PersistableDomain {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long id = null;

  @ManyToOne(cascade = {CascadeType.PERSIST})
  @JoinColumn(name = "userInfo_id", nullable = false)
  private UserInfo userInfo;

  @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.MERGE})
  @JoinColumn(name = "node_id", nullable = false)
  private Node node;

  @Column(name = "postTime", nullable = false)
  private Timestamp postTime;

  @Column(name = "startTime")
  private Timestamp startTime;

  @Column(name = "endTime")
  private Timestamp endTime;

  @Column(name = "data", length = 5120000, columnDefinition = "mediumtext", nullable = false)
  private String data;

  public Long getId() {
    return id;
  }

  @SuppressWarnings("unused")
  private void setId(Long id) {
    this.id = id;
  }


  public UserInfo getUserInfo() {
    return userInfo;
  }

  public void setUserInfo(UserInfo userInfo) {
    this.userInfo = userInfo;
  }

  /**
   * @return the node
   */
  public Node getNode() {
    return node;
  }

  /**
   * @param node the node to set
   */
  public void setNode(Node node) {
    this.node = node;
  }

  /**
   * @return the postTime
   */
  public Timestamp getPostTime() {
    return postTime;
  }

  /**
   * @param postTime the postTime to set
   */
  public void setPostTime(Timestamp postTime) {
    this.postTime = postTime;
  }

  /**
   * @return the startTime
   */
  public Timestamp getStartTime() {
    return startTime;
  }

  /**
   * @param startTime the startTime to set
   */
  public void setStartTime(Timestamp startTime) {
    this.startTime = startTime;
  }

  /**
   * @return the endTime
   */
  public Timestamp getEndTime() {
    return endTime;
  }

  /**
   * @param endTime the endTime to set
   */
  public void setEndTime(Timestamp endTime) {
    this.endTime = endTime;
  }

  public String getData() {
    return data;
  }

  public void setData(String data) {
    this.data = data;
  }

  public void populateData(JSONObject nodeVisitJSON) {
    this.data = nodeVisitJSON.toString();
  }

  /**
   * @see org.wise.vle.domain.PersistableDomain#getObjectClass()
   */
  @Override
  protected Class<?> getObjectClass() {
    return StepWork.class;
  }

  /**
   * Returns the node state object within this stepwork with the specified timestamp
   * or null if does not exist.
   * @param timestampIn
   * @return
   */
  public JSONObject getNodeStateByTimestamp(Long timestampIn) {
    try {
      JSONObject dataJSON = new JSONObject(this.data);
      if (dataJSON != null) {
        JSONArray valueArray = dataJSON.getJSONArray("nodeStates");
        if (valueArray != null) {
          for (int i=0; i<valueArray.length(); i++) {
            JSONObject nodeStateObj = valueArray.getJSONObject(i);
            long timestampFromNodeState = nodeStateObj.getLong("timestamp");
            if (timestampIn != null && timestampIn.equals(timestampFromNodeState)) {
              return nodeStateObj;
            }

          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * If this StepWork contains response for a CRater item, return the
   * CRaterItemId. Otherwise, return null.
   * @return CRater Item Id if this StepWork contains a response for CRater Item or NULL otherwise.
   */
  public String getCRaterItemId() {
    String cRaterItemId = null;

    try {
      JSONObject dataJSON = new JSONObject(this.data);
      if (dataJSON != null) {
        JSONArray nodeStateArray = dataJSON.getJSONArray("nodeStates");
        if (nodeStateArray != null) {
          for (int i=0; i<nodeStateArray.length(); i++) {
            JSONObject nodeStateObj = nodeStateArray.getJSONObject(i);

            if(nodeStateObj.has("cRaterItemId")) {
              cRaterItemId = nodeStateObj.getString("cRaterItemId");
              break;
            }
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return cRaterItemId;
  }

  /**
   * If this StepWork contains response for a CRater item, return the
   * CRaterItemType. Otherwise, return null.
   * @return
   */
  public String getCRaterItemType() {
    String cRaterItemType = null;

    try {
      JSONObject dataJSON = new JSONObject(this.data);
      if (dataJSON != null) {
        JSONArray nodeStateArray = dataJSON.getJSONArray("nodeStates");
        if (nodeStateArray != null) {
          for (int i=0; i<nodeStateArray.length(); i++) {
            JSONObject nodeStateObj = nodeStateArray.getJSONObject(i);

            if(nodeStateObj.has("cRaterItemType")) {
              cRaterItemType = nodeStateObj.getString("cRaterItemType");
              break;
            }
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return cRaterItemType;
  }
  /**
   * Returns the timestamp of the latest NodeState in this StepWork.
   * This is the same as the NodeStateId. If no NodeState exists in this StepWork,
   * return 0.
   * @return 0 or the timestamp of the latest NodeState in this StepWork.
   */
  public long getLastNodeStateTimestamp() {
    long timestamp = 0;

    try {
      JSONObject dataJSON = new JSONObject(this.data);
      if (dataJSON != null) {
        JSONArray nodeStateArray = dataJSON.getJSONArray("nodeStates");
        if (nodeStateArray != null && nodeStateArray.length() > 0) {
          JSONObject nodeStateObj = nodeStateArray.getJSONObject(nodeStateArray.length() - 1);
          if(nodeStateObj.has("timestamp")) {
            timestamp = nodeStateObj.getLong("timestamp");
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    return timestamp;
  }

  /**
   * Get the JSON representation of the StepWork
   * @return a JSONObject with the values from the StepWork
   */
  public JSONObject toJSON() {
    JSONObject stepWorkJSONObject = new JSONObject();

    try {
      stepWorkJSONObject.put("id", getId());

      UserInfo userInfo = getUserInfo();
      Long workgroupId = userInfo.getWorkgroupId();
      stepWorkJSONObject.put("workgroupId", workgroupId);

      String data = getData();
      JSONObject dataJSON = new JSONObject(data);
      stepWorkJSONObject.put("data", dataJSON);

    } catch (JSONException e) {
      e.printStackTrace();
    }

    return stepWorkJSONObject;
  }
}
