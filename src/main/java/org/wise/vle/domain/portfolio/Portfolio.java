/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 */
package org.wise.vle.domain.portfolio;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.Index;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.vle.domain.PersistableDomain;

/**
 * Controller for processing requests related to portfolio.
 * @author Hiroki Terashima
 * @author Eddie Pan
 */
@Entity
@Table(name="portfolio")
@org.hibernate.annotations.Table(appliesTo="portfolio",
indexes = {
		@Index(name="runIdAndWorkgroupIdIndex", columnNames={"runId", "workgroupId"})	
}
		)
public class Portfolio extends PersistableDomain implements Serializable {

	private static final long serialVersionUID = 1L;

	//the unique id of the Portfolio
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;

	//the id of the run
	@Column(name="runId")
	private Long runId = null;

	//the id of the workgroup
	@Column(name="workgroupId")
	private Long workgroupId = null;

	//the JSONArray string for the portfolio items array
	@Column(name="items", length=512000)
	private String items = null;

	//the JSONArray string for the portfolio items array
	@Column(name="metadata", length=2048)
	private String metadata = null;

	//whether this portfolio is a public portfolio
	@Column(name="isPublic")
	private Boolean isPublic = false;

	//whether this portfolio is submitted
	@Column(name="isSubmitted")
	private Boolean isSubmitted = false;

	//portfolio tags
	@Column(name="tags")
	private String tags;

	//the time the portfolio was posted
	@Column(name="postTime")
	private Timestamp postTime;

	/**
	 * the no args constructor
	 */
	public Portfolio() {

	}

	/**
	 * Constructor that does not populate the data field
	 * @param runId
	 * @param projectId
	 * @param workgroupId
	 */
	public Portfolio(long runId, long workgroupId, String items) {
		this.runId = runId;
		this.workgroupId = workgroupId;
		Calendar now = Calendar.getInstance();
		this.postTime = new Timestamp(now.getTimeInMillis());
		this.items = items;
	}
	
	/**
	 * @see org.wise.vle.domain.PersistableDomain#getObjectClass()
	 */
	@Override
	protected Class<?> getObjectClass() {
		return Portfolio.class;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getRunId() {
		return runId;
	}

	public void setRunId(Long runId) {
		this.runId = runId;
	}

	public Long getWorkgroupId() {
		return workgroupId;
	}

	public void setWorkgroupId(Long workgroupId) {
		this.workgroupId = workgroupId;
	}

	public String getItems() {
		return items;
	}

	public void setItems(String items) {
		this.items = items;
	}

	public Timestamp getPostTime() {
		return postTime;
	}

	public void setPostTime(Timestamp postTime) {
		this.postTime = postTime;
	}

	public Boolean isPublic() {
		return isPublic;
	}

	public void setPublic(Boolean isPublic) {
		this.isPublic = isPublic;
	}

	public Boolean isSubmitted() {
		return isSubmitted;
	}

	public void setSubmitted(Boolean isSubmitted) {
		this.isSubmitted = isSubmitted;
	}


	/**
	 * Get the JSON object representation of the Portfolio
	 * @return a JSONObject containing the data from the portfolio
	 */
	public JSONObject toJSONObject() {
		JSONObject jsonObject = null;

		String items = getItems();

		try {
			jsonObject = new JSONObject();
			jsonObject.put("items", items);
			jsonObject.put("id", getId());
			jsonObject.put("runId", getRunId());
			jsonObject.put("workgroupId", getWorkgroupId());
			jsonObject.put("isPublic", isPublic());
			jsonObject.put("isSubmitted", isSubmitted());
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return jsonObject;
	}

	/**
	 * Get the JSON string representation of the Portfolio
	 * @return
	 */
	public String toJSONString() {
		String jsonString = null;

		//get the JSONObject representation of the idea basket
		JSONObject jsonObject = toJSONObject();

		try {
			if(jsonObject != null) {
				//get the JSON string representation with indentation
				jsonString = jsonObject.toString(3);
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}

		return jsonString;
	}

}
