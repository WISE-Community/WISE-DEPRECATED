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

import org.hibernate.annotations.*;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WISEWorkgroupImpl;
import org.wise.vle.domain.PersistableDomain;

import javax.persistence.*;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.Index;
import javax.persistence.Table;
import java.sql.Timestamp;

/**
 * Domain object representing an event that occur in the VLE (used in WISE5). An Event can be
 * a mouse click, step_enter, model_state_changed, etc.
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "events",  indexes = {
		@Index(columnList = "runId", name = "runIdIndex"),
		@Index(columnList = "workgroupId", name = "workgroupIdIndex")})
public class Event extends PersistableDomain {

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
	@JoinColumn(name = "workgroupId", nullable = false)
	private WISEWorkgroup workgroup;

    @Column(name = "nodeId", length = 30)
    private String nodeId;

	@Column(name = "componentId", length = 30)
	private String componentId;

	@Column(name = "componentType", length = 30)
	private String componentType;

	@Column(name = "context", nullable = false, length = 30)
	private String context;

	@Column(name = "category", nullable = false)
	private String category;

	@Column(name = "event", nullable = false)
	private String event;

	@Column(name = "data", length = 65536, columnDefinition = "text")
	private String data;

	@Column(name = "clientSaveTime", nullable = false)
	private Timestamp clientSaveTime;

	@Column(name = "serverSaveTime", nullable = false)
	private Timestamp serverSaveTime;

	@Override
	protected Class<?> getObjectClass() {
		return Event.class;
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

	public void setWorkgroup(WISEWorkgroup workgroup) {
		this.workgroup = workgroup;
	}

	public String getNodeId() {
		return nodeId;
	}

	public void setNodeId(String nodeId) {
		this.nodeId = nodeId;
	}

	public String getComponentType() {
		return componentType;
	}

	public void setComponentType(String componentType) {
		this.componentType = componentType;
	}

	public String getComponentId() {
		return componentId;
	}

	public void setComponentId(String componentId) {
		this.componentId = componentId;
	}

	public String getContext() {
		return context;
	}

	public void setContext(String context) {
		this.context = context;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getEvent() {
		return event;
	}

	public void setEvent(String event) {
		this.event = event;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	public Timestamp getServerSaveTime() {
		return serverSaveTime;
	}

	public void setServerSaveTime(Timestamp serverSaveTime) {
		this.serverSaveTime = serverSaveTime;
	}

	public Timestamp getClientSaveTime() {
		return clientSaveTime;
	}

	public void setClientSaveTime(Timestamp clientSaveTime) {
		this.clientSaveTime = clientSaveTime;
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

            // set the workgroup id
			if (this.workgroup != null) {
				Long workgroupId = this.workgroup.getId();
				eventJSONObject.put("workgroupId", workgroupId);
			}
            
            // set the node id
			if (this.nodeId != null) {
				eventJSONObject.put("nodeId", this.nodeId);
			}
            
            // set the component id
			if (this.componentId != null) {
				eventJSONObject.put("componentId", this.componentId);
			}

            // set the component type
			if (this.componentType != null) {
				eventJSONObject.put("componentType", this.componentType);
			}

			// set the context
			if (this.context != null) {
				eventJSONObject.put("context", this.context);
			}

			// set the category
			if (this.category != null) {
				eventJSONObject.put("category", this.category);
			}

			// set the event
			if (this.event != null) {
				eventJSONObject.put("event", this.event);
			}

			// set the data
			if (this.data != null) {
				try {
					eventJSONObject.put("data", new JSONObject(this.data));
				} catch (Exception e) {
					eventJSONObject.put("data", this.data);
				}
			}

			// set the clientSaveTime time
			if (this.clientSaveTime != null) {
				eventJSONObject.put("clientSaveTime", clientSaveTime.getTime());
			}

			// set the serverSaveTime time
			if (this.serverSaveTime != null) {
				eventJSONObject.put("serverSaveTime", serverSaveTime.getTime());
			}

        } catch (JSONException e) {
            e.printStackTrace();
        }
        
        return eventJSONObject;
    }
}