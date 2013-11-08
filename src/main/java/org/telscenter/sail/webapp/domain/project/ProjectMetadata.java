/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
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
package org.telscenter.sail.webapp.domain.project;

import java.util.Date;

import org.telscenter.sail.webapp.presentation.util.json.JSONObject;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public interface ProjectMetadata{
	
	/**
	 * Populates this metadata object using values from the specified JSON obj.
	 */
	public void populateFromJSON(JSONObject metadataJSON);
	
	/**
	 * @return <code>String</code> the title to get
	 */
	public String getTitle();
	
	/**
	 * @param <code>String</code> the title to set
	 */
	public void setTitle(String title);
	
	/**
	 * @return <code>String</code> the author to get
	 */
	public String getAuthor();
	
	/**
	 * @param <code>String</code> the author to set
	 */
	public void setAuthor(String author);
	
	/**
	 * @return <code>String</code> the subject to get
	 */
	public String getSubject();
	
	/**
	 * @param <code>String</code> the subject to set
	 */
	public void setSubject(String subject);
	
	/**
	 * @return <code>String</code> the summary to get
	 */
	public String getSummary();
	
	/**
	 * @param <code>String</code> the summary to set
	 */
	public void setSummary(String summary);
	
	/**
	 * @return <code>Long</code> the id to get
	 */
	public Long getId();
	
	/**
	 * @param <code>Long</code> the id to set
	 */
	public void setId(Long id);
	
	/**
	 * @return <code>String</code> the grade range to get
	 */
	public String getGradeRange();
	
	/**
	 * @param <code>String</code> the grade rang to set
	 */
	public void setGradeRange(String range);
	
	/**
	 * @return <code>Long</code> the total time to get
	 */
	public String getTotalTime();
	
	/**
	 * @param <code>Long</code> the total time to set (in mins)
	 */
	public void setTotalTime(String mins);
	
	/**
	 * @return <code>Long</code> the comp time to get
	 */
	public String getCompTime();
	
	/**
	 * @param <code>Long</code> the total time to set (in mins)
	 */
	public void setCompTime(String mins);
	
	/**
	 * @return <code>String</code> the contact to get
	 */
	public String getContact();
	
	/**
	 * @param <code>String</code> the contact to set
	 */
	public void setContact(String contact);
	
	/**
	 * @return <code>String</code> the tech reqs to get
	 */
	public String getTechReqs();
	
	/**
	 * @param <code>String</code> the tech reqs to set
	 */
	public void setTechReqs(String reqs);

	/**
	 * @return <code>String</code> the tools to get
	 */
	public String getTools();
	
	/**
	 * @param <code>String</code> the tools to set
	 */
	public void setTools(String tools);

	/**
	 * @return <code>String</code> the lesson plan
	 */
	public String getLessonPlan();
	
	/**
	 * @param <code>String</code> standards
	 */
	public void setStandards(String standards);

	/**
	 * @return <code>String</code> the lesson plan
	 */
	public String getStandards();
	
	/**
	 * @param <code>String</code> lessonPlan
	 */
	public void setLessonPlan(String lessonPlan);

	/**
	 * @param <code>String</code> keywords
	 */
	public String getKeywords();
	
	/**
	 * @return <code>String</code> keywords
	 */
	public void setKeywords(String keywords);
	
	/**
	 * @param <code>String</code> language
	 */
	public String getLanguage();
	
	/**
	 * @return <code>String</code> language
	 */
	public void setLanguage(String language);
	
	/**
	 * @param projectId the projectId to set
	 */
	public void setProjectId(Long projectId);
	
	/**
	 * @return the versionId
	 */
	public String getVersionId();
	
	/**
	 * @param versionId the versionId to set
	 */
	public void setVersionId(String versionId);

	/**
	 * @return the projectId
	 */
	public Long getProjectId();
	
	public void setLastCleaned(Date lastCleaned);

	public Date getLastCleaned();

	public void setLastEdited(Date lastEdited);

	public Date getLastEdited();
	
	public void setLastMinified(Date lastMinified);
	
	public Date getLastMinified();
	
	public Long getPostLevel();

	public void setPostLevel(Long postLevel);
	
	public String getMaxScores();

	public void setMaxScores(String maxScores);
	
	public String toJSONString();
}
