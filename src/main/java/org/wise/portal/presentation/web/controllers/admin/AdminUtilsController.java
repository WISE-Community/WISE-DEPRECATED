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
package org.wise.portal.presentation.web.controllers.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.project.ProjectService;

import javax.servlet.http.HttpServletResponse;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Admin utility functions like db migrations and batch scripts
 * @author Hiroki Terashima
 */
@Controller
public class AdminUtilsController {

  @Autowired
  private ProjectService projectService;

  /**
   * Merges project_metadata.* columns to projects.metadata field.
   * For migration from pre-5.5 to 5.5
   * @param response
   * @return page to display
   * @throws IOException
   */
  @RequestMapping("/admin/mergeProjectMetadata")
  public void mergetProjectMetadata(HttpServletResponse response) throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    List<Project> allProjects = projectService.getAdminProjectList();
    FileWriter writer = null;
    PrintWriter responseWriter = response.getWriter();
    int metadataUpdatedCounter = 0;
    for (Project project : allProjects) {
      ProjectMetadata projectMetadata = project.getMetadataObj();
      if (projectMetadata != null) {
        try {
          debugOutput(writer, responseWriter, "");
          debugOutput(writer, responseWriter, "Updating project: " + project.getId());
          debugOutput(writer, responseWriter, "Project Metadata: " +
              projectMetadata.toJSONString());
          project.setMetadata(projectMetadata);
          projectService.updateProject(project, signedInUser);
          metadataUpdatedCounter++;
        } catch (Exception e) {
          debugOutput(writer, responseWriter, "Exception was thrown: " + e);
        }
      }
    }
    debugOutput(writer, responseWriter, "");
    debugOutput(writer, responseWriter, "Done!!!");
    debugOutput(writer, responseWriter, "Metadata Updated Counter: " + metadataUpdatedCounter);
    responseWriter.close();
  }

  /**
   * Write a line to the debug output log file or response or both
   * @param writer the file to write to
   * @param responseWriter the HttpServletResponse to write to
   * @param line a string to write to the file
   */
  private void debugOutput(FileWriter writer, PrintWriter responseWriter, String line) {
    if (line != null) {
      System.out.println(line);
      if (writer != null) {
        try {
          writer.write(line + "\n");
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
      if (responseWriter != null) {
        responseWriter.write(line + "\n");
      }
    }
  }
}
