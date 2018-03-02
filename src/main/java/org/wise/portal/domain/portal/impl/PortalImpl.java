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
package org.wise.portal.domain.portal.impl;

import java.util.Properties;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import org.wise.portal.domain.portal.Portal;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * WISE Portal settings
 *
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "portal")
public class PortalImpl implements Portal {

  @Transient
  private static final long serialVersionUID = 1L;

  @Column(name = "portalname")
  private String portalName;

  @Column(name = "address")
  protected String address;

  @Column(name = "sendmail_on_exception")
  private boolean isSendMailOnException;

  @Column(name = "google_map_key")
  private String googleMapKey;

  @Column(name = "sendmail_properties")
  private Properties sendmailProperties;

  @Column(name = "comments")
  private String comments;

  @Column(name = "settings", length = 32768, columnDefinition = "text")
  private String settings;  // text (blob) 2^15

  @Column(name = "projectLibraryGroups", length = 32768, columnDefinition = "text")
  private String projectLibraryGroups;

  @Column(name = "run_survey_template", length = 32768, columnDefinition = "text")
  private String runSurveyTemplate;  // text (blob) 2^15

  @Column(name = "projectMetadataSettings", length = 32768, columnDefinition = "text")
  private String projectMetadataSettings;  // text (blob) 2^15

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", columnDefinition = "tinyint")
  public Integer id = null;

  @Version
  @Column(name = "OPTLOCK")
  protected Integer version = null;

  /**
   * @return the sendEmailOnException value
   */
  public boolean isSendMailOnException() {
    return isSendMailOnException;
  }

  /**
   * @param isSendMailOnException the sendEmailOnException to set
   */
  public void setSendMailOnException(boolean isSendMailOnException) {
    this.isSendMailOnException = isSendMailOnException;
  }

  /**
   * @return the sendmailProperties
   */
  public Properties getSendmailProperties() {
    return sendmailProperties;
  }

  /**
   * @param sendmailProperties the sendmailProperties to set
   */
  public void setSendmailProperties(Properties sendmailProperties) {
    this.sendmailProperties = sendmailProperties;
  }

  /**
   * @see org.wise.portal.domain.portal.Portal#getPortalName()
   */
  public String getPortalName() {
    return this.portalName;
  }

  /**
   * @see org.wise.portal.domain.portal.Portal#setPortalName(java.lang.String)
   */
  public void setPortalName(String portalName) {
    this.portalName = portalName;
  }

  public Integer getId() {
    return this.id;
  }

  @SuppressWarnings("unused")
  private void setId(Integer id) {
    this.id = id;
  }

  @SuppressWarnings("unused")
  private Integer getVersion() {
    return this.version;
  }

  @SuppressWarnings("unused")
  private void setVersion(Integer version) {
    this.version = version;
  }

  /**
   * @return the comments
   */
  public String getComments() {
    return comments;
  }

  /**
   * @param comments the comments to set
   */
  public void setComments(String comments) {
    this.comments = comments;
  }

  /**
   * @return the settings
   */
  public String getSettings() {
    return settings;
  }

  /**
   * @param settings the settings to set
   */
  public void setSettings(String settings) {
    this.settings = settings;
  }

  /**
   * @see org.wise.portal.domain.portal.Portal#isLoginAllowed()
   */
  public boolean isLoginAllowed() {
    try {
      JSONObject settings = new JSONObject(getSettings());
      return settings.getBoolean("isLoginAllowed");
    } catch (JSONException e) {
    }
    return true;  // allow login by default if there was an exception
  }

  /**
   * @see org.wise.portal.domain.portal.Portal#setLoginAllowed(boolean)
   */
  public void setLoginAllowed(boolean loginAllowed) {
    try {
      JSONObject settings = new JSONObject(getSettings());
      settings.put("isLoginAllowed", loginAllowed);
      this.setSettings(settings.toString());
    } catch (JSONException e) {
    }
  }

  /**
   * @see org.wise.portal.domain.portal.Portal#isSendStatisticsToHub()
   */
  public boolean isSendStatisticsToHub() {
    try {
      JSONObject settings = new JSONObject(getSettings());
      return settings.getBoolean("isSendStatisticsToHub");
    } catch (JSONException e) {
    }
    return false;  // don't send statistics by default if there was an exception
  }

  /**
   * @see org.wise.portal.domain.portal.Portal#setSendStatisticsToHub(boolean)
   */
  public void setSendStatisticsToHub(boolean doSendStatistics) {
    try {
      JSONObject settings = new JSONObject(getSettings());
      settings.put("isSendStatisticsToHub", doSendStatistics);
      this.setSettings(settings.toString());
    } catch (JSONException e) {
    }
  }

  /**
   * @return the address
   */
  public String getAddress() {
    return address;
  }

  /**
   * @param address the address to set
   */
  public void setAddress(String address) {
    this.address = address;
  }

  /**
   * @return the googleMapKey
   */
  public String getGoogleMapKey() {
    return googleMapKey;
  }

  /**
   * @param googleMapKey the googleMapKey to set
   */
  public void setGoogleMapKey(String googleMapKey) {
    this.googleMapKey = googleMapKey;
  }

  @Override
  public String getRunSurveyTemplate() {
    return this.runSurveyTemplate;
  }

  @Override
  public void setRunSurveyTemplate(String runSurveyTemplate) {
    this.runSurveyTemplate = runSurveyTemplate;
  }

  /**
   * Get the project metadata string
   *
   * @return project metadata string
   */
  public String getProjectMetadataSettings() {
    return this.projectMetadataSettings;
  }

  /**
   * Set the project metadata string
   *
   * @param projectMetadataSettings project metadata setting string
   */
  public void setProjectMetadataSettings (String projectMetadataSettings) {
    this.projectMetadataSettings = projectMetadataSettings;
  }

  public String getProjectLibraryGroups() {
    return projectLibraryGroups;
  }
}
