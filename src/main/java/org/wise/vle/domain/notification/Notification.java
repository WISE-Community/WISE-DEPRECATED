/**
 * Copyright (c) 2008-2016 Regents of the University of California (Regents).
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

import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.portal.domain.workgroup.impl.WISEWorkgroupImpl;
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
public class Notification extends PersistableDomain {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id = null;  // unique id of the notification

    @ManyToOne(targetEntity = RunImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
    @JoinColumn(name = "runId", nullable = false)
    private Run run;   // which run this notification is for

    @ManyToOne(targetEntity = PersistentGroup.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
    @JoinColumn(name = "periodId", nullable = false)
    private Group period;   // which period this notification is for

    @ManyToOne(targetEntity = WISEWorkgroupImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
    @JoinColumn(name = "toWorkgroupId")
    private WISEWorkgroup toWorkgroup;  // who this notification is for

    @ManyToOne(targetEntity = WISEWorkgroupImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
    @JoinColumn(name = "fromWorkgroupId")
    private WISEWorkgroup fromWorkgroup;  // who this notification is from

    @Column(name = "groupId", length = 30)
    private String groupId;  // id of the group of notifications this notification belongs to, if any.

    @Column(name = "nodeId", length = 30)
    private String nodeId;  // which node created this notification, if any

    @Column(name = "componentId", length = 30)
    private String componentId;  // which component created this notification, if any

    @Column(name = "componentType", length = 30)
    private String componentType;  // type of component that created this notification, if any

    @Column(name = "type")
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

    @Override
    protected Class<?> getObjectClass() {
        return Notification.class;
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

    public WISEWorkgroup getToWorkgroup() {
        return toWorkgroup;
    }

    public void setToWorkgroup(WISEWorkgroup toWorkgroup) {
        this.toWorkgroup = toWorkgroup;
    }

    public WISEWorkgroup getFromWorkgroup() {
        return fromWorkgroup;
    }

    public void setFromWorkgroup(WISEWorkgroup fromWorkgroup) {
        this.fromWorkgroup = fromWorkgroup;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
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

    public String getComponentType() {
        return componentType;
    }

    public void setComponentType(String componentType) {
        this.componentType = componentType;
    }

    public Timestamp getTimeGenerated() {
        return timeGenerated;
    }

    public void setTimeGenerated(Timestamp timeGenerated) {
        this.timeGenerated = timeGenerated;
    }

    public Timestamp getTimeDismissed() {
        return timeDismissed;
    }

    public void setTimeDismissed(Timestamp timeDismissed) {
        this.timeDismissed = timeDismissed;
    }

    public Timestamp getServerSaveTime() {
        return serverSaveTime;
    }

    public void setServerSaveTime(Timestamp serverSaveTime) {
        this.serverSaveTime = serverSaveTime;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    /**
     * Get the JSON representation of the StudentWork
     *
     * @return a JSONObject with the values from the StudentWork
     */
    public JSONObject toJSON() {
        JSONObject notificationJSONObject = new JSONObject();

        try {

            if (this.id != null) {
                notificationJSONObject.put("id", this.id);
            }

            if (this.run != null) {
                Long runId = this.run.getId();
                notificationJSONObject.put("runId", runId);
            }

            if (this.period != null) {
                Long periodId = this.period.getId();
                notificationJSONObject.put("periodId", periodId);
            }

            if (this.toWorkgroup != null) {
                Long toWorkgroupId = this.toWorkgroup.getId();
                notificationJSONObject.put("toWorkgroupId", toWorkgroupId);
            }

            if (this.fromWorkgroup != null) {
                Long fromWorkgroupId = this.fromWorkgroup.getId();
                notificationJSONObject.put("fromWorkgroupId", fromWorkgroupId);
            }

            if (this.groupId != null) {
                notificationJSONObject.put("groupId", this.groupId);
            }

            if (this.nodeId != null) {
                notificationJSONObject.put("nodeId", this.nodeId);
            }

            if (this.componentId != null) {
                notificationJSONObject.put("componentId", this.componentId);
            }

            if (this.componentType != null) {
                notificationJSONObject.put("componentType", this.componentType);
            }

            if (this.type != null) {
                notificationJSONObject.put("type", this.type);
            }

            if (this.message != null) {
                notificationJSONObject.put("message", this.message);
            }

            if (this.data != null) {
                notificationJSONObject.put("data", this.data);
            }

            if (this.serverSaveTime != null) {
                notificationJSONObject.put("serverSaveTime", serverSaveTime.getTime());
            }

            if (this.timeGenerated != null) {
                notificationJSONObject.put("timeGenerated", timeGenerated.getTime());
            }

            if (this.timeDismissed != null) {
                notificationJSONObject.put("timeDismissed", timeDismissed.getTime());
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }

        return notificationJSONObject;
    }
}
