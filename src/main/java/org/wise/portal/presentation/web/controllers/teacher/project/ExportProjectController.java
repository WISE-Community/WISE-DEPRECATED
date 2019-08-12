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
package org.wise.portal.presentation.web.controllers.teacher.project;

import java.io.*;
import java.util.Collection;
import java.util.Properties;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.project.ProjectService;

/**
 * Exports Project as zip. Only Teachers and Administrators can export projects
 *
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/project/export/{projectId}")
public class ExportProjectController {

  @Autowired
  private ProjectService projectService;

  @Autowired
  private Properties appProperties;

  private String projectJSONFilename;

  /**
   * Handles request to export the specified project
   * @param projectId id of the project to export
   * @param response response stream for communicating with clients
   * @throws Exception when there was an error while exporting the project
   */
  @GetMapping
  protected void exportProject(@PathVariable String projectId, HttpServletResponse response)
      throws Exception {
    User signedInUser = ControllerUtil.getSignedInUser();
    Project project = projectService.getById(projectId);

    if (authorize(signedInUser, project)) {
    } else if (projectService.projectContainsTag(project, "public")) {
    } else {
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
          "You are not authorized to access this page");
      return;
    }

    String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
    String sep = "/";
    String rawProjectUrl = project.getModulePath();
    projectJSONFilename = rawProjectUrl.substring(rawProjectUrl.lastIndexOf(sep) + 1);
    String projectJSONFullPath = curriculumBaseDir + sep + rawProjectUrl;
    String foldername = rawProjectUrl.substring(1, rawProjectUrl.lastIndexOf(sep));
    String projectJSONDir = projectJSONFullPath.substring(0, projectJSONFullPath.lastIndexOf(sep));

    response.setContentType("application/zip");
    response.addHeader("Content-Disposition", "attachment;filename=\"" + foldername+".zip" + "\"");

    ProjectMetadata metadata = project.getMetadata();
    String metadataJSONString = metadata.toJSONString();

    if (project.getWiseVersion().equals(4)) {
      String metaFileName = projectJSONDir + sep + "wise4.project-meta.json";;
      PrintWriter metaOut = new PrintWriter(metaFileName);
      metaOut.println(metadataJSONString);
      metaOut.close();
    } else if (project.getWiseVersion().equals(5)) {
      metadata.setUri(projectService.getProjectURI(project));
      String projectFilePath = projectJSONDir + sep + "project.json";
      projectService.replaceMetadataInProjectJSONFile(projectFilePath, metadata);
    }

    ServletOutputStream outputStream = response.getOutputStream();
    ZipOutputStream out = new ZipOutputStream(new BufferedOutputStream(outputStream));

    File zipFolder = new File(projectJSONDir);

    // get path prefix so that the zip file does not contain the whole path
    // eg. if folder to be zipped is /home/lalit/test
    // the zip file when opened will have test folder and not home/lalit/test folder
    String zipFolderAbsolutePath = zipFolder.getAbsolutePath();
    int len = 0;
    if (zipFolderAbsolutePath.lastIndexOf("/") != -1) {
      len = zipFolderAbsolutePath.lastIndexOf("/");
    } else {
      len = zipFolderAbsolutePath.lastIndexOf("\\");
    }
    String baseName = zipFolderAbsolutePath.substring(0, len + 1);
    addFolderToZip(zipFolder, out, baseName);
    out.close();
  }

  /**
   * Return true iff the logged-in user is allowed to export the project
   * @param signedInUser user that is signed in
   * @param project can the signed in user export this project?
   * @return true/false
   */
  private boolean authorize(User signedInUser, Project project) {
    if (signedInUser != null) {
      Collection<? extends GrantedAuthority> authorities = signedInUser.getUserDetails().getAuthorities();
      for (GrantedAuthority authority : authorities) {
        if (authority.getAuthority().equals(UserDetailsService.ADMIN_ROLE)) {
          // if signed in user is an admin, (s)he can export all projects.
          return true;
        } else if (authority.getAuthority().equals(UserDetailsService.TEACHER_ROLE)) {
          //the signed in user is a teacher
          return this.projectService.canAuthorProject(project, signedInUser) ||
            this.projectService.canReadProject(project, signedInUser);
        }
      }
    }
    return false;
  }

  /**
   * Adds the folder to the resulting zip stream
   *
   * @param folder folder to add to the result
   * @param zip zip stream to add the folder to
   * @param baseName base name of the zip folder
   * @throws IOException
   */
  private void addFolderToZip(File folder, ZipOutputStream zip, String baseName)
      throws IOException {
    File[] files = folder.listFiles();
    for (File file : files) {
      if (file.isDirectory()) {
        String name = file.getAbsolutePath().substring(baseName.length());
        ZipEntry zipEntry = new ZipEntry(name + "/");
        zip.putNextEntry(zipEntry);
        zip.closeEntry();
        addFolderToZip(file, zip, baseName);
      } else {
        String name = file.getAbsolutePath().substring(baseName.length());
        String updatedFilename = null;
        if (name.endsWith("wise4.project.json") && !"wise4.project.json".equals(this.projectJSONFilename)) {
          // jump to the next iteration, since we don't need to add this file (wise4.project.json) to the zip.
          // we want to add the other *.project.json file (e.g. "GCC.project.json") as wise4.project.json to the zip.
          continue;
        }
        updatedFilename = updateFilename(name);
        ZipEntry zipEntry = new ZipEntry(updatedFilename);
        zip.putNextEntry(zipEntry);
        IOUtils.copy(new FileInputStream(file), zip);
        zip.closeEntry();
      }
    }
  }

  /**
   * Given old filename, returns new, updated filename corresponding with new standards
   * e.g. "Global Warming.project.json"->"wise4.project.json"
   * "Global Warming.project-min.json"->wise4.project-min.json"
   * @param oldFilename
   * @return newFilename
   */
  private static String updateFilename(String oldFilename) {
    int lastIndexOfSlash = oldFilename.lastIndexOf("/");
    if (lastIndexOfSlash == -1) {
      lastIndexOfSlash = oldFilename.lastIndexOf("\\");
    }
    String prepend = oldFilename.substring(0, lastIndexOfSlash + 1);
    if (oldFilename.endsWith(".project.json")) {
      return prepend + "wise4.project.json";
    } else if (oldFilename.endsWith(".project-min.json")) {
      return prepend + "wise4.project-min.json";
    }
    return oldFilename;
  }
}
