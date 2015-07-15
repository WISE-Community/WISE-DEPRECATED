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

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

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

/**
 * Domain object representing work for a component (used in WISE5)
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "componentState")
public class ComponentState extends PersistableDomain {

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
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

    @Column(name = "nodeId", nullable = false)
    private String nodeId;

	@Column(name = "componentId", nullable = false)
	private String componentId;

	@Column(name = "componentType", nullable = false)
	private String componentType;

	@Column(name = "postTime", nullable = false)
	private Timestamp postTime;

	@Column(name = "studentData", length = 5120000, columnDefinition = "mediumtext", nullable = false)
	private String studentData;

	@Override
	protected Class<?> getObjectClass() {
		return ComponentState.class;
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

	public Timestamp getPostTime() {
		return postTime;
	}

	public void setPostTime(Timestamp postTime) {
		this.postTime = postTime;
	}

	public String getStudentData() {
		return studentData;
	}

	public void setStudentData(String studentData) {
		this.studentData = studentData;
	}
    
    public JSONObject getStudentDataJSON() {
        JSONObject studentDataJSON = null;
        
        String studentData = getStudentData();
        
        if (studentData != null) {
            try {
                studentDataJSON = new JSONObject(studentData);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        
        return studentDataJSON;
    }
    
    /**
     * Get the JSON representation of the ComponentState
     * @return a JSONObject with the values from the ComponentState
     */
    public JSONObject toJSON() {
        JSONObject componentStateJSONObject = new JSONObject();
        
        try {
            
            // set the id
            componentStateJSONObject.put("id", getId());
            
            // set the run id
            Run run = getRun();
            Long runId = run.getId();
            componentStateJSONObject.put("runId", runId);
            
            // set the period id
            Group period = getPeriod();
            Long periodId = period.getId();
            componentStateJSONObject.put("periodId", periodId);
            
            // set the workgroup id
            Workgroup workgroup = getWorkgroup();
            Long workgroupId = workgroup.getId();
            componentStateJSONObject.put("workgroupId", workgroupId);
            
            // set the node id
            String nodeId = getNodeId();
            componentStateJSONObject.put("nodeId", nodeId);
            
            // set the component id
            String componentId = getComponentId();
            componentStateJSONObject.put("componentId", componentId);
            
            // set the component type
            String componentType = getComponentType();
            componentStateJSONObject.put("componentType", componentType);
            
            // set the post time
            Timestamp postTime = getPostTime();
            componentStateJSONObject.put("postTime", postTime.getTime());
            
            // set the student data
            String studentData = getStudentData();
            componentStateJSONObject.put("studentData", new JSONObject(studentData));
            
        } catch (JSONException e) {
            e.printStackTrace();
        }
        
        return componentStateJSONObject;
    }
}