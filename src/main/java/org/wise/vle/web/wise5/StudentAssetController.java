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
package org.wise.vle.web.wise5;

import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.node.ObjectNode;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.StandardMultipartHttpServletRequest;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.work.StudentAsset;
import org.wise.vle.web.AssetManager;

/**
 * REST endpoint for StudentAsset
 * 
 * @author Hiroki Terashima
 */
@Controller
public class StudentAssetController {

  @Autowired
  private VLEService vleService;

  @Autowired
  private RunService runService;

  @Autowired
  private Properties appProperties;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private UserService userService;

  @GetMapping("/student/asset/{runId}/{workgroupId}")
  @ResponseBody
  protected List<StudentAsset> getWorkgroupAssets(@PathVariable Long runId,
      @PathVariable Long workgroupId, Authentication auth)
      throws IOException, ObjectNotFoundException {
    User user = userService.retrieveUserByUsername(auth.getName());
    Run run = runService.retrieveById(runId);
    Workgroup workgroup = workgroupService.retrieveById(workgroupId);
    if (workgroupService.isUserInWorkgroupForRun(user, run, workgroup)) {
      return vleService.getWorkgroupAssets(workgroupId);
    }
    throw new AccessDeniedException("Access Denied");
  }

  @PostMapping("/student/asset/{runId}")
  @ResponseBody
  protected StudentAsset postStudentAsset(@PathVariable Integer runId,
      @RequestParam(value = "periodId", required = true) Integer periodId,
      @RequestParam(value = "workgroupId", required = true) Integer workgroupId,
      @RequestParam(value = "nodeId", required = false) String nodeId,
      @RequestParam(value = "componentId", required = false) String componentId,
      @RequestParam(value = "componentType", required = false) String componentType,
      @RequestParam(value = "clientSaveTime", required = true) String clientSaveTime,
      HttpServletRequest request) throws Exception {
    Run run = null;
    try {
      run = runService.retrieveById(new Long(runId));
    } catch (NumberFormatException e) {
      e.printStackTrace();
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }

    String dirName = run.getId() + "/" + workgroupId + "/unreferenced";
    String path = appProperties.getProperty("studentuploads_base_dir");
    Long studentMaxAssetSize = new Long(
        appProperties.getProperty("student_max_asset_size", "5242880"));
    Long studentMaxTotalAssetsSize = new Long(
        appProperties.getProperty("student_max_total_assets_size", "10485760"));
    String pathToCheckSize = path + "/" + dirName;
    StandardMultipartHttpServletRequest multiRequest = (StandardMultipartHttpServletRequest) request;
    Map<String, MultipartFile> fileMap = multiRequest.getFileMap();
    if (fileMap != null && fileMap.size() > 0) {
      Set<String> keySet = fileMap.keySet();
      Iterator<String> iter = keySet.iterator();
      while (iter.hasNext()) {
        String key = iter.next();
        MultipartFile file = fileMap.get(key);
        if (file.getSize() > studentMaxAssetSize) {
          throw new Exception("error handling uploaded asset: filesize exceeds max allowed");
        }
        String clientDeleteTime = null;
        Boolean result = AssetManager.uploadAssetWISE5(file, path, dirName, pathToCheckSize,
            studentMaxTotalAssetsSize);
        if (result) {
          Integer id = null;
          Boolean isReferenced = false;
          String fileName = file.getOriginalFilename();
          String filePath = "/" + dirName + "/" + fileName;
          Long fileSize = file.getSize();
          try {
            return vleService.saveStudentAsset(id, runId, periodId, workgroupId, nodeId,
                componentId, componentType, isReferenced, fileName, filePath, fileSize,
                clientSaveTime, clientDeleteTime);
          } catch (ObjectNotFoundException e) {
            e.printStackTrace();
            throw new Exception("error handling uploaded asset");
          }
        } else {
          throw new Exception("error: total asset size exceeds max allowed");
        }
      }
    }
    return null;
  }

  @DeleteMapping("/student/asset/{runId}/delete")
  @ResponseBody
  protected StudentAsset removeStudentAsset(@PathVariable Integer runId,
      @RequestParam(value = "studentAssetId", required = true) Integer studentAssetId,
      @RequestParam(value = "workgroupId", required = true) Integer workgroupId,
      @RequestParam(value = "clientDeleteTime", required = true) Long clientDeleteTime)
      throws Exception {
    Run run = runService.retrieveById(new Long(runId));
    StudentAsset studentAsset = vleService.getStudentAssetById(studentAssetId);
    String assetFileName = studentAsset.getFileName();
    String dirName = run.getId() + "/" + workgroupId + "/unreferenced";
    String path = appProperties.getProperty("studentuploads_base_dir");
    Boolean removeSuccess = AssetManager.removeAssetWISE5(path, dirName, assetFileName);
    if (removeSuccess) {
      return vleService.deleteStudentAsset(studentAssetId, clientDeleteTime);
    }
    throw new Exception("Error occurred");
  }

  @PostMapping("/student/asset/{runId}/copy")
  @ResponseBody
  protected StudentAsset copyStudentAsset(@PathVariable Integer runId,
      @RequestBody ObjectNode postedParams) throws Exception {
    Run run = runService.retrieveById(new Long(runId));
    Integer studentAssetId = postedParams.get("studentAssetId").asInt();
    Integer periodId = postedParams.get("periodId").asInt();
    Integer workgroupId = postedParams.get("workgroupId").asInt();
    String clientSaveTime = postedParams.get("clientSaveTime").asText();
    StudentAsset studentAsset = vleService.getStudentAssetById(studentAssetId);
    String assetFileName = studentAsset.getFileName();
    String unreferencedDirName = run.getId() + "/" + workgroupId + "/unreferenced";
    String referencedDirName = run.getId() + "/" + workgroupId + "/referenced";
    String copiedFileName = AssetManager.copyAssetForReferenceWISE5(unreferencedDirName,
        referencedDirName, assetFileName);
    if (copiedFileName != null) {
      Integer id = null;
      Boolean isReferenced = true;
      String fileName = copiedFileName;
      String filePath = "/" + referencedDirName + "/" + copiedFileName;
      Long fileSize = studentAsset.getFileSize();
      String nodeId = null;
      String componentId = null;
      String componentType = null;
      String clientDeleteTime = null;
      return vleService.saveStudentAsset(id, runId, periodId, workgroupId, nodeId, componentId,
          componentType, isReferenced, fileName, filePath, fileSize, clientSaveTime,
          clientDeleteTime);
    } else {
      throw new Exception("Error occurred");
    }
  }

  @GetMapping("/student/asset/{runId}/size")
  protected void getStudentAssetsSize(@PathVariable Long runId, HttpServletResponse response)
      throws IOException {
    User user = ControllerUtil.getSignedInUser();
    Run run = null;
    try {
      run = runService.retrieveById(runId);
    } catch (NumberFormatException e) {
      e.printStackTrace();
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
    List<Workgroup> workgroupListByRunAndUser = workgroupService.getWorkgroupListByRunAndUser(run,
        user);
    Workgroup workgroup = workgroupListByRunAndUser.get(0);
    Long workgroupId = workgroup.getId();
    String dirName = run.getId() + "/" + workgroupId + "/unreferenced"; // looks like
                                                                        // /studentuploads/[runId]/[workgroupId]/unreferenced
    String path = appProperties.getProperty("studentuploads_base_dir");
    String result = AssetManager.getSize(path, dirName);
    response.getWriter().write(result);
  }
}
