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
package org.wise.portal.presentation.web.controllers.admin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;

/**
 * Controller for configuring this WISE instance
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/admin/portal/manage")
public class ManagePortalController {

  @Autowired
  private PortalService portalService;

  @Autowired
  private ProjectService projectService;

  @RequestMapping(method = RequestMethod.GET)
  protected String showPortalSettings(ModelMap modelMap,
      @RequestParam(value = "portalId", defaultValue = "1") Integer portalId) throws Exception {
    Portal portal = portalService.getById(portalId);
    modelMap.put("portal", portal);
    modelMap.put("defaultAnnouncement", portalService.getDefaultAnnouncement());
    modelMap.put("defaultProjectMetadataSettings", portalService.getDefaultProjectMetadataSettings());
    modelMap.put("defaultProjectLibraryGroups", portalService.getDefaultProjectLibraryGroups());
    return "admin/portal/manage";
  }

  @RequestMapping(method = RequestMethod.POST)
  protected void savePortalChanges(
      ModelMap modelMap,
      @RequestParam(value = "portalId", defaultValue = "1") Integer portalId,
      @RequestParam(value = "attr") String attr,
      @RequestParam(value = "val") String val) throws Exception {
    Portal portal = portalService.getById(portalId);
    try {
      if (attr.equals("portalName")) {
        portal.setPortalName(val);
        portalService.updatePortal(portal);
        modelMap.put("msg", "success");
      } else if (attr.equals("isLoginAllowed")) {
        portal.setLoginAllowed(Boolean.valueOf(val));
        portalService.updatePortal(portal);
        modelMap.put("msg", "success");
      } else if (attr.equals("isSendStatisticsToHub")) {
        portal.setSendStatisticsToHub(Boolean.valueOf(val));
        portalService.updatePortal(portal);
        modelMap.put("msg", "success");
      } else if (attr.equals("runSurveyTemplate")) {
        portal.setRunSurveyTemplate(val);
        portalService.updatePortal(portal);
        modelMap.put("msg", "success");
      } else if (attr.equals("projectMetadataSettings")) {
        portal.setProjectMetadataSettings(val);
        portalService.updatePortal(portal);
        modelMap.put("msg", "success");
      } else if (attr.equals("projectLibraryGroups")) {
        portal.setProjectLibraryGroups(val);
        portalService.updatePortal(portal);
        addOfficialTagToProjectLibraryGroup(val);
        modelMap.put("msg", "success");
      } else if (attr.equals("announcement")) {
        portal.setAnnouncement(val);
        portalService.updatePortal(portal);
        modelMap.put("msg", "success");
      } else {
        modelMap.put("msg", "error: permission denied");
      }
    } catch (Exception e) {
      e.printStackTrace();
      modelMap.put("msg", "error");
    }
  }

  /**
   * For each project referenced in the JSON string, add the "official" tag.
   * @param projectLibraryGroup JSON string representing the entire project library group.
   *     See portalService.getDefaultProjectLibraryGroups() for sample JSON
   */
  public void addOfficialTagToProjectLibraryGroup(String projectLibraryGroup)
      throws JSONException {
    JSONArray groups = new JSONArray(projectLibraryGroup);
    for (int i = 0; i < groups.length(); i++) {
      JSONObject group = groups.getJSONObject(i);
      addOfficialTagToGroup(group);
    }
  }

  private void addOfficialTagToGroup(JSONObject group) throws JSONException {
    JSONArray projects = group.getJSONArray("children");
    for (int i = 0; i < projects.length(); i++) {
      JSONObject project = projects.getJSONObject(i);
      addOfficialTagToProject(project);
    }
  }

  private void addOfficialTagToProject(JSONObject project) throws JSONException {
    long projectId = project.getLong("id");
    projectService.addTagToProject("official", projectId);
  }
}
