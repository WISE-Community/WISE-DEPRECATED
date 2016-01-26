package org.wise.portal.presentation.web.controllers.author.project;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.revwalk.RevCommit;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.DefaultMultipartHttpServletRequest;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.project.ProjectService;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.Iterator;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

/**
 * Controller for authoring WISE5 projects
 * @author Hiroki Terashima
 */
@Controller
public class WISE5AuthorProjectController {

    @Autowired
    ProjectService projectService;

    @Autowired
    Properties wiseProperties;

    @RequestMapping(value = "/project/edit/{projectId}", method = RequestMethod.GET)
    protected String authorProject(
            @PathVariable Long projectId,
            ModelMap modelMap) {
        try {
            Project project = projectService.getById(projectId);
            User user = ControllerUtil.getSignedInUser();
            if (projectService.canAuthorProject(project, user)) {
                String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
                String authorConfigURL = wiseBaseURL + "/authorConfig/" + projectId;

                modelMap.put("configURL", authorConfigURL);
                return "author";
            }
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
        }
        return "/accessdenied";
    }

    /**
     * Save project and and commit changes
     * @param projectId id of project to save
     * @param commitMessage commit message, can be null
     * @param projectJSONString a valid-JSON string of the project
     * @param response
     */
    @RequestMapping(value = "/project/save/{projectId}", method = RequestMethod.POST)
    protected void saveProject(
            @PathVariable Long projectId,
            @RequestParam(value = "commitMessage", required = false) String commitMessage,
            @RequestParam(value = "projectJSONString", required = true) String projectJSONString,
            HttpServletResponse response
    ) {
        Project project;
        try {
            project = projectService.getById(projectId);
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
            return;
        }

        User user = ControllerUtil.getSignedInUser();
        if (!projectService.canAuthorProject(project, user)) {
            return;
        }

        String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
        String rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
        String fullProjectPath = curriculumBaseDir + rawProjectUrl;    // e.g. /path/to/project/project.json
        String fullProjectDir = fullProjectPath.substring(0, fullProjectPath.lastIndexOf("/"));   // e.g. /path/to/project/

        File projectFile = new File(fullProjectPath);
        try {
            if (!projectFile.exists()) {
                projectFile.createNewFile();
            }
            Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(projectFile), "UTF-8"));
            writer.write(projectJSONString.toString());
            writer.close();

            try {
                // now commit changes
                JGitUtils.commitAllChangesToCurriculumHistory(fullProjectDir, commitMessage);

                Iterable<RevCommit> commitHistory = JGitUtils.getCommitHistory(fullProjectDir);
                JSONArray commitHistoryJSONArray = new JSONArray();
                try {
                    if (commitHistory != null) {
                        for (RevCommit commit : commitHistory) {
                            JSONObject commitHistoryJSONObject = new JSONObject();
                            ObjectId commitId = commit.getId();
                            commitHistoryJSONObject.put("commitId", commitId);
                            String commitName = commit.getName();
                            commitHistoryJSONObject.put("commitName", commitName);
                            String commitMsg = commit.getFullMessage();
                            commitHistoryJSONObject.put("commitMessage", commitMsg);
                            long commitTime = commit.getCommitTime() * 1000l; // x1000 to make into milliseconds since epoch
                            commitHistoryJSONObject.put("commitTime", commitTime);
                            commitHistoryJSONArray.put(commitHistoryJSONObject);
                        }
                        response.getWriter().print(commitHistoryJSONArray);
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            } catch (GitAPIException e) {
                e.printStackTrace();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @RequestMapping(value = "/authorConfig/{projectId}", method = RequestMethod.GET)
    protected void getAuthorProjectConfig(
            HttpServletRequest request,
            HttpServletResponse response,
            @PathVariable Long projectId) throws IOException {
        //create a JSONObject to contain the config params
        JSONObject config = new JSONObject();
        Project project;
        try {
            project = projectService.getById(projectId);
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
            return;
        }

        User user = ControllerUtil.getSignedInUser();
        if (!projectService.canAuthorProject(project, user)) {
            return;
        }

        try {
            String contextPath = request.getContextPath(); //get the context path e.g. /wise
            String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
            config.put("projectId", projectId);
            String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
            String rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
            String projectURL = curriculumBaseWWW + rawProjectUrl;
            String projectBaseURL = projectURL.substring(0, projectURL.indexOf("project.json"));
            String projectAssetURL = wiseBaseURL + "/project/asset/" + projectId;
            String previewProjectURL = wiseBaseURL + "/project/" + projectId;
            String saveProjectURL = wiseBaseURL + "/project/save/" + projectId;
            String commitProjectURL = wiseBaseURL + "/project/commit/" + projectId;
            Long projectAssetTotalSizeMax = project.getMaxTotalAssetsSize();
            if (projectAssetTotalSizeMax == null) {
                //get the default max project size
                projectAssetTotalSizeMax = new Long(wiseProperties.getProperty("project_max_total_assets_size", "15728640"));
            }

            config.put("contextPath", contextPath);
            config.put("mainHomePageURL", wiseBaseURL);
            config.put("renewSessionURL", wiseBaseURL + "/session/renew");
            config.put("sessionLogOutURL", wiseBaseURL + "/logout");
            config.put("projectURL", projectURL);
            config.put("projectAssetTotalSizeMax", projectAssetTotalSizeMax);
            config.put("projectAssetURL", projectAssetURL);
            config.put("projectBaseURL", projectBaseURL);
            config.put("previewProjectURL", previewProjectURL);
            config.put("saveProjectURL", saveProjectURL);
            config.put("commitProjectURL", commitProjectURL);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        PrintWriter writer = response.getWriter();
        writer.write(config.toString());
        writer.close();
    }

    /**
     * Handle request to retrieve commit history for the specified projectId.
     * Optional parameter specifies how many commits to retrieve
     * @param projectId
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/project/commit/{projectId}", method = RequestMethod.GET)
    protected void getCommitHistory(
            @PathVariable Long projectId,
            @RequestParam(required = false) Integer numCommits,
            @RequestParam(required = false) String fileName,
            HttpServletResponse response
    ) throws Exception {
        Project project;
        try {
            project = projectService.getById(projectId);
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
            return;
        }

        User user = ControllerUtil.getSignedInUser();
        if (!projectService.canAuthorProject(project, user)) {
            return;
        }

        String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
        String rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
        String fullProjectPath = curriculumBaseDir + rawProjectUrl;    // e.g. /path/to/project/project.json
        String fullProjectDir = fullProjectPath.substring(0, fullProjectPath.lastIndexOf("/"));   // e.g. /path/to/project/

        Iterable<RevCommit> commitHistory = JGitUtils.getCommitHistory(fullProjectDir);
        JSONArray commitHistoryJSONArray = new JSONArray();

        if (commitHistory != null) {
            for (RevCommit commit : commitHistory) {
                JSONObject commitHistoryJSONObject = new JSONObject();
                ObjectId commitId = commit.getId();
                commitHistoryJSONObject.put("commitId", commitId);
                String commitName = commit.getName();
                commitHistoryJSONObject.put("commitName", commitName);
                String commitMessage = commit.getFullMessage();
                commitHistoryJSONObject.put("commitMessage", commitMessage);
                long commitTime = commit.getCommitTime() * 1000l; // x1000 to make into milliseconds since epoch
                commitHistoryJSONObject.put("commitTime", commitTime);
                commitHistoryJSONArray.put(commitHistoryJSONObject);
            }
        }
        response.getWriter().print(commitHistoryJSONArray);
    }

    /**
     * Returns the absolute path to the specified project's assets directory
     */
    private String getProjectAssetsDirectoryPath(Project project) {
        String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
        String rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
        String projectURL = curriculumBaseDir + rawProjectUrl;
        String projectBaseDir = projectURL.substring(0, projectURL.indexOf("project.json"));
        return projectBaseDir + "/assets";
    }

    /**
     * Prints project assets in output stream.
     */
    @RequestMapping(value = "/project/asset/{projectId}", method = RequestMethod.GET)
    protected void getProjectAssets(
            HttpServletResponse response,
            @PathVariable Long projectId) {
        try {
            Project project = projectService.getById(projectId);
            User user = ControllerUtil.getSignedInUser();
            if (projectService.canAuthorProject(project, user)) {
                String projectAssetsPath = getProjectAssetsDirectoryPath(project);
                File projectAssetsDirectory = new File(projectAssetsPath);
                JSONObject projectAssetsJSONObject = getDirectoryJSONObject(projectAssetsDirectory);
                PrintWriter writer = response.getWriter();
                writer.write(projectAssetsJSONObject.toString());
                writer.close();
            }
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
        } catch (JSONException je) {
            je.printStackTrace();
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }
    }

    /**
     * Saves POSTed file into the project's asset folder
     */
    @RequestMapping(method = RequestMethod.POST, value = "/project/asset/{projectId}")
    protected void saveProjectAsset(
            @PathVariable Long projectId,
            HttpServletRequest request,
            String assetFileName,
            HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Project project = projectService.getById(projectId);
            User user = ControllerUtil.getSignedInUser();
            if (projectService.canAuthorProject(project, user)) {
                String projectAssetsPath = getProjectAssetsDirectoryPath(project);
                File projectAssetsDir = new File(projectAssetsPath);

                if (assetFileName != null) {
                    // user wants to delete an existing asset
                    File asset = new File(projectAssetsDir, assetFileName);
                    if (asset.exists()) {
                        asset.delete();
                    }
                } else {
                    // user wants to add a new asset

                    DefaultMultipartHttpServletRequest multiRequest = (DefaultMultipartHttpServletRequest) request;
                    Map<String, MultipartFile> fileMap = multiRequest.getFileMap();
                    if (fileMap != null && fileMap.size() > 0) {
                        Set<String> keySet = fileMap.keySet();
                        Iterator<String> iter = keySet.iterator();
                        while (iter.hasNext()) {
                            String key = iter.next();
                            MultipartFile file = fileMap.get(key);

                            // TODO add file size checking
                            String filename = file.getOriginalFilename();
                            File asset = new File(projectAssetsDir, filename);
                            if (!asset.exists()) {
                                asset.createNewFile();
                            }
                            byte[] fileContent = file.getBytes();
                            FileOutputStream fos = new FileOutputStream(asset);
                            fos.write(fileContent);
                            fos.flush();
                            fos.close();
                        }
                    }
                }

                File projectAssetsDirectory = new File(projectAssetsPath);
                JSONObject projectAssetsJSONObject = getDirectoryJSONObject(projectAssetsDirectory);
                PrintWriter writer = response.getWriter();
                writer.write(projectAssetsJSONObject.toString());
                writer.close();
            }
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
        } catch (JSONException je) {
            je.printStackTrace();
        }
    }

    /**
     * Returns a JSONObject containing information about the specified directory.
     * This includes totalFileSize and files in the directory
     * @throws JSONException
     */
    private JSONObject getDirectoryJSONObject(File directory) throws JSONException {

        JSONObject directoryJSONObject = new JSONObject();
        JSONArray projectAssetsJSONArray = new JSONArray();
        long totalDirectorySize = 0l;
        File[] filesInProjectAssetsDir = getFilesInDirectory(directory);
        if (filesInProjectAssetsDir != null) {
            for (int v = 0; v < filesInProjectAssetsDir.length; v++) {
                try {
                    File file = filesInProjectAssetsDir[v];
                    String fileName = file.getName();
                    JSONObject fileObject = new JSONObject();
                    fileObject.put("fileName", fileName);
                    long fileSize = file.length();
                    fileObject.put("fileSize", fileSize);
                    totalDirectorySize += fileSize;
                    projectAssetsJSONArray.put(fileObject);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        directoryJSONObject.put("totalFileSize", totalDirectorySize);
        directoryJSONObject.put("files", projectAssetsJSONArray);
        return directoryJSONObject;
    }

    /**
     * Get the file names in the directory. Permission checks should be done before calling this method.
     * @param directory the directory containing the files
     * @return the JSONArray containing information of files in the specified directory
     */
    public static File[] getFilesInDirectory(File directory) {
        if (directory.exists() && directory.isDirectory()) {
            return directory.listFiles();
        }
        return new File[0];
    }
}