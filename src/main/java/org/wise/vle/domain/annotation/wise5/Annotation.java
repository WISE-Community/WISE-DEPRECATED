package org.wise.vle.domain.annotation.wise5;

import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.portal.domain.workgroup.impl.WISEWorkgroupImpl;
import org.wise.vle.domain.PersistableDomain;
import org.wise.vle.domain.work.ComponentState;

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
        @Index(columnList = "runId", name = "runIdIndex"),
        @Index(columnList = "toWorkgroupId", name = "toWorkgroupIdIndex")})
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

    @ManyToOne(targetEntity = WISEWorkgroupImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
    @JoinColumn(name = "fromWorkgroupId", nullable = true)
    private WISEWorkgroup fromWorkgroup;

    @ManyToOne(targetEntity = WISEWorkgroupImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
    @JoinColumn(name = "toWorkgroupId", nullable = false)
    private WISEWorkgroup toWorkgroup;

    @Column(name = "nodeId", length = 30, nullable = true)
    private String nodeId;

    @Column(name = "componentId", length = 30, nullable = true)
    private String componentId;

    @ManyToOne(targetEntity = ComponentState.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
    @JoinColumn(name = "componentStateId", nullable = true)
    private ComponentState componentState;

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

    public WISEWorkgroup getFromWorkgroup() {
        return fromWorkgroup;
    }

    public void setFromWorkgroup(WISEWorkgroup fromWorkgroup) {
        this.fromWorkgroup = fromWorkgroup;
    }

    public WISEWorkgroup getToWorkgroup() {
        return toWorkgroup;
    }

    public void setToWorkgroup(WISEWorkgroup toWorkgroup) {
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

    public ComponentState getComponentState() {
        return componentState;
    }

    public void setComponentState(ComponentState componentState) {
        this.componentState = componentState;
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

            // set the id
            if (this.id != null) {
                eventJSONObject.put("id", this.id);
            }

            // set the run id
            if (this.run != null) {
                Long runId = this.run.getId();
                eventJSONObject.put("runId", runId);
            }

            // set the period id
            if (this.period != null) {
                Long periodId = this.period.getId();
                eventJSONObject.put("periodId", periodId);
            }

            // set the fromWorkgroupId
            if (this.fromWorkgroup != null) {
                Long fromWorkgroupId = this.fromWorkgroup.getId();
                eventJSONObject.put("fromWorkgroupId", fromWorkgroupId);
            }

            // set the toWorkgroupId
            if (this.toWorkgroup != null) {
                Long toWorkgroupId = this.toWorkgroup.getId();
                eventJSONObject.put("toWorkgroupId", toWorkgroupId);
            }

            // set the node id
            if (this.nodeId != null) {
                eventJSONObject.put("nodeId", this.nodeId);
            }

            // set the component id
            if (this.componentId != null) {
                eventJSONObject.put("componentId", this.componentId);
            }

            // set the component state id
            if (this.componentState != null) {
                eventJSONObject.put("componentStateId", this.componentState.getId());
            }

            // set the type
            if (this.type != null) {
                eventJSONObject.put("type", this.type);
            }

            // set the data
            if (this.data != null) {
                eventJSONObject.put("data", this.data);
            }

            // set the clientSaveTime
            if (this.clientSaveTime != null) {
                eventJSONObject.put("clientSaveTime", clientSaveTime.getTime());
            }

            // set the serverSaveTime
            if (this.serverSaveTime != null) {
                eventJSONObject.put("serverSaveTime", serverSaveTime.getTime());
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }

        return eventJSONObject;
    }
}
