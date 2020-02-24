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
package org.wise.portal.domain.project.impl;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.json.JSONArray;
import lombok.Getter;
import lombok.Setter;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.project.ProjectMetadata;

/**
 * @author Patrick Lawler
 */
@Entity
@Table(name = "project_metadata")
public class ProjectMetadataImpl implements ProjectMetadata, Serializable {

  @Transient
  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Getter
  @Setter
  private Long id = null;

  @Column(name = "title")
  @Getter
  @Setter
  private String title;

  @Column(name = "author")
  @Getter
  @Setter
  private String author;

  @Getter
  @Setter
  private String authors;

  @Getter
  @Setter
  private String uri;

  @Getter
  @Setter
  private String parentProjects;

  @Column(name = "subject")
  @Getter
  @Setter
  private String subject;

  @Column(name = "summary")
  @Getter
  @Setter
  private String summary;

  @Getter
  @Setter
  private String features;

  @Column(name = "grade_range")
  @Getter
  @Setter
  private String gradeRange;

  @Getter
  @Setter
  private String grades;

  @Column(name = "total_time")
  @Getter
  @Setter
  private String totalTime;

  @Column(name = "comp_time")
  @Getter
  @Setter
  private String compTime;

  @Column(name = "contact")
  @Getter
  @Setter
  private String contact;

  @Column(name = "tech_reqs")
  @Getter
  @Setter
  private String techReqs;

  @Column(name = "tools", length = 32768, columnDefinition = "text")
  @Getter
  @Setter
  private String tools;   // text (blob) 2^15

  @Column(name = "lesson_plan", length = 5120000, columnDefinition = "mediumtext")
  @Getter
  @Setter
  private String lessonPlan;

  @Column(name = "standards", length = 5120000, columnDefinition = "mediumtext")
  @Getter
  @Setter
  private String standards;

  @Getter
  @Setter
  private String standardsAddressed;

  @Column(name = "keywords")
  @Getter
  @Setter
  private String keywords;

  @Column(name = "language")
  @Getter
  @Setter
  private String language;

  @Column(name = "project_fk")
  @Getter
  @Setter
  private Long projectId;

  @Column(name = "version_id")
  @Getter
  @Setter
  private String versionId;

  @Column(name = "last_cleaned")
  @Getter
  @Setter
  private Date lastCleaned;

  @Column(name = "last_edited")
  @Getter
  @Setter
  private Date lastEdited;

  @Column(name = "last_minified")
  @Getter
  @Setter
  private Date lastMinified;

  @Column(name = "post_level")
  @Getter
  @Setter
  private Long postLevel;

  @Column(name = "max_scores", length = 5120000, columnDefinition = "mediumtext")
  @Getter
  @Setter
  private String maxScores;

  @Column(name = "theme")
  @Getter
  @Setter
  private String theme;

  @Column(name = "nav_mode")
  @Getter
  @Setter
  private String navMode;

  public ProjectMetadataImpl() {
  }

  public ProjectMetadataImpl(JSONObject metadataJSON) {
    this.populateFromJSON(metadataJSON);
  }

  public ProjectMetadataImpl(String metadataJSONString) throws JSONException {
    this.populateFromJSON(new JSONObject(metadataJSONString));
  }

  public void populateFromJSON(JSONObject metadataJSON) {
    String title = metadataJSON.optString("title", "");
    if (title.equals("null")) {
      title = "";
    }
    setTitle(title);

    String uri = metadataJSON.optString("uri");
    if (uri.equals("null")) {
      uri = "";
    }
    setUri(uri);

    String author = metadataJSON.optString("author", "");
    if (author.equals("null")) {
      author = "";
    }
    setAuthor(author);

    JSONArray authors = metadataJSON.optJSONArray("authors");
    if (authors == null) {
      authors = new JSONArray();
    }
    setAuthors(authors.toString());

    JSONArray parentProjects = metadataJSON.optJSONArray("parentProjects");
    if (parentProjects == null) {
      parentProjects = new JSONArray();
    }
    setParentProjects(parentProjects.toString());

    String subject = metadataJSON.optString("subject", "");
    if (subject.equals("null")) {
      subject = "";
    }
    setSubject(subject);

    String summary = metadataJSON.optString("summary", "");
    if (summary.equals("null")) {
      summary = "";
    }
    setSummary(summary);

    String features = metadataJSON.optString("features", "");
    if (features.equals("null")) {
      features = "";
    }
    setFeatures(features);

    String gradeRange = metadataJSON.optString("gradeRange", "");
    if (gradeRange.equals("null")) {
      gradeRange = "";
    }
    setGradeRange(gradeRange);

    JSONArray grades = metadataJSON.optJSONArray("grades");
    if (grades == null) {
      grades = new JSONArray();
    }
    setGrades(grades.toString());

    String totalTime = metadataJSON.optString("totalTime", "");
    if (totalTime.equals("null")) {
      totalTime = "";
    }
    setTotalTime(totalTime);

    String compTime = metadataJSON.optString("compTime", "");
    if (compTime.equals("null")) {
      compTime = "";
    }
    setCompTime(compTime);

    String contact = metadataJSON.optString("contact", "");
    if (contact.equals("null")) {
      contact = "";
    }
    setContact(contact);

    JSONObject techReqs = metadataJSON.optJSONObject("techReqs");
    if (techReqs == null) {
      techReqs = new JSONObject();
    }
    setTechReqs(techReqs.toString());

    JSONObject tools = metadataJSON.optJSONObject("tools");
    if (tools == null) {
      tools = new JSONObject();
    }
    setTools(tools.toString());

    String lessonPlan = metadataJSON.optString("lessonPlan", "");
    if (lessonPlan.equals("null")) {
      lessonPlan = "";
    }
    setLessonPlan(lessonPlan);

    String standards = metadataJSON.optString("standards", "");
    if (standards.equals("null")) {
      standards = "";
    }
    setStandards(standards);

    JSONObject standardsAddressed = metadataJSON.optJSONObject("standardsAddressed");
    if (standardsAddressed == null) {
      standardsAddressed = new JSONObject();
    }
    setStandardsAddressed(standardsAddressed.toString());

    String keywords = metadataJSON.optString("keywords", "");
    if (keywords.equals("null")) {
      keywords = "";
    }
    setKeywords(keywords);

    String language = metadataJSON.optString("language", "");
    if (language.equals("null")) {
      language = "";
    }
    setLanguage(language);

    String maxScores = metadataJSON.optString("maxScores", "");
    if (maxScores.equals("null")) {
      maxScores = "";
    }
    setMaxScores(maxScores);

    String theme = metadataJSON.optString("theme", "");
    if (theme.equals("null")) {
      theme = "";
    }
    setTheme(theme);

    String navMode = metadataJSON.optString("navMode", "");
    if (navMode.equals("null")) {
      navMode = "";
    }
    setNavMode(navMode);

    Long postLevel = metadataJSON.optLong("postLevel");
    if (postLevel.equals(0)) {
      postLevel = (long) 5;
    }
    setPostLevel(postLevel);
  }

  /**
   * Returns a human readable string that lists the tech requirements
   * as well as the tech details. This is used in the portal when we
   * display the meta data for a project.
   * @return a string with the tech reqs and tech details
   */
  public String getTechDetailsString() {
    StringBuffer techReqsAndDetailsStringBuf = new StringBuffer();
    String techReqs = getTechReqs();

    if (techReqs != null && !techReqs.equals("") && !techReqs.equals("null")) {
      try {
        JSONObject techReqsJSON = new JSONObject(techReqs);
        if (techReqsJSON.has("java") && (techReqsJSON.getString("java").equals("checked") || techReqsJSON.getString("java").equals("true"))) {
          techReqsAndDetailsStringBuf.append("Java");
        }

        if (techReqsJSON.has("flash") && techReqsJSON.getString("flash").equals("checked")) {
          if (techReqsAndDetailsStringBuf.length() != 0) {
            techReqsAndDetailsStringBuf.append(", ");
          }
          techReqsAndDetailsStringBuf.append("Flash");
        }

        if (techReqsJSON.has("quickTime") && (techReqsJSON.getString("quickTime").equals("checked") || techReqsJSON.getString("quickTime").equals("true"))) {
          if (techReqsAndDetailsStringBuf.length() != 0) {
            techReqsAndDetailsStringBuf.append(", ");
          }
          techReqsAndDetailsStringBuf.append("QuickTime");
        }

        if (techReqsJSON.has("techDetails") && techReqsJSON.getString("techDetails") != null && !techReqsJSON.getString("techDetails").equals("")) {
          if (techReqsAndDetailsStringBuf.length() != 0) {
            techReqsAndDetailsStringBuf.append(", ");
          }
          techReqsAndDetailsStringBuf.append(techReqsJSON.getString("techDetails"));
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return techReqsAndDetailsStringBuf.toString();
  }

  /**
   * Gets the JSON string version of this ProjectMetadata object
   * @return a JSON string with the fields and values from this ProjectMetadata object
   */
  public String toJSONString() {
    JSONObject metadata = new JSONObject(this);
    try {
      String authorsString = metadata.getString("authors");
      if (authorsString != null && authorsString != "null") {
        JSONArray authorsJSON = new JSONArray(authorsString);
        metadata.put("authors", authorsJSON);
      } else {
        metadata.put("authors", new JSONArray());
      }

      String gradesString = metadata.getString("grades");
      if (gradesString != null && gradesString != "null") {
        JSONArray gradesJSON = new JSONArray(gradesString);
        metadata.put("grades", gradesJSON);
      } else {
        metadata.put("grades", new JSONArray());
      }

      String techReqsString = metadata.getString("techReqs");
      if (techReqsString != null && techReqsString != "null") {
        JSONObject techReqsJSON = new JSONObject(techReqsString);
        metadata.put("techReqs", techReqsJSON);
      } else {
        metadata.put("techReqs", new JSONObject());
      }

      String toolsString = metadata.getString("tools");
      if (toolsString != null && toolsString != "null") {
        JSONObject toolsJSON = new JSONObject(toolsString);
        metadata.put("tools", toolsJSON);
      } else {
        metadata.put("tools", new JSONObject());
      }

      String standardsAddressedString = metadata.getString("standardsAddressed");
      if (standardsAddressedString != null && standardsAddressedString != "null") {
        JSONObject standardsAddressedJSON = new JSONObject(standardsAddressedString);
        metadata.put("standardsAddressed", standardsAddressedJSON);
      } else {
        metadata.put("standardsAddressed", new JSONObject());
      }

      String parentProjectsString = metadata.getString("parentProjects");
      if (parentProjectsString != null && parentProjectsString != "null") {
        JSONArray parentProjectsJSON = new JSONArray(parentProjectsString);
        metadata.put("parentProjects", parentProjectsJSON);
      } else {
        metadata.put("parentProjects", new JSONArray());
      }

    } catch (JSONException e) {
      e.printStackTrace();
    }
    return metadata.toString();
  }

  public JSONObject toJSONObject() {
    JSONObject result = new JSONObject();
    try {
      result = new JSONObject(toJSONString());
    } catch (JSONException e) {
    }
    return result;
  }
}
