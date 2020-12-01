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
package org.wise.vle.domain.achievement;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.vle.domain.PersistableDomain;

import javax.persistence.*;
import java.sql.Timestamp;

/**
 * Achievement stores an achievement that student received while working on a project.
 *
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "achievements", indexes = {
  @Index(columnList = "runId", name = "achievementsRunIdIndex"),
  @Index(columnList = "workgroupId", name = "achievementsWorkgroupIdIndex")
})
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
public class Achievement extends PersistableDomain {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Integer id = null;

  @ManyToOne(targetEntity = RunImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "runId", nullable = false)
  @JsonIgnore
  private Run run;

  @ManyToOne(targetEntity = WorkgroupImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "workgroupId", nullable = false)
  @JsonIgnore
  private Workgroup workgroup;

  @Column(name = "achievementId", length = 32, nullable = false)
  private String achievementId;  // id of this achievement like "xyzwbc" or "achievementX", defined in project content

  @Column(name = "type", length = 64, nullable = false)
  private String type;  // type of this achievement like "completion" or "milestone", defined in project content

  @Column(name = "achievementTime", nullable = false)
  private Timestamp achievementTime;  // when the achievement occurred, saved as server time

  @Column(name = "data", length = 65536, columnDefinition = "text", nullable = false)
  private String data;  // achievement data, actual achievement content stored in the project

  @Transient
  private long runId;

  @Transient
  private long workgroupId;

  @Override
  protected Class<?> getObjectClass() {
    return Achievement.class;
  }

  public void convertToClientAchievement() {
    this.setRunId(this.getRun().getId());
    this.setWorkgroupId(this.getWorkgroup().getId());
  }

  public JSONObject toJSON() {
    JSONObject achievementJSONObject = new JSONObject();
    try {
      if (id != null) {
        achievementJSONObject.put("id", id);
      }
      achievementJSONObject.put("runId", run.getId());
      achievementJSONObject.put("workgroupId", workgroup.getId());
      achievementJSONObject.put("achievementId", achievementId);
      achievementJSONObject.put("type", type);
      achievementJSONObject.put("achievementTime", achievementTime.getTime());
      try {
        achievementJSONObject.put("data", new JSONObject(data));
      } catch (JSONException e) {
        achievementJSONObject.put("data", data);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return achievementJSONObject;
  }
}
