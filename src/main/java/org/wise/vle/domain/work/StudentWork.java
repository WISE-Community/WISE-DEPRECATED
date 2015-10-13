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
 * Domain object representing work for a student, which include components and nodes (used in WISE5)
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "studentWork",  indexes = {
        @Index(columnList = "runId", name = "runIdIndex"),
        @Index(columnList = "workgroupId", name = "workgroupIdIndex")})
public class StudentWork extends PersistableDomain {

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

	@Column(name = "isAutoSave", nullable = false)
	private Boolean isAutoSave;

    @Column(name = "nodeId", nullable = false, length = 30)
    private String nodeId;

	@Column(name = "componentId", length = 30)
	private String componentId;

	@Column(name = "componentType", length = 30)
	private String componentType;

	@Column(name = "clientSaveTime", nullable = false)
	private Timestamp clientSaveTime;

	@Column(name = "serverSaveTime", nullable = false)
	private Timestamp serverSaveTime;

	@Column(name = "studentData", length = 5120000, columnDefinition = "mediumtext", nullable = false)
	private String studentData;

	@Override
	protected Class<?> getObjectClass() {
		return StudentWork.class;
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

	public Boolean isAutoSave() {
		return isAutoSave;
	}

	public void setIsAutoSave(Boolean isAutoSave) {
		this.isAutoSave = isAutoSave;
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

	public String getStudentData() {
		return studentData;
	}

	public void setStudentData(String studentData) {
		this.studentData = studentData;
	}

    /**
     * Get the JSON representation of the StudentWork
     * @return a JSONObject with the values from the StudentWork
     */
    public JSONObject toJSON() {
        JSONObject studentWorkJSONObject = new JSONObject();
        
        try {
            
            // set the id
			if (this.id != null) {
				studentWorkJSONObject.put("id", this.id);
			}
            
            // set the run id
			if (this.run != null) {
				Long runId = this.run.getId();
				studentWorkJSONObject.put("runId", runId);
			}
            
            // set the period id
			if (this.period != null) {
				Long periodId = this.period.getId();
				studentWorkJSONObject.put("periodId", periodId);
			}

            // set the workgroup id
			if (this.workgroup != null) {
				Long workgroupId = this.workgroup.getId();
				studentWorkJSONObject.put("workgroupId", workgroupId);
			}

            if (this.isAutoSave != null) {
                studentWorkJSONObject.put("isAutoSave", this.isAutoSave);
            }

            // set the node id
			if (this.nodeId != null) {
				studentWorkJSONObject.put("nodeId", this.nodeId);
			}
            
            // set the component id
			if (this.componentId != null) {
				studentWorkJSONObject.put("componentId", this.componentId);
			}

            // set the component type
			if (this.componentType != null) {
				studentWorkJSONObject.put("componentType", this.componentType);
			}

            // set the clientSaveTime time
			if (this.clientSaveTime != null) {
				studentWorkJSONObject.put("clientSaveTime", clientSaveTime.getTime());
			}

			// set the serverSaveTime time
			if (this.serverSaveTime != null) {
				studentWorkJSONObject.put("serverSaveTime", serverSaveTime.getTime());
			}

            // set the student data
			if (this.studentData != null) {
				studentWorkJSONObject.put("studentData", new JSONObject(studentData));
			}

        } catch (JSONException e) {
            e.printStackTrace();
        }
        
        return studentWorkJSONObject;
    }
}