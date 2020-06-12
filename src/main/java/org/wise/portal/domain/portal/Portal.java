/**
 * Copyright (c) 2008-2018 Regents of the University of California (Regents).
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
package org.wise.portal.domain.portal;

import java.util.Properties;

import org.wise.portal.domain.Persistable;

/**
 * Portal domain object. Settings that should be saved in datastore and
 * configurable at runtime.
 *
 * @author Hiroki Terashima
 */
public interface Portal extends Persistable {

  /**
   * Should email be sent when an exception is thrown in the portal?
   *
   * @return the sendEmailOnException
   */
  boolean isSendMailOnException();

  /**
   * Set whether email should be sent when an exception is thrown
   * in the portal.
   *
   * @param sendEmailOnException the sendEmailOnException to set
   */
  void setSendMailOnException(boolean sendEmailOnException);

  /**
   * @return the sendmailProperties
   */
  Properties getSendmailProperties();

  /**
   * @param sendmailProperties the sendmailProperties to set
   */
  void setSendmailProperties(Properties sendmailProperties);

  /**
   * Returns this portal's name.
   *
   * @return
   */
  String getPortalName();

  /**
   * Returns this portal's name.
   *
   * @return
   */
  void setPortalName(String portalName);

  /**
   * @return the comments
   */
  String getComments();

  /**
   * @param comments the comments to set
   */
  void setComments(String comments);

  /**
   * @return the settings
   */
  String getSettings();

  /**
   * @param settings the settings to set
   */
  void setSettings(String settings);

  /**
   * can users log into this portal at this time?
   * @return
   */
  boolean isLoginAllowed();

  /**
   * can users log into this portal at this time?
   * @param loginAllowed
   */
  void setLoginAllowed(boolean loginAllowed);


  /**
   * Send WISE usage statistics to central hub?
   * @return
   */
  boolean isSendStatisticsToHub();

  /**
   * Send WISE usage statistics to central hub?
   * @param doSendStatistics
   */
  void setSendStatisticsToHub(boolean doSendStatistics);

  /**
   * @return the address
   */
  String getAddress();

  /**
   * @param address the address to set
   */
  void setAddress(String address);

  /**
   * Gets the Googlemap key used by this portal.
   * @return
   */
  String getGoogleMapKey();

  /**
   * Gets the Googlemap key used by this portal.
   * @return
   */
  void setGoogleMapKey(String googleMapKey);

  /**
   * Get the Run Survey Template string
   * @return run survey template string
   */
  String getRunSurveyTemplate();

  /**
   * Set the Run Survey Template string
   * @param runSurveyTemplate survey template string
   */
  void setRunSurveyTemplate(String runSurveyTemplate);

  /**
   * Get the project metadata settings string
   * @return project metadata settings string
   */
  String getProjectMetadataSettings();

  /**
   * Set the project metadata settings string
   * @param projectMetadataSettings  project metadata settings string
   */
  void setProjectMetadataSettings(String projectMetadataSettings);

  void setProjectLibraryGroups(String projectLibraryGroups);

  String getProjectLibraryGroups();

  void setAnnouncement(String announcement);

  String getAnnouncement();

  void setStructures(String structures);

  String getStructures();
}
