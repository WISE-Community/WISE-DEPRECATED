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

import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.vle.domain.PersistableDomain;

import javax.persistence.*;
import java.sql.Timestamp;

/**
 * Domain object representing assets uploaded by the student like images and video (used in WISE5)
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "studentAssets",  indexes = {
        @Index(columnList = "runId", name = "studentAssetsRunIdIndex"),
        @Index(columnList = "workgroupId", name = "studentAssetsWorkgroupIdIndex")})
public class StudentAsset extends PersistableDomain {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Integer id = null;

	@ManyToOne(targetEntity = RunImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
	@JoinColumn(name = "runId", nullable = false)
	private Run run;

    @ManyToOne(targetEntity = PersistentGroup.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
    @JoinColumn(name = "periodId", nullable = false)
    private Group period;

    @ManyToOne(targetEntity = WorkgroupImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
	@JoinColumn(name = "workgroupId", nullable = false)
	private Workgroup workgroup;

    @Column(name = "nodeId", length = 30)
    private String nodeId;

	@Column(name = "componentId", length = 30)
	private String componentId;

	@Column(name = "componentType", length = 30)
	private String componentType;

	@Column(name = "isReferenced", nullable = false)
	private Boolean isReferenced = false;

	@Column(name = "fileName", nullable = false)
	private String fileName;

    @Column(name = "filePath", nullable = false)
	private String filePath;

	@Column(name = "fileSize", nullable = false)
	private Long fileSize;

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
		return StudentAsset.class;
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

	public void setWorkgroup(Workgroup workgroup) {
		this.workgroup = workgroup;
	}

	public Boolean isReferenced() {
		return isReferenced;
	}

	public void setIsReferenced(Boolean isReferenced) {
		this.isReferenced = isReferenced;
	}

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

	public Long getFileSize() {
		return fileSize;
	}

	public void setFileSize(Long fileSize) {
		this.fileSize = fileSize;
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

    public Timestamp getClientDeleteTime() {
        return clientDeleteTime;
    }

    public void setClientDeleteTime(Timestamp clientDeleteTime) {
        this.clientDeleteTime = clientDeleteTime;
    }

    public Timestamp getServerDeleteTime() {
        return serverDeleteTime;
    }

    public void setServerDeleteTime(Timestamp serverDeleteTime) {
        this.serverDeleteTime = serverDeleteTime;
    }

	public Timestamp getClientSaveTime() {
		return clientSaveTime;
	}

	public void setClientSaveTime(Timestamp clientSaveTime) {
		this.clientSaveTime = clientSaveTime;
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

            // set isReferenced
            if (this.isReferenced != null) {
                studentWorkJSONObject.put("isReferenced", this.isReferenced);
            }

            // set the filename
            if (this.fileName != null) {
                studentWorkJSONObject.put("fileName", this.fileName);
            }

            // set the filePath
            if (this.filePath != null) {
                studentWorkJSONObject.put("filePath", this.filePath);
            }

			// set the fileSize
			if (this.fileSize != null) {
				studentWorkJSONObject.put("fileSize", this.fileSize);
			}

            // set the clientSaveTime time
			if (this.clientSaveTime != null) {
				studentWorkJSONObject.put("clientSaveTime", clientSaveTime.getTime());
			}

			// set the serverSaveTime time
			if (this.serverSaveTime != null) {
				studentWorkJSONObject.put("serverSaveTime", serverSaveTime.getTime());
			}

            // set the clientDeleteTime time
            if (this.clientDeleteTime != null) {
                studentWorkJSONObject.put("clientDeleteTime", clientDeleteTime.getTime());
            }

            // set the serverDeleteTime time
            if (this.serverDeleteTime != null) {
                studentWorkJSONObject.put("serverDeleteTime", serverDeleteTime.getTime());
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
        
        return studentWorkJSONObject;
    }
}