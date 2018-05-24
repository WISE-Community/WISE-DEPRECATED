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
  private Long id = null;

  @Column(name = "title")
  private String title;

  @Column(name = "author")
  private String author;

  @Column(name = "subject")
  private String subject;

  @Column(name = "summary")
  private String summary;

  private String features;

  @Column(name = "grade_range")
  private String gradeRange;

  private String grades;

  @Column(name = "total_time")
  private String totalTime;

  @Column(name = "comp_time")
  private String compTime;

  @Column(name = "contact")
  private String contact;

  @Column(name = "tech_reqs")
  private String techReqs;

  @Column(name = "tools", length = 32768, columnDefinition = "text")
  private String tools;   // text (blob) 2^15

  @Column(name = "lesson_plan", length = 5120000, columnDefinition = "mediumtext")
  private String lessonPlan;

  @Column(name = "standards", length = 5120000, columnDefinition = "mediumtext")
  private String standards;

  private String standardsAddressed;

  @Column(name = "keywords")
  private String keywords;

  @Column(name = "language")
  private String language;

  @Column(name = "project_fk")
  private Long projectId;

  @Column(name = "version_id")
  private String versionId;

  @Column(name = "last_cleaned")
  private Date lastCleaned;

  @Column(name = "last_edited")
  private Date lastEdited;

  @Column(name = "last_minified")
  private Date lastMinified;

  @Column(name = "post_level")
  private Long postLevel;

  @Column(name = "max_scores", length = 5120000, columnDefinition = "mediumtext")
  private String maxScores;

  @Column(name = "theme")
  private String theme;

  @Column(name = "nav_mode")
  private String navMode;

  public ProjectMetadataImpl() {

  }

  public ProjectMetadataImpl(JSONObject metadataJSON) {
    this.populateFromJSON(metadataJSON);
  }

  public ProjectMetadataImpl(String metadataJSONString) throws JSONException {
    this.populateFromJSON(new JSONObject(metadataJSONString));
  }

  public String getFeatures() {
    return features;
  }

  public void setFeatures(String features) {
    this.features = features;
  }

  public String getGradeRange() {
    return gradeRange;
  }

  public void setGradeRange(String gradeRange) {
    this.gradeRange = gradeRange;
  }

  public String getGrades() {
    return grades;
  }

  public void setGrades(String grades) {
    this.grades = grades;
  }

  public String getTotalTime() {
    return totalTime;
  }

  public void setTotalTime(String totalTime) {
    this.totalTime = totalTime;
  }

  public String getCompTime() {
    return compTime;
  }

  public void setCompTime(String compTime) {
    this.compTime = compTime;
  }

  public String getContact() {
    return contact;
  }

  public void setContact(String contact) {
    this.contact = contact;
  }

  public String getTechReqs() {
    return techReqs;
  }

  public void setTechReqs(String techReqs) {
    this.techReqs = techReqs;
  }

  public String getTools() {
    return tools;
  }

  public void setTools(String tools) {
    this.tools = tools;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getAuthor() {
    return author;
  }

  public void setAuthor(String author) {
    this.author = author;
  }

  public String getSubject() {
    return this.subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

  public String getSummary() {
    return summary;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  /**
   * @return the lessonPlan
   */
  public String getLessonPlan() {
    return lessonPlan;
  }

  /**
   * @param lessonPlan the lessonPlan to set
   */
  public void setLessonPlan(String lessonPlan) {
    this.lessonPlan = lessonPlan;
  }

  /**
   * @return the standards
   */
  public String getStandards() {
    return standards;
  }

  /**
   * @param standards the standards to set
   */
  public void setStandards(String standards) {
    this.standards = standards;
  }

  /**
   * @return the standardsAddressed
   */
  public String getStandardsAddressed() {
    return standardsAddressed;
  }

  /**
   * @param standardsAddressed the standardsAddressed to set
   */
  public void setStandardsAddressed(String standardsAddressed) {
    this.standardsAddressed = standardsAddressed;
  }

  /**
   * @return the keywords
   */
  public String getKeywords() {
    return keywords;
  }

  /**
   * @param keywords the keywords to set
   */
  public void setKeywords(String keywords) {
    this.keywords = keywords;
  }

  /**
   * @return the language
   */
  public String getLanguage() {
    return language;
  }

  /**
   * @param language the language to set
   */
  public void setLanguage(String language) {
    this.language = language;
  }

  /**
   * @param projectId the projectId to set
   */
  public void setProjectId(Long projectId) {
    this.projectId = projectId;
  }

  /**
   * @return the versionId
   */
  public String getVersionId() {
    return versionId;
  }

  /**
   * @param versionId the versionId to set
   */
  public void setVersionId(String versionId) {
    this.versionId = versionId;
  }

  /**
   * @return the projectId
   */
  public Long getProjectId() {
    return projectId;
  }

  public void setLastCleaned(Date lastCleaned) {
    this.lastCleaned = lastCleaned;
  }

  public Date getLastCleaned() {
    return lastCleaned;
  }

  public void setLastEdited(Date lastEdited) {
    this.lastEdited = lastEdited;
  }

  public Date getLastEdited() {
    return lastEdited;
  }

  public void setLastMinified(Date lastMinified) {
    this.lastMinified = lastMinified;
  }

  public Date getLastMinified() {
    return lastMinified;
  }

  public Long getPostLevel() {
    return postLevel;
  }

  public void setPostLevel(Long postLevel) {
    this.postLevel = postLevel;
  }

  public String getMaxScores() {
    return maxScores;
  }

  public void setMaxScores(String maxScores) {
    this.maxScores = maxScores;
  }

  public String getTheme() {
    return theme;
  }

  public void setTheme(String theme) {
    this.theme = theme;
  }

  public String getNavMode() {
    return navMode;
  }

  public void setNavMode(String navMode) {
    this.navMode = navMode;
  }

  public void populateFromJSON(JSONObject metadataJSON) {
    //check that the title exists and is not null
    if (metadataJSON.has("title") && !metadataJSON.isNull("title")) {

      try {
        String title = metadataJSON.getString("title");
        if (title.equals("null")) {
          title = "";
        }
        setTitle(title);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the author exists and is not null
    if (metadataJSON.has("author") && !metadataJSON.isNull("author")) {
      try {
        String author = metadataJSON.getString("author");
        if (author.equals("null")) {
          author = "";
        }
        setAuthor(author);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the subject exists and is not null
    if (metadataJSON.has("subject") && !metadataJSON.isNull("subject")) {
      try {
        String subject = metadataJSON.getString("subject");
        if (subject.equals("null")) {
          subject = "";
        }
        setSubject(subject);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the summary exists and is not null
    if (metadataJSON.has("summary") && !metadataJSON.isNull("summary")) {
      try {
        String summary = metadataJSON.getString("summary");
        if (summary.equals("null")) {
          summary = "";
        }
        setSummary(summary);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the features exists and is not null
    if (metadataJSON.has("features") && !metadataJSON.isNull("features")) {
      try {
        String features = metadataJSON.getString("features");
        if (features.equals("null")) {
          features = "";
        }
        setFeatures(features);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the grade range exists and is not null
    if (metadataJSON.has("gradeRange") && !metadataJSON.isNull("gradeRange")) {
      try {
        String gradeRange = metadataJSON.getString("gradeRange");
        if (gradeRange.equals("null")) {
          gradeRange = "";
        }
        setGradeRange(gradeRange);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that grades exists and is not null
    if (metadataJSON.has("grades") && !metadataJSON.isNull("grades")) {
      try {
        JSONArray grades = metadataJSON.getJSONArray("grades");
        if (grades.equals("null")) {
          grades = new JSONArray();
        }
        setGrades(grades.toString());
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the total time exists and is not null
    if (metadataJSON.has("totalTime")  && !metadataJSON.isNull("totalTime")) {
      try {
        String totalTime = metadataJSON.getString("totalTime");

        if (totalTime.equals("null")) {
          totalTime = "";
        }
        setTotalTime(totalTime);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the comp time exists and is not null
    if (metadataJSON.has("compTime") && !metadataJSON.isNull("compTime")) {
      try {
        String compTime = metadataJSON.getString("compTime");

        if (compTime.equals("null")) {
          compTime = "";
        }
        setCompTime(compTime);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the contact exists and is not null
    if (metadataJSON.has("contact") && !metadataJSON.isNull("contact")) {
      try {
        String contact = metadataJSON.getString("contact");
        if (contact.equals("null")) {
          contact = "";
        }
        setContact(contact);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the tech reqs exists and is not null
    if (metadataJSON.has("techReqs") && !metadataJSON.isNull("techReqs")) {
      try {
        JSONObject techReqs = metadataJSON.getJSONObject("techReqs");
        if (techReqs.equals("null")) {
          techReqs = new JSONObject();
        }
        setTechReqs(techReqs.toString());
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the tools exists and is not null
    if (metadataJSON.has("tools") && !metadataJSON.isNull("tools")) {
      try {
        JSONObject tools = metadataJSON.getJSONObject("tools");
        if (tools.equals("null")) {
          tools = new JSONObject();
        }
        setTools(tools.toString());
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the lesson plan exists and is not null
    if (metadataJSON.has("lessonPlan") && !metadataJSON.isNull("lessonPlan")) {
      try {
        String lessonPlan = metadataJSON.getString("lessonPlan");
        if (lessonPlan.equals("null")) {
          lessonPlan = "";
        }
        setLessonPlan(lessonPlan);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the standards exists and is not null
    if (metadataJSON.has("standards") && !metadataJSON.isNull("standards")) {
      try {
        String standards = metadataJSON.getString("standards");
        if (standards.equals("null")) {
          standards = "";
        }
        setStandards(standards);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that standardsAddressed exists and is not null
    if (metadataJSON.has("standardsAddressed") && !metadataJSON.isNull("standardsAddressed")) {
      try {
        JSONObject standardsAddressed = metadataJSON.getJSONObject("standardsAddressed");
        if (standardsAddressed.equals("null")) {
          standardsAddressed = new JSONObject();
        }
        setStandardsAddressed(standardsAddressed.toString());
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the keywords exists and is not null
    if (metadataJSON.has("keywords") && !metadataJSON.isNull("keywords")) {
      try {
        String keywords = metadataJSON.getString("keywords");
        if (keywords.equals("null")) {
          keywords = "";
        }
        setKeywords(keywords);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the language exists and is not null
    if (metadataJSON.has("language") && !metadataJSON.isNull("language")) {
      try {
        String language = metadataJSON.getString("language");
        if (language.equals("null")) {
          language = "";
        }
        setLanguage(language);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the max scores exists and is not null
    if (metadataJSON.has("maxScores") && !metadataJSON.isNull("maxScores")) {
      try {
        String maxScores = metadataJSON.getString("maxScores");
        if (maxScores.equals("null")) {
          maxScores = "";
        }
        setMaxScores(maxScores);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the theme exists and is not null
    if (metadataJSON.has("theme") && !metadataJSON.isNull("theme")) {
      try {
        String theme = metadataJSON.getString("theme");
        if (theme.equals("null")) {
          theme = "";
        }
        setTheme(theme);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the navigation mode exists and is not null
    if (metadataJSON.has("navMode") && !metadataJSON.isNull("navMode")) {
      try {
        String navMode = metadataJSON.getString("navMode");
        if (navMode.equals("null")) {
          navMode = "";
        }
        setNavMode(navMode);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    //check that the post level exists and is not null
    if (metadataJSON.has("postLevel") && !metadataJSON.isNull("postLevel")) {

      try {
        Long postLevel = metadataJSON.getLong("postLevel");
        if (postLevel.equals("null")) {
          postLevel = (long) 5;
        }
        setPostLevel(postLevel);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
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

    // check that the tech reqs is not null
    if (techReqs != null && !techReqs.equals("") && !techReqs.equals("null")) {

      try {
        // get the JSON object for the tech reqs
        JSONObject techReqsJSON = new JSONObject(techReqs);

        if (techReqsJSON.has("java") && (techReqsJSON.getString("java").equals("checked") || techReqsJSON.getString("java").equals("true"))) {
          // java is required
          techReqsAndDetailsStringBuf.append("Java");
        }

        if (techReqsJSON.has("flash") && techReqsJSON.getString("flash").equals("checked")) {
          if (techReqsAndDetailsStringBuf.length() != 0) {
            // add a comma to separate the previous text
            techReqsAndDetailsStringBuf.append(", ");
          }

          // flash is required
          techReqsAndDetailsStringBuf.append("Flash");
        }

        if (techReqsJSON.has("quickTime") && (techReqsJSON.getString("quickTime").equals("checked") || techReqsJSON.getString("quickTime").equals("true"))) {
          if (techReqsAndDetailsStringBuf.length() != 0) {
            // add a comma to separate the previous text
            techReqsAndDetailsStringBuf.append(", ");
          }

          // quicktime is required
          techReqsAndDetailsStringBuf.append("QuickTime");
        }

        if (techReqsJSON.has("techDetails") && techReqsJSON.getString("techDetails") != null && !techReqsJSON.getString("techDetails").equals("")) {
          if (techReqsAndDetailsStringBuf.length() != 0) {
            // add a comma to separate the previous text
            techReqsAndDetailsStringBuf.append(", ");
          }

          // add the tech details
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
      /*
       * we will retrieve the grades JSON string and replace it with a JSON array
       * so that the client does not need to parse the JSON string
       */
      String gradesString = metadata.getString("grades");

      // check if the field is null or "null"
      if (gradesString != null && gradesString != "null") {
        // create the JSON object
        JSONArray gradesJSON = new JSONArray(gradesString);

        // override the existing grades string with this JSON array
        metadata.put("grades", gradesJSON);
      } else {
        // override the existing grades string with this empty JSON array
        metadata.put("grades", new JSONArray());
      }

      /*
       * we will retrieve the techReqs JSON string and replace it with a JSON Object
       * so that the client does not need to parse the JSON string
       */
      String techReqsString = metadata.getString("techReqs");

      // check if the field is null or "null"
      if (techReqsString != null && techReqsString != "null") {
        // create the JSON object
        JSONObject techReqsJSON = new JSONObject(techReqsString);

        // override the existing techReqs string with this JSON object
        metadata.put("techReqs", techReqsJSON);
      } else {
        // override the existing techReqs string with this empty JSON object
        metadata.put("techReqs", new JSONObject());
      }

      /*
       * we will retrieve the tools JSON string and replace it with a JSON Object
       * so that the client does not need to parse the JSON string
       */
      String toolsString = metadata.getString("tools");

      // check if the field is null or "null"
      if (toolsString != null && toolsString != "null") {
        // create the JSON object
        JSONObject toolsJSON = new JSONObject(toolsString);

        // override the existing techReqs string with this JSON object
        metadata.put("tools", toolsJSON);
      } else {
        // override the existing techReqs string with this empty JSON object
        metadata.put("tools", new JSONObject());
      }

      /*
       * we will retrieve the standardsAddressed JSON string and replace it with a JSON Object
       * so that the client does not need to parse the JSON string
       */
      String standardsAddressedString = metadata.getString("standardsAddressed");

      // check if the field is null or "null"
      if (standardsAddressedString != null && standardsAddressedString != "null") {
        // create the JSON object
        JSONObject standardsAddressedJSON = new JSONObject(standardsAddressedString);

        // override the existing standardsAddressed string with this JSON object
        metadata.put("standardsAddressed", standardsAddressedJSON);
      } else {
        // override the existing standardsAddressed string with this empty JSON object
        metadata.put("standardsAddressed", new JSONObject());
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
