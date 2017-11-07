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
package org.wise.portal.presentation.web.controllers.teacher.management;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;

/**
 * Controller for WISE Project library pages (for anonymous users and teachers)
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
@Controller
public class LibraryController {

  // path to project thumb image relative to project folder
  private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";

  @Autowired
  private ProjectService projectService;

  @Autowired
  private PortalService portalService;

  @Autowired
  private RunService runService;

  @Autowired
  private Properties wiseProperties;

  /**
   * Handles request for teacher's project library, which includes both public projects
   *  and projects that the teacher owns, is shared with, and has bookmarked.
   */
  @RequestMapping(value = "/teacher/management/library.html", method = RequestMethod.GET)
  protected String handleGetTeacherProjectLibrary(ModelMap modelMap) throws Exception {

    User user = ControllerUtil.getSignedInUser();

    // get library projects
    List<Project> libraryProjectsList = this.projectService.getLibraryProjectList();

    // get user's owned projects
    List<Project> ownedProjectsList = this.projectService.getProjectList(user);

    // get user's shared projects
    List<Project> sharedProjectsList = this.projectService.getSharedProjectList(user);
    sharedProjectsList.removeAll(ownedProjectsList);

    // a set to hold the list of project ids in user's library
    Set<Long> projectIds = new HashSet<Long>();

    Set<String> tagNames = new HashSet<String>();
    tagNames.add("library");

    // set root project ids, remove duplicates
    List<Project> ownedRemove = new ArrayList<Project>();
    for (int i = 0; i < ownedProjectsList.size(); i++) {
      Project ownedProject = ownedProjectsList.get(i);
      ownedProject.setRootProjectId(this.projectService.identifyRootProjectId(ownedProject));

      // check if project is in WISE library. if yes, we want to remove it from owned project list
      if (ownedProject.hasTags(tagNames)) {
        ownedRemove.add(ownedProject);
      } else {
        projectIds.add((Long) ownedProject.getId());
      }
    }

    // if project is in WISE library, remove from owned projects list (avoid duplicates)
    ownedProjectsList.removeAll(ownedRemove);

    List<Project> sharedRemove = new ArrayList<Project>();
    for (int a = 0; a < sharedProjectsList.size(); a++) {
      Project sharedProject = sharedProjectsList.get(a);
      sharedProject.setRootProjectId(this.projectService.identifyRootProjectId(sharedProject));


      // check if project is in WISE library. if yes, we want to remove it from shared project list
      if (sharedProject.hasTags(tagNames)) {
        sharedRemove.add(sharedProject);
      } else {
        projectIds.add((Long)sharedProject.getId());
      }
    }
    // if project is in WISE library, remove from shared projects list (avoid duplicates)
    sharedProjectsList.removeAll(sharedRemove);

    for (int x = 0; x < libraryProjectsList.size(); x++) {
      Project libraryProject = libraryProjectsList.get(x);
      Long libraryProjectId = (Long)libraryProject.getId();
      projectIds.add(libraryProjectId);
      libraryProject.setRootProjectId(libraryProjectId);  // library project is a ROOT Project.
    }

    Map<Long,String> urlMap = new HashMap<Long,String>();
    Map<Long,String> projectThumbMap = new HashMap<Long,String>();  // maps projectId to url where its thumbnail can be found
    Map<Long,String> filenameMap = new HashMap<Long,String>();
    Map<Long,String> projectNameMap = new HashMap<Long,String>(); //a map to contain projectId to project name
    Map<Long,String> projectNameEscapedMap = new HashMap<Long,String>(); //a map to contain projectId to escaped project name
    Map<Long,Date> projectRunDateMap = new HashMap<Long,Date>(); //a map to contain projectId to run date
    Map<Long,Long> projectRunIdMap = new HashMap<Long,Long>(); //a map to contain projectId to run id

    String curriculumBaseWWW = this.wiseProperties.getProperty("curriculum_base_www");

    int totalActiveProjects = 0;
    int totalArchivedProjects = 0;

    ArrayList<Project> allProjects = new ArrayList<Project>(ownedProjectsList.size()+sharedProjectsList.size()+libraryProjectsList.size());
    allProjects.addAll(ownedProjectsList);
    allProjects.addAll(sharedProjectsList);
    allProjects.addAll(libraryProjectsList);
    for (Project p: allProjects) {
      if (p.isCurrent()) {
        if (p.isDeleted()) {
          // project has been marked as deleted, so increment archived count
          totalArchivedProjects++;
        } else {
          // project has not been marked as deleted, so increment active count
          totalActiveProjects++;
        }
        Long projectId = (Long) p.getId();

        //get the project name and put it into the map
        String projectName = p.getName();
        projectNameMap.put(projectId, projectName);

        List<Run> runList = this.runService.getProjectRuns(projectId);
        if (!runList.isEmpty()) {
          // add project and date to the maps of project runs
          // since a project can now only be run once, just use the first run in the list
          projectRunDateMap.put(projectId, runList.get(0).getStarttime());
          projectRunIdMap.put(projectId, (Long) runList.get(0).getId());
        }

        //replace ' with \' in the project name and put it into the map
        projectNameEscapedMap.put(projectId, projectName.replaceAll("\\'", "\\\\'"));

        String url = p.getModulePath();

        if (url != null && url != "") {
          /*
           * add the project url to the map
           * e.g.
           * /253/wise4.project.json
           */
          urlMap.put(projectId, url);

          int ndx = url.lastIndexOf("/");
          if (ndx != -1) {
            /*
             * add project thumb url to projectThumbMap. for now this is the same (/assets/project_thumb.png)
             * for all projects but this could be overwritten in the future
             * e.g.
             * /253/assets/projectThumb.png
             */
            projectThumbMap.put(projectId, curriculumBaseWWW + url.substring(0, ndx) + PROJECT_THUMB_PATH);

            /*
             * add the project file name to the map
             * e.g.
             * /wise4.project.json
             */
            filenameMap.put(projectId, url.substring(ndx, url.length()));
          }
        }
      }
    }

    // send in owned, shared, library, bookmarked projects, and list of project ids
    modelMap.put("bookmarkedProjectsList", this.projectService.getBookmarkerProjectList(user));
    modelMap.put("ownedProjectsList", ownedProjectsList);
    modelMap.put("sharedProjectsList", sharedProjectsList);
    modelMap.put("libraryProjectsList", libraryProjectsList);
    modelMap.put("projectIds", projectIds);
    modelMap.put("sharedRemove", sharedRemove);
    modelMap.put("ownedRemove", ownedRemove);
    modelMap.put("totalActiveProjects", totalActiveProjects);
    modelMap.put("totalArchivedProjects", totalArchivedProjects);

    modelMap.put("urlMap", urlMap);
    modelMap.put("projectThumbMap", projectThumbMap);
    modelMap.put("filenameMap", filenameMap);
    modelMap.put("projectNameMap", projectNameMap);
    modelMap.put("projectNameEscapedMap", projectNameEscapedMap);
    modelMap.put("projectRunDateMap", projectRunDateMap);
    modelMap.put("projectRunIdMap", projectRunIdMap);
    modelMap.put("user", user);
    try {
      Portal portal = portalService.getById(new Integer(1));
      String projectMetadataSettings = portal.getProjectMetadataSettings();
      modelMap.put("projectMetadataSettings", projectMetadataSettings);
    } catch (ObjectNotFoundException e) {
      // if this fails, get the default project metada settings from wiseProperties
      modelMap.put("projectMetadataSettings", wiseProperties.getProperty("defaultProjectMetadataSettings", ""));
    }
    return "teacher/management/library";
  }

  /**
   * Handles request for public project library
   */
  @RequestMapping(value = "/projectlibrary", method = RequestMethod.GET)
  protected String handleGETPublicProjectLibrary(ModelMap modelMap) throws Exception {

    List<Project> projectList = this.projectService.getLibraryProjectList();
    Map<Long, String> projectThumbMap = new TreeMap<Long, String>();  // maps projectId to url where its thumbnail can be found
    String curriculumBaseWWW = this.wiseProperties.getProperty("curriculum_base_www");

    List<Project> currentProjectList = new ArrayList<Project>();
    for (Project p : projectList) {
      if (p.isCurrent()) {
        currentProjectList.add(p);
        String url = p.getModulePath();

        if (url != null && url != "") {

          int ndx = url.lastIndexOf("/");
          if (ndx != -1) {
            /*
             * add project thumb url to projectThumbMap. for now this is the same (/assets/project_thumb.png)
             * for all projects but this could be overwritten in the future
             * e.g.
             * /253/assets/projectThumb.png
             */
            projectThumbMap.put((Long) p.getId(), curriculumBaseWWW + url.substring(0, ndx) + PROJECT_THUMB_PATH);
          }
        }
      }
    }

    modelMap.put("libraryProjectsList", currentProjectList);
    modelMap.put("projectThumbMap", projectThumbMap);
    return "projectlibrary";
  }
}
