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
package org.wise.portal.domain.project;

import java.util.Date;

import org.json.JSONObject;

/**
 * @author Patrick Lawler
 */
public interface ProjectMetadata{

  /**
   * Populates this metadata object using values from the specified JSON obj.
   */
  void populateFromJSON(JSONObject metadataJSON);

  /**
   * @return <code>String</code> the title to get
   */
  String getTitle();

  void setUri(String uri);

  String getUri();

  /**
   * @param <code>String</code> the title to set
   */
  void setTitle(String title);

  /**
   * @return <code>String</code> the author to get
   */
  String getAuthor();

  /**
   * @param <code>String</code> the author to set
   */
  void setAuthor(String author);

  String getAuthors();

  void setAuthors(String authors);

  String getParentProjects();

  void setParentProjects(String parentProjects);

  /**
   * @return <code>String</code> the subject to get
   */
  String getSubject();

  /**
   * @param <code>String</code> the subject to set
   */
  void setSubject(String subject);

  /**
   * @return <code>String</code> the summary to get
   */
  String getSummary();

  /**
   * @param <code>String</code> the summary to set
   */
  void setSummary(String summary);

  /**
   * @return <code>Long</code> the id to get
   */
  Long getId();

  /**
   * @param <code>Long</code> the id to set
   */
  void setId(Long id);

  /**
   * @return <code>String</code> the grade range to get
   */
  String getGradeRange();

  /**
   * @param <code>String</code> the grade rang to set
   */
  void setGradeRange(String range);

  /**
   * @return <code>Long</code> the total time to get
   */
  String getTotalTime();

  /**
   * @param <code>Long</code> the total time to set (in mins)
   */
  void setTotalTime(String mins);

  /**
   * @return <code>Long</code> the comp time to get
   */
  String getCompTime();

  /**
   * @param <code>Long</code> the total time to set (in mins)
   */
  void setCompTime(String mins);

  /**
   * @return <code>String</code> the contact to get
   */
  String getContact();

  /**
   * @param <code>String</code> the contact to set
   */
  void setContact(String contact);

  /**
   * @return <code>String</code> the tech reqs to get
   */
  String getTechReqs();

  /**
   * @param <code>String</code> the tech reqs to set
   */
  void setTechReqs(String reqs);

  /**
   * @return <code>String</code> the tools to get
   */
  String getTools();

  /**
   * @param <code>String</code> the tools to set
   */
  void setTools(String tools);

  /**
   * @return <code>String</code> the lesson plan
   */
  String getLessonPlan();

  /**
   * @param <code>String</code> standards
   */
  void setStandards(String standards);

  /**
   * @return <code>String</code> the lesson plan
   */
  String getStandards();

  /**
   * @param <code>String</code> lessonPlan
   */
  void setLessonPlan(String lessonPlan);

  /**
   * @param <code>String</code> keywords
   */
  String getKeywords();

  /**
   * @return <code>String</code> keywords
   */
  void setKeywords(String keywords);

  /**
   * @param <code>String</code> language
   */
  String getLanguage();

  /**
   * @return <code>String</code> language
   */
  void setLanguage(String language);

  /**
   * @param projectId the projectId to set
   */
  void setProjectId(Long projectId);

  /**
   * @return the versionId
   */
  String getVersionId();

  /**
   * @param versionId the versionId to set
   */
  void setVersionId(String versionId);

  /**
   * @return the projectId
   */
  Long getProjectId();

  void setLastCleaned(Date lastCleaned);

  Date getLastCleaned();

  void setLastEdited(Date lastEdited);

  Date getLastEdited();

  void setLastMinified(Date lastMinified);

  Date getLastMinified();

  Long getPostLevel();

  void setPostLevel(Long postLevel);

  String getMaxScores();

  void setMaxScores(String maxScores);

  String toJSONString();

  JSONObject toJSONObject();
}
