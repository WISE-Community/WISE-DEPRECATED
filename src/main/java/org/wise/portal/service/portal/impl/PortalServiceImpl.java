/**
 * Copyright (c) 2008-2019 Regents of the University of California (Regents).
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
package org.wise.portal.service.portal.impl;

import java.io.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.portal.PortalDao;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.service.portal.PortalService;

/**
 * @author Hiroki Terashima
 */
@Service
public class PortalServiceImpl implements PortalService {

  @Autowired
  private PortalDao<Portal> portalDao;

  private String defaultProjectMetadataSettings = "{\"fields\":[{\"name\":\"Title\",\"key\":\"title\",\"type\":\"input\"},{\"name\":\"Summary\",\"key\":\"summary\",\"type\":\"textarea\"},{\"name\":\"Language\",\"key\":\"language\",\"type\":\"radio\",\"choices\":[\"English\",\"Chinese (Simplified)\",\"Chinese (Traditional)\",\"Dutch\",\"German\",\"Greek\",\"Hebrew\",\"Japanese\",\"Korean\",\"Portuguese\",\"Spanish\",\"Thai\",\"Turkish\"]},{\"name\":\"Subject\",\"key\":\"subject\",\"type\":\"radio\",\"choices\":[\"Life Science\",\"Physical Science\",\"Earth Science\",\"General Science\",\"Biology\",\"Chemistry\",\"Physics\",\"Other\"]},{\"name\":\"Time Required to Complete Project\",\"key\":\"time\",\"type\":\"input\"},{\"name\":\"Supported Devices\",\"key\":\"supportedDevices\",\"type\":\"checkbox\",\"choices\":[\"PC\",\"Tablet\"]}],\"i18n\":{\"lifeScience\":{\"en\":\"Life Science\",\"ja\":\"ライフサイエンス\"},\"earthScience\":{\"en\":\"Earth Science\",\"ja\":\"地球科学\"},\"physicalScience\":{\"en\":\"Physical Science\",\"ja\":\"物理科学\",\"es\":\"ciencia física\"}}}";

  private String defaultProjectLibraryGroups = "[{\"name\":\"Integrated\",\"id\":\"integrated\",\"type\":\"group\",\"children\":[{\"name\":\"Grade6\",\"id\":\"grade6\",\"type\":\"group\",\"children\":[]},{\"name\":\"Grade7\",\"id\":\"grade7\",\"type\":\"group\",\"children\":[]},{\"name\":\"Grade8\",\"id\":\"grade8\",\"type\":\"group\",\"children\":[]}]},{\"name\":\"DisciplineSpecific\",\"id\":\"disciplineSpecific\",\"type\":\"group\",\"children\":[]},{\"name\":\"Grade7\",\"id\":\"grade7\",\"type\":\"group\",\"children\":[]},{\"name\":\"Grade8\",\"id\":\"grade8\",\"type\":\"group\",\"children\":[]}]";

  private String defaultAnnouncement = "{\"visible\":false,\"bannerText\":\"\",\"bannerButton\":\"\",\"title\":\"\",\"content\":\"\",\"buttons\":[]}";

  public Portal getById(Serializable id) throws ObjectNotFoundException {
    return portalDao.getById(id);
  }

  @Transactional()
  public void updatePortal(Portal portal) {
    portalDao.save(portal);
  }

  public String getWISEVersion() throws Exception {
    InputStream in = getClass().getResourceAsStream("/version.txt");
    BufferedReader streamReader = new BufferedReader(new InputStreamReader(in, "UTF-8"));
    StringBuilder responseStrBuilder = new StringBuilder();

    String inputStr;
    while ((inputStr = streamReader.readLine()) != null) {
      responseStrBuilder.append(inputStr);
    }
    return responseStrBuilder.toString();
  }

  public String getDefaultProjectMetadataSettings() {
    return defaultProjectMetadataSettings;
  }

  public String getDefaultProjectLibraryGroups() {
    return this.defaultProjectLibraryGroups;
  }

  public String getDefaultAnnouncement() {
    return this.defaultAnnouncement;
  }
}
