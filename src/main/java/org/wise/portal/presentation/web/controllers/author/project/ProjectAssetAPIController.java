package org.wise.portal.presentation.web.controllers.author.project;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.user.UserService;

/**
 * Project Asset API endpoint
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@Controller
@RequestMapping("/author/project/asset")
@Secured({ "ROLE_AUTHOR" })
public class ProjectAssetAPIController {

  @Autowired
  protected UserService userService;

  @Autowired
  protected ProjectService projectService;

  @Autowired
  protected Properties appProperties;

  @GetMapping("/{projectId}")
  @ResponseBody
  protected Map<String, Object> getProjectAssets(Authentication auth, @PathVariable Long projectId)
      throws ObjectNotFoundException, IOException {
    Project project = projectService.getById(projectId);
    User user = userService.retrieveUserByUsername(auth.getName());
    if (projectService.canAuthorProject(project, user)) {
      return projectService.getDirectoryInfo(new File(getProjectAssetsDirectoryPath(project)));
    }
    return null;
  }

  @PostMapping("/{projectId}")
  @ResponseBody
  protected Map<String, Object> saveProjectAsset(Authentication auth, @PathVariable Long projectId,
      @RequestParam List<MultipartFile> files) throws ObjectNotFoundException, IOException {
    Project project = projectService.getById(projectId);
    User user = userService.retrieveUserByUsername(auth.getName());
    if (projectService.canAuthorProject(project, user)) {
      Map<String, Object> result = new HashMap<String, Object>();
      result.put("success", new ArrayList<Object>());
      result.put("error", new ArrayList<Object>());
      String projectAssetsDirPath = getProjectAssetsDirectoryPath(project);
      File projectAssetsDir = new File(projectAssetsDirPath);
      for (MultipartFile file : files) {
        addAsset(project, projectAssetsDir, file, user, result);
      }
      result.put("assetDirectoryInfo", projectService.getDirectoryInfo(projectAssetsDir));
      return result;
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  private void addAsset(Project project, File projectAssetsDir, MultipartFile file, User user,
      Map<String, Object> result) throws IOException {
    long sizeOfAssetsDirectory = FileUtils.sizeOfDirectory(projectAssetsDir);
    Long projectMaxTotalAssetsSize = project.getMaxTotalAssetsSize();
    if (projectMaxTotalAssetsSize == null) {
      projectMaxTotalAssetsSize = new Long(
          appProperties.getProperty("project_max_total_assets_size", "15728640"));
    }
    HashMap<String, String> fileObject = new HashMap<String, String>();
    fileObject.put("filename", file.getOriginalFilename());
    if (!isUserAllowedToUpload(user, file)) {
      fileObject.put("message", "Upload file not allowed.");
      ((ArrayList<HashMap<String, String>>) result.get("error")).add(fileObject);
    } else if (sizeOfAssetsDirectory + file.getSize() > projectMaxTotalAssetsSize) {
      fileObject.put("message", "Exceeded project max asset size.\n"
          + "Please delete unused assets.\n\nContact WISE if your project needs more disk space.");
      ((ArrayList<HashMap<String, String>>) result.get("error")).add(fileObject);
    } else {
      Path path = Paths.get(projectAssetsDir.getPath(), file.getOriginalFilename());
      file.transferTo(path);
      ((ArrayList<HashMap<String, String>>) result.get("success")).add(fileObject);
    }
  }

  private boolean isUserAllowedToUpload(User user, MultipartFile file) {
    String allowedTypes = appProperties.getProperty("normalAuthorAllowedProjectAssetContentTypes");
    if (user.isTrustedAuthor()) {
      allowedTypes += ","
          + appProperties.getProperty("trustedAuthorAllowedProjectAssetContentTypes");
    }
    return allowedTypes.contains(file.getContentType());
  }

  @PostMapping("/{projectId}/delete")
  @ResponseBody
  protected Map<String, Object> deleteProjectAsset(Authentication auth,
      @PathVariable Long projectId, @RequestParam String assetFileName)
      throws ObjectNotFoundException {
    Project project = projectService.getById(projectId);
    User user = userService.retrieveUserByUsername(auth.getName());
    if (projectService.canAuthorProject(project, user)) {
      String projectAssetsDirPath = getProjectAssetsDirectoryPath(project);
      File asset = new File(projectAssetsDirPath, assetFileName);
      asset.delete();
      return projectService.getDirectoryInfo(new File(projectAssetsDirPath));
    } else {
      return null;
    }
  }

  private String getProjectAssetsDirectoryPath(Project project) {
    String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
    String rawProjectUrl = project.getModulePath();
    String projectURL = curriculumBaseDir + rawProjectUrl;
    String projectBaseDir = projectURL.substring(0, projectURL.indexOf("project.json"));
    return projectBaseDir + "/assets";
  }

  @GetMapping(value = "/{projectId}/download", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
  @ResponseBody
  protected FileSystemResource downloadProjectAsset(Authentication auth,
      HttpServletResponse response, @PathVariable Long projectId,
      @RequestParam String assetFileName) throws ObjectNotFoundException {
    Project project = projectService.getById(projectId);
    User user = userService.retrieveUserByUsername(auth.getName());
    if (projectService.canAuthorProject(project, user)) {
      response.setHeader("Content-Disposition", "attachment;filename=\"" + assetFileName + "\"");
      return new FileSystemResource(getProjectAssetsDirectoryPath(project) + "/" + assetFileName);
    }
    return null;
  }
}
