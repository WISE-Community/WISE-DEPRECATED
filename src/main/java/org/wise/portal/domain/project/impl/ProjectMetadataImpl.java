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

  @Column(name = "subject")
  @Getter
  @Setter
  private String subject;

  @Column(name = "summary")
  @Getter
  @Setter
  private String summary;

  @Column(name = "grade_range")
  @Getter
  @Setter
  private String gradeRange;

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

    } catch (JSONException e) {
      e.printStackTrace();
    }
    return metadata.toString();
  }
}
