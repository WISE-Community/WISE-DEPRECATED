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

import lombok.Getter;
import lombok.Setter;
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
@Getter
@Setter
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

  @Column(name = "announcement", length = 32768, columnDefinition = "text")
  private String announcement;

  @Column(name = "structures", length = 32768, columnDefinition = "text")
  private String structures;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", columnDefinition = "tinyint")
  public Integer id = null;

  @Version
  @Column(name = "OPTLOCK")
  protected Integer version = null;

  public boolean isLoginAllowed() {
    try {
      JSONObject settings = new JSONObject(getSettings());
      return settings.getBoolean("isLoginAllowed");
    } catch (JSONException e) {
    }
    return true;  // allow login by default if there was an exception
  }

  public void setLoginAllowed(boolean loginAllowed) {
    try {
      JSONObject settings = new JSONObject(getSettings());
      settings.put("isLoginAllowed", loginAllowed);
      this.setSettings(settings.toString());
    } catch (JSONException e) {
    }
  }

  public boolean isSendStatisticsToHub() {
    try {
      JSONObject settings = new JSONObject(getSettings());
      return settings.getBoolean("isSendStatisticsToHub");
    } catch (JSONException e) {
    }
    return false;  // don't send statistics by default if there was an exception
  }

  public void setSendStatisticsToHub(boolean doSendStatistics) {
    try {
      JSONObject settings = new JSONObject(getSettings());
      settings.put("isSendStatisticsToHub", doSendStatistics);
      this.setSettings(settings.toString());
    } catch (JSONException e) {
    }
  }
}
