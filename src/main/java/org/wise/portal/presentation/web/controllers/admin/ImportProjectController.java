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
package org.wise.portal.presentation.web.controllers.admin;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Enumeration;
import java.util.Properties;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.ProjectUpload;
import org.wise.portal.domain.project.impl.ProjectMetadataImpl;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.project.impl.ProjectType;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.project.ProjectService;

/**
 * Admin tool for uploading a zipped WISE project.
 * Unzips to curriculum_base_dir and registers the project (ie creates project in DB).
 *
 * @author Hiroki Terashima
 */
@Controller
public class ImportProjectController {

  @Autowired
  private ProjectService projectService;

  @Autowired
  private Properties appProperties;

  private String getWISEProjectsURL = "http://wise5.org/wiseup/getProject.php";

  @PostMapping("/admin/project/importFromHub")
  protected String importFromHub(
      @RequestParam(value = "importableProjectId", required = true) String importableProjectId,
      ModelMap modelMap) throws Exception {
    String getImportableProjectURL = getWISEProjectsURL + "?id=" + importableProjectId;
    try {
      URL url = new URL(getImportableProjectURL);
      URLConnection conn = url.openConnection();
      InputStream in = conn.getInputStream();
      URL downloadFileUrl = conn.getURL();
      String downloadFileUrlString = downloadFileUrl.toString();
      String zipFilename =
          downloadFileUrlString.substring(downloadFileUrlString.lastIndexOf("/") + 1);

      byte[] fileBytes = IOUtils.toByteArray(in);
      String msg = "Import project complete!";
      Project project = importProject(zipFilename, fileBytes);
      if (project == null) {
        System.err.println("Error occured during project import.");
        msg = "Error occured during project import. Check the log for more information.";
      }
      modelMap.put("msg", msg);
      modelMap.put("newProject", project);
      return "admin/project/import";
    } catch (IOException e) {
      System.err.println("Error occured during project import.");
      e.printStackTrace();
    }
    return "admin/project/import";
  }

  @PostMapping("/admin/project/import")
  protected String onSubmit(@ModelAttribute("projectZipFile") ProjectUpload projectUpload,
      ModelMap modelMap) throws Exception {
    // TODO: check zip contents for maliciousness. For now, it's only accessible to admin.
    MultipartFile file = projectUpload.getFile();
    String zipFilename = file.getOriginalFilename();
    byte[] fileBytes = file.getBytes();
    String msg = "Import project complete!";
    Project project = importProject(zipFilename, fileBytes);
    if (project == null) {
      System.err.println("Error occured during project import.");
      msg = "Error occured during project import. Check the log for more information.";
    }
    modelMap.put("msg", msg);
    modelMap.put("newProject", project);
    return "admin/project/import";
  }

  private Project importProject(String zipFilename, byte[] fileBytes) throws Exception {
    String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
    if (!new File(curriculumBaseDir).exists()) {
      throw new Exception("Curriculum upload directory \"" +
          curriculumBaseDir + "\" does not exist. Please verify the path you specified for curriculum_base_dir in application.properties.");
    }

    String sep = "/";
    String filename = zipFilename.substring(0, zipFilename.indexOf(".zip"));
    long newProjectId = projectService.getNextAvailableProjectId();
    String newFilename = String.valueOf(newProjectId);
    String newFileFullPath = curriculumBaseDir + sep + newFilename + ".zip";

    File uploadedFile = new File(newFileFullPath);
    uploadedFile.createNewFile();
    FileCopyUtils.copy(fileBytes, uploadedFile);
    String newFileFullDir = curriculumBaseDir + sep + newFilename;
    File newFileFullDirFile = new File(newFileFullDir);
    newFileFullDirFile.mkdir();
    Integer projectVersion = 0;
    try {
      ZipFile zipFile = new ZipFile(newFileFullPath);
      Enumeration entries = zipFile.entries();
      int i = 0;
      while (entries.hasMoreElements()) {
        ZipEntry entry = (ZipEntry) entries.nextElement();
        if (entry.getName().startsWith("__MACOSX") || entry.getName().contains("license.txt")) {
          continue;
        }

        if (entry.isDirectory()) {
          // first check to see if the user has changed the zip file name and therefore the zipfile name
          // is no longer the same as the name of the first folder in the top-level of the zip file.
          // if this is the case, import will fail, so throw an error.
          if (i == 0) {
            if (!entry.getName().startsWith(filename)) {
              throw new Exception("Zip file name \"" + entry.getName() + "\" does not match folder name \"" + filename + "\". Do not change zip filename");
            }
            i++;
          }

          System.out.println("Extracting directory: " + entry.getName());
          (new File(entry.getName().replace(filename, newFileFullDir))).mkdir();
          continue;
        }

        if ("wise4.project.json".equals(entry.getName().substring(entry.getName().lastIndexOf(sep) + 1))) {
          projectVersion = 4;
        } else if ("project.json".equals(entry.getName().substring(entry.getName().lastIndexOf(sep) + 1))) {
          projectVersion = 5;
        }

        System.out.println("Extracting file: " + entry.getName() );
        copyInputStream(zipFile.getInputStream(entry),
            new BufferedOutputStream(
            new FileOutputStream(entry.getName().replaceFirst(filename, newFileFullDir))));
      }
      zipFile.close();
    } catch (IOException ioe) {
      System.err.println("Unhandled exception during project import. Project was not properly imported.");
      ioe.printStackTrace();
      throw ioe;
    }

    uploadedFile.delete();
    String path = "";
    String name = "";

    try {
      if (projectVersion == 4) {
        path = sep +  newFilename + sep + "wise4.project.json";
        String projectJSONFilePath = newFileFullDir + sep + "wise4.project.json";
        String projectJSONStr = FileUtils.readFileToString(new File(projectJSONFilePath));
        JSONObject projectJSONObj = new JSONObject(projectJSONStr);
        name = projectJSONObj.getString("title");
      } else if (projectVersion == 5) {
        path = sep +  newFilename + sep + "project.json";
        String projectJSONFilePath = newFileFullDir + sep + "project.json";
        String projectJSONStr = FileUtils.readFileToString(new File(projectJSONFilePath));
        JSONObject projectJSONObj = new JSONObject(projectJSONStr);
        name = projectJSONObj.getJSONObject("metadata").getString("title");
      } else if (projectVersion == 0) {
        System.err.println("Could not determine project version during project import.");
        return null;
      }
    } catch (Exception e) {
      name = "Undefined";
    }

    User signedInUser = ControllerUtil.getSignedInUser();
    ProjectParameters pParams = new ProjectParameters();
    pParams.setProjectId(newProjectId);
    pParams.setModulePath(path);
    pParams.setOwner(signedInUser);
    pParams.setProjectname(name);
    pParams.setProjectType(ProjectType.LD);
    pParams.setWiseVersion(projectVersion);
    pParams.setIsImport(true);

    ProjectMetadata metadata = null;
    try {
      metadata = new ProjectMetadataImpl();
      if (projectVersion == 4) {
        String projectMetadataFilePath = newFileFullDir + sep + "wise4.project-meta.json";
        String projectMetadataStr = FileUtils.readFileToString(new File(projectMetadataFilePath));
        JSONObject metadataJSONObj = new JSONObject(projectMetadataStr);
        metadata.populateFromJSON(metadataJSONObj);
      } else if (projectVersion == 5) {
        String projectFilePath = newFileFullDir + sep + "project.json";
        String projectStr = FileUtils.readFileToString(new File(projectFilePath));
        JSONObject projectJSONObj = new JSONObject(projectStr);
        JSONObject metadataJSONObj = projectJSONObj.getJSONObject("metadata");
        metadata.populateFromJSON(metadataJSONObj);
      }
    } catch (Exception e) {
      System.err.println("Error parsing metadata while import project.");
      e.printStackTrace();
      metadata = null;
    }

    // If metadata is null at this point, either wise4.project-meta.json was not
    // found in the zip file, or there was an error parsing.
    // Set a new fresh metadata object
    if (metadata == null) {
      metadata = new ProjectMetadataImpl();
      metadata.setTitle(name);
    }
    pParams.setMetadata(metadata);
    return projectService.createProject(pParams);
  }

  @GetMapping("/admin/project/getImportableProjects")
  public void getImportableProjects(HttpServletResponse response) {
    try {
      URL url = new URL(getWISEProjectsURL);
      URLConnection conn = url.openConnection();
      InputStream in = conn.getInputStream();
      String projectsString = IOUtils.toString(in, "UTF-8");
      response.getWriter().print(projectsString);
      in.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  @GetMapping("/admin/project/import")
  public void initializeForm(ModelMap modelMap) {
    modelMap.put("projectZipFile", new ProjectUpload());
  }

  public static final void copyInputStream(InputStream in, OutputStream out) throws IOException {
    byte[] buffer = new byte[1024];
    int len;
    while ((len = in.read(buffer)) >= 0) {
      out.write(buffer, 0, len);
    }
    in.close();
    out.close();
  }
}
