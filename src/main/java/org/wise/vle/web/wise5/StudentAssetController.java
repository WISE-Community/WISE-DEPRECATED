/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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

import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.DefaultMultipartHttpServletRequest;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.work.StudentAsset;
import org.wise.vle.web.AssetManager;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

/**
 * Controller for handling GET and POST requests of WISE5 StudentAsset domain objects
 * @author Hiroki Terashima
 */
@Controller
public class StudentAssetController {

    @Autowired
    private VLEService vleService;

    @Autowired
    private RunService runService;

    @Autowired
    private Properties wiseProperties;

    @Autowired
    private WorkgroupService workgroupService;

    /**
     * Returns student asset information based on specified parameters
     */
    @RequestMapping(method = RequestMethod.GET, value = "/student/asset/{runId}")
    protected void getStudentAssets(
            @PathVariable Integer runId,
            @RequestParam(value = "id", required = false) Integer id,
            @RequestParam(value = "periodId", required = false) Integer periodId,
            @RequestParam(value = "workgroupId", required = false) Integer workgroupId,
            @RequestParam(value = "workgroups", required = false) String workgroups,
            @RequestParam(value = "nodeId", required = false) String nodeId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "componentType", required = false) String componentType,
            @RequestParam(value = "isReferenced", required = false) Boolean isReferenced,
            HttpServletResponse response)
            throws ServletException, IOException {

        Run run = null;
        try {
            run = runService.retrieveById(new Long(runId));
        } catch (NumberFormatException e) {
            e.printStackTrace();
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
        }

        //get the student uploads base directory path
        String studentUploadsBaseDir = wiseProperties.getProperty("studentuploads_base_dir");

        if (workgroups != null) {
            // this is a request from the teacher of the run or admin who wants to see the run's students' assets
            /* COMMENTED OUT FOR NOW. This block will work, but does not use the StudentAsset domain object.
            if (user.isAdmin() || runService.hasRunPermission(run, user, BasePermission.READ)) {  // verify that user is the owner of the run
                String[] workgroupIds = workgroups.split(":");
                JSONArray workgroupAssetLists = new JSONArray();
                for (int i = 0; i < workgroupIds.length; i++) {
                    String workgroupId = workgroupIds[i];
                    JSONObject workgroupAsset = new JSONObject();
                    try {
                        //get the directory name for the workgroup for this run
                        String dirName = run.getId() + "/" + workgroupId + "/unreferenced"; // looks like /studentuploads/[runId]/[workgroupId]/unreferenced

                        //get a list of file names in this workgroup's upload directory
                        JSONArray assetList = AssetManager.getAssetList(studentUploadsBaseDir, dirName);
                        workgroupAsset.put("workgroupId", workgroupId);
                        workgroupAsset.put("assets", assetList);
                        workgroupAssetLists.put(workgroupAsset);
                    } catch (NumberFormatException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                    } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                    }
                }
                response.getWriter().write(workgroupAssetLists.toString());
            }
                */
        } else if (workgroupId != null) {
            // this is a request from the student of the run who wants to see their assets
            try {
                List<StudentAsset> studentAssets = vleService.getStudentAssets(id, runId, periodId, workgroupId,
                        nodeId, componentId, componentType, isReferenced);
                JSONArray studentAssetList = new JSONArray();
                for (StudentAsset studentAsset : studentAssets) {
                    studentAssetList.put(studentAsset.toJSON());
                }
                response.getWriter().write(studentAssetList.toString());
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Saves POSTed file into logged-in user's asset folder in the filesystem and in the database
     */
    @RequestMapping(method = RequestMethod.POST, value = "/student/asset/{runId}")
    protected void postStudentAsset(
            @PathVariable Integer runId,
            @RequestParam(value = "periodId", required = true) Integer periodId,
            @RequestParam(value = "workgroupId", required = true) Integer workgroupId,
            @RequestParam(value = "nodeId", required = false) String nodeId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "componentType", required = false) String componentType,
            @RequestParam(value = "clientSaveTime", required = true) String clientSaveTime,
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        // get the run
        Run run = null;
        try {
            run = runService.retrieveById(new Long(runId));
        } catch (NumberFormatException e) {
            e.printStackTrace();
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
        }

        // get the directory name for the workgroup for this run
        String dirName = run.getId() + "/" + workgroupId + "/unreferenced";

        // get the student uploads base directory path
        String path = wiseProperties.getProperty("studentuploads_base_dir");
        Long studentMaxTotalAssetsSize = new Long(wiseProperties.getProperty("student_max_total_assets_size", "5242880"));
        String pathToCheckSize = path + "/" + dirName;

        DefaultMultipartHttpServletRequest multiRequest = (DefaultMultipartHttpServletRequest) request;
        Map<String, MultipartFile> fileMap = multiRequest.getFileMap();
        if (fileMap != null && fileMap.size() > 0) {
            Set<String> keySet = fileMap.keySet();
            Iterator<String> iter = keySet.iterator();
            while (iter.hasNext()) {
                String key = iter.next();
                MultipartFile file = fileMap.get(key);
                String clientDeleteTime = null;

                // upload the files
                Boolean result = AssetManager.uploadAssetWISE5(file, path, dirName, pathToCheckSize, studentMaxTotalAssetsSize);
                if (result) {
                    Integer id = null;
                    Boolean isReferenced = false;
                    String fileName = file.getOriginalFilename();
                    String filePath = "/" + dirName + "/" + fileName;
                    Long fileSize = file.getSize();

                    StudentAsset studentAsset = null;
                    try {
                        studentAsset = vleService.saveStudentAsset(
                                id,
                                runId,
                                periodId,
                                workgroupId,
                                nodeId,
                                componentId,
                                componentType,
                                isReferenced,
                                fileName,
                                filePath,
                                fileSize,
                                clientSaveTime,
                                clientDeleteTime);
                        response.getWriter().write(studentAsset.toJSON().toString());
                    } catch (ObjectNotFoundException e) {
                        e.printStackTrace();
                        response.getWriter().write("error");
                    }
                } else {
                    response.getWriter().write("error");
                }
            }
        }
    }

    /**
     * Removes specified asset from the filesystem and marks as deleted in the database
     */
    @RequestMapping(method = RequestMethod.POST, value = "/student/asset/{runId}/remove")
    protected void removeStudentAsset(
            @PathVariable Integer runId,
            @RequestParam(value = "studentAssetId", required = true) Integer studentAssetId,
            @RequestParam(value = "workgroupId", required = true) Integer workgroupId,
            @RequestParam(value = "clientDeleteTime", required = true) Long clientDeleteTime,
            HttpServletResponse response)
            throws ServletException, IOException {

        // the student is removing an asset
        User user = ControllerUtil.getSignedInUser();

        // get the run
        Run run = null;
        try {
            run = runService.retrieveById(new Long(runId));
        } catch (NumberFormatException e) {
            e.printStackTrace();
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
        }

        StudentAsset studentAsset = null;
        try {
            studentAsset = vleService.getStudentAssetById(studentAssetId);
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
        }
        String assetFileName = studentAsset.getFileName();

        // get the directory name for the workgroup for this run
        String dirName = run.getId() + "/" + workgroupId + "/unreferenced"; // looks like /studentuploads/[runId]/[workgroupId]/unreferenced

        // get the student uploads base directory path
        String path = wiseProperties.getProperty("studentuploads_base_dir");

        // remove the file from the student asset folder
        Boolean removeSuccess = AssetManager.removeAssetWISE5(path, dirName, assetFileName);

        if (removeSuccess) {
            studentAsset = vleService.deleteStudentAsset(studentAssetId, clientDeleteTime);
            response.getWriter().write(studentAsset.toJSON().toString());
        }
    }

    /**
     * Copies specified asset in the filesystem and in the database
     */
    @RequestMapping(method = RequestMethod.POST, value = "/student/asset/{runId}/copy")
    protected void copyStudentAsset(
            @PathVariable Integer runId,
            @RequestParam(value = "studentAssetId", required = true) Integer studentAssetId,
            @RequestParam(value = "periodId", required = true) Integer periodId,
            @RequestParam(value = "workgroupId", required = true) Integer workgroupId,
            @RequestParam(value = "nodeId", required = false) String nodeId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "componentType", required = false) String componentType,
            @RequestParam(value = "clientSaveTime", required = true) String clientSaveTime,
            HttpServletResponse response)
            throws ServletException, IOException {

        User user = ControllerUtil.getSignedInUser();

        // get the run
        Run run = null;
        try {
            run = runService.retrieveById(new Long(runId));
        } catch (NumberFormatException e) {
            e.printStackTrace();
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
        }

        StudentAsset studentAsset = null;
        try {
            studentAsset = vleService.getStudentAssetById(studentAssetId);
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
        }
        String assetFileName = studentAsset.getFileName();

        // looks like /studentuploads/[runId]/[workgroupId]/unreferenced
        String unreferencedDirName = run.getId() + "/" + workgroupId + "/unreferenced";

        // if we're copying student asset for reference, also pass along the referenced dir. looks like /studentuploads/[runId]/[workgroupId]/referenced
        String referencedDirName = run.getId() + "/" + workgroupId + "/referenced";

        String copiedFileName = AssetManager.copyAssetForReferenceWISE5(unreferencedDirName, referencedDirName, assetFileName);

        if (copiedFileName != null) {
            Integer id = null;
            Boolean isReferenced = true;
            String fileName = copiedFileName;
            String filePath = "/" + referencedDirName + "/" + copiedFileName;
            Long fileSize = studentAsset.getFileSize();
            String clientDeleteTime = null;

            StudentAsset copiedStudentAsset = null;
            try {
                copiedStudentAsset = vleService.saveStudentAsset(
                        id,
                        runId,
                        periodId,
                        workgroupId,
                        nodeId,
                        componentId,
                        componentType,
                        isReferenced,
                        fileName,
                        filePath,
                        fileSize,
                        clientSaveTime,
                        clientDeleteTime);
                response.getWriter().write(copiedStudentAsset.toJSON().toString());
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
                response.getWriter().write("error");
            }
        } else {
            response.getWriter().write("error");
        }
    }

    /**
     * Returns size of logged-in student's unreferenced directory
     */
    @RequestMapping(method = RequestMethod.GET, value = "/student/asset/{runId}/size")
    protected void getStudentAssetsSize(
            @PathVariable Long runId,
            HttpServletResponse response)
            throws ServletException, IOException {

        User user = ControllerUtil.getSignedInUser();

        Run run = null;
        try {
            run = runService.retrieveById(runId);
        } catch (NumberFormatException e) {
            e.printStackTrace();
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
        }

        // get the workgroup id
        List<Workgroup> workgroupListByOfferingAndUser = workgroupService.getWorkgroupListByOfferingAndUser(run, user);
        Workgroup workgroup = workgroupListByOfferingAndUser.get(0);
        Long workgroupId = workgroup.getId();

        // get the directory name for the workgroup for this run
        String dirName = run.getId() + "/" + workgroupId + "/unreferenced"; // looks like /studentuploads/[runId]/[workgroupId]/unreferenced

        // get the student uploads base directory path
        String path = wiseProperties.getProperty("studentuploads_base_dir");

        // get the disk space usage of the workgroup's upload directory
        String result = AssetManager.getSize(path, dirName);
        response.getWriter().write(result);
    }
}
