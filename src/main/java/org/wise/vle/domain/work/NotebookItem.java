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
import java.sql.Timestamp;

/**
 * Domain object representing assets uploaded by the student like images and video (used in WISE5)
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "notebookItems",  indexes = {
        @Index(columnList = "runId", name = "runIdIndex"),
        @Index(columnList = "workgroupId", name = "workgroupIdIndex")})
public class NotebookItem extends PersistableDomain {

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

    @Column(name = "nodeId", length = 30, nullable = true)
    private String nodeId;

	@Column(name = "componentId", length = 30, nullable = true)
	private String componentId;

	@OneToOne(targetEntity = StudentWork.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
	@JoinColumn(name = "studentWorkId", nullable = true)
	private StudentWork studentWork;

	@OneToOne(targetEntity = StudentAsset.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
	@JoinColumn(name = "studentAssetId", nullable = true)
	private StudentAsset studentAsset;

	@Column(name = "type", length = 30, nullable = true)
	private String type;  // ex: [ "note", "bookmark", "question" ]

	@Column(name = "title", nullable = true)
	private String title;  // ex: "my note on step 1.2"

	@Column(name = "content", columnDefinition = "text", nullable = true)
	private String content; // ex: { note: "my notes with attachments", attachments: [ {studentAssetId: 1, url: "car.png" } ] }

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
		return NotebookItem.class;
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

    public StudentWork getStudentWork() {
        return studentWork;
    }

    public void setStudentWork(StudentWork studentWork) {
        this.studentWork = studentWork;
    }

    public StudentAsset getStudentAsset() {
        return studentAsset;
    }

    public void setStudentAsset(StudentAsset studentAsset) {
        this.studentAsset = studentAsset;
    }

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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
            
			if (this.id != null) {
				studentWorkJSONObject.put("id", this.id);
			}
            
			if (this.run != null) {
				Long runId = this.run.getId();
				studentWorkJSONObject.put("runId", runId);
			}
            
			if (this.period != null) {
				Long periodId = this.period.getId();
				studentWorkJSONObject.put("periodId", periodId);
			}

			if (this.workgroup != null) {
				Long workgroupId = this.workgroup.getId();
				studentWorkJSONObject.put("workgroupId", workgroupId);
			}

			if (this.nodeId != null) {
				studentWorkJSONObject.put("nodeId", this.nodeId);
			}
            
			if (this.componentId != null) {
				studentWorkJSONObject.put("componentId", this.componentId);
			}

            if (this.studentWork != null) {
                studentWorkJSONObject.put("studentWorkId", this.studentWork.getId());
            }

            if (this.studentAsset != null) {
                studentWorkJSONObject.put("studentAssetId", this.studentAsset.getId());
            }

            if (this.type != null) {
                studentWorkJSONObject.put("type", this.type);
            }

            if (this.title != null) {
                studentWorkJSONObject.put("title", this.title);
            }

            if (this.content != null) {
                studentWorkJSONObject.put("content", this.content);
            }

			if (this.clientSaveTime != null) {
				studentWorkJSONObject.put("clientSaveTime", clientSaveTime.getTime());
			}

			if (this.serverSaveTime != null) {
				studentWorkJSONObject.put("serverSaveTime", serverSaveTime.getTime());
			}

            if (this.clientDeleteTime != null) {
                studentWorkJSONObject.put("clientDeleteTime", clientDeleteTime.getTime());
            }

            if (this.serverDeleteTime != null) {
                studentWorkJSONObject.put("serverDeleteTime", serverDeleteTime.getTime());
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
        
        return studentWorkJSONObject;
    }
}