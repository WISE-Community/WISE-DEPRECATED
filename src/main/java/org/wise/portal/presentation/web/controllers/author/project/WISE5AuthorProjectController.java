package org.wise.portal.presentation.web.controllers.author.project;

import org.apache.commons.io.FileUtils;
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
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.module.impl.ModuleParameters;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.impl.ProjectMetadataImpl;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.project.impl.ProjectType;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.module.CurnitService;
import org.wise.portal.service.project.ProjectService;
import org.wise.vle.utils.FileManager;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.*;

/**
 * Controller for authoring WISE5 projects
 * @author Hiroki Terashima
 */
@Controller
public class WISE5AuthorProjectController {

    @Autowired
    ProjectService projectService;

    @Autowired
    CurnitService curnitService;

    @Autowired
    Properties wiseProperties;

    /**
     * Handle user's request to launch the Authoring Tool without specified project
     * @return
     */
    @RequestMapping(value = "/author", method = RequestMethod.GET)
    protected String authorProject(
            ModelMap modelMap) {
        String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
        String authorConfigURL = wiseBaseURL + "/authorConfig";

        modelMap.put("configURL", authorConfigURL);
        return "author";
    }

    /**
     * Handle user's request to register a new WISE5 project.
     * Registers the new project in DB and returns the new project ID
     * If the parentProjectId is specified, the user is requesting to copy that project
     * @return
     */
    @RequestMapping(value = "/project/new", method = RequestMethod.POST)
    protected void registerNewProject(
            @RequestParam(value = "parentProjectId", required = false) String parentProjectId,
            @RequestParam(value = "projectJSONString", required = true) String projectJSONString,
            @RequestParam(value = "commitMessage", required = true) String commitMessage,
            HttpServletResponse response) {
        User user = ControllerUtil.getSignedInUser();
        if (!this.hasAuthorPermissions(user)) {
            return;
        }

        String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
        File curriculumBaseDirFile = new File(curriculumBaseDir);

        // create new directory for this project (returns absolute path)
        File newProjectPath = FileManager.createNewprojectPath(curriculumBaseDirFile);

        // also make the assets directory
        File newProjectAssetsDir = new File(newProjectPath, "assets");
        newProjectAssetsDir.mkdir();

        try {
            JSONObject projectJSONObject = new JSONObject(projectJSONString);
            // get the name of the project from the project JSON
            String projectName = projectJSONObject.getJSONObject("metadata").getString("title");

            String projectJSONFilename = "project.json";

            // File where we'll be writing the new project JSON
            File newProjectJSONFile = new File(newProjectPath, projectJSONFilename);

            if (!newProjectJSONFile.exists()) {
                newProjectJSONFile.createNewFile();
            }
            // write the project JSON to file system
            Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(newProjectJSONFile), "UTF-8"));
            writer.write(projectJSONString.toString());
            writer.close();

            String projectFolderName = newProjectJSONFile.getParentFile().getName();

            // get the relative path to the project from curriculumBaseDir (e.g. /510/project.json)
            String projectPathRelativeToCurriculumBaseDir = "/" + projectFolderName + "/" + projectJSONFilename;

            ModuleParameters mParams = new ModuleParameters();
            mParams.setUrl(projectPathRelativeToCurriculumBaseDir);
            Curnit curnit = curnitService.createCurnit(mParams);

            ProjectParameters pParams = new ProjectParameters();
            pParams.setCurnitId(curnit.getId());
            pParams.setOwner(user);
            pParams.setProjectname(projectName);
            pParams.setProjectType(ProjectType.LD);
            pParams.setWiseVersion(new Integer(5));
            if (parentProjectId != null) {
                Project parentProject = projectService.getById(parentProjectId);
                if (parentProject != null) {
                    pParams.setParentProjectId(Long.valueOf(parentProjectId));
                    // get the project's metadata from the parent
                    ProjectMetadata parentProjectMetadata = parentProject.getMetadata();
                    if (parentProjectMetadata != null) {
                        // copy into new metadata object
                        ProjectMetadata newProjectMetadata = new ProjectMetadataImpl(parentProjectMetadata.toJSONString());
                        pParams.setMetadata(newProjectMetadata);
                    }
                }
            } else {
                // if this is new original project, set a new fresh metadata object
                ProjectMetadata metadata = new ProjectMetadataImpl();
                metadata.setTitle(projectName);
                pParams.setMetadata(metadata);
            }

            Project project = projectService.createProject(pParams);
            response.getWriter().write(project.getId().toString());

            try {
                // now commit changes
                JGitUtils.commitAllChangesToCurriculumHistory(newProjectPath.getAbsolutePath(), commitMessage);

                Iterable<RevCommit> commitHistory = JGitUtils.getCommitHistory(newProjectPath.getAbsolutePath());
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
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            } catch (GitAPIException e) {
                e.printStackTrace();
            }
        } catch(IOException e){
            e.printStackTrace();
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
        } catch (JSONException e) {
            e.printStackTrace();
        }
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
            HttpServletResponse response) {
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

    /**
     * Handles request to get a config object for authoring tool without any specific project
     */
    @RequestMapping(value = "/authorConfig", method = RequestMethod.GET)
    protected void getAuthorProjectConfigChooser(
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        JSONObject config = getDefaultAuthoringConfigJsonObject(request);

        PrintWriter writer = response.getWriter();
        writer.write(config.toString());
        writer.close();
    }

    /**
     * Handles request to get a config object for a specific project
     */
    @RequestMapping(value = "/authorConfig/{projectId}", method = RequestMethod.GET)
    protected void getAuthorProjectConfig(
            HttpServletRequest request,
            HttpServletResponse response,
            @PathVariable Long projectId) throws IOException {
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

        JSONObject config = getDefaultAuthoringConfigJsonObject(request);
        try {
            String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
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
                // get the default max project size
                projectAssetTotalSizeMax = new Long(wiseProperties.getProperty("project_max_total_assets_size", "15728640"));
            }
            config.put("projectId", projectId);
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
     * Creates and returns a default Authoring config object that is the same for all projects
     */
    private JSONObject getDefaultAuthoringConfigJsonObject(HttpServletRequest request) {
        // create a JSONObject to contain the config params
        JSONObject config = new JSONObject();
        User user = ControllerUtil.getSignedInUser();
        try {
            String contextPath = request.getContextPath(); //get the context path e.g. /wise
            String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
            config.put("contextPath", contextPath);
            config.put("mainHomePageURL", wiseBaseURL);
            config.put("renewSessionURL", wiseBaseURL + "/session/renew");
            config.put("sessionLogOutURL", wiseBaseURL + "/logout");
            config.put("registerNewProjectURL", wiseBaseURL + "/project/new");
            config.put("wiseBaseURL", wiseBaseURL);

            // get a list of projects this user owns
            List<Project> allProjectsOwnedByUser = projectService.getProjectList(user);
            List<JSONObject> wise5ProjectsOwnedByUser = new ArrayList<JSONObject>();
            for (Project project : allProjectsOwnedByUser) {
                if (new Integer(5).equals(project.getWiseVersion())) {
                    JSONObject projectJSONObject = new JSONObject();
                    projectJSONObject.put("id", project.getId());
                    projectJSONObject.put("name", project.getName());
                    wise5ProjectsOwnedByUser.add(projectJSONObject);
                }
            }
            config.put("projects", wise5ProjectsOwnedByUser);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return config;
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
                    Long projectMaxTotalAssetsSize = project.getMaxTotalAssetsSize();
                    if (projectMaxTotalAssetsSize == null) {
                        // get the default max project size
                        projectMaxTotalAssetsSize = new Long(wiseProperties.getProperty("project_max_total_assets_size", "15728640"));
                    }
                    // get the size of the assets directory
                    long sizeOfAssetsDirectory = FileUtils.sizeOfDirectory(projectAssetsDir);

                    DefaultMultipartHttpServletRequest multiRequest = (DefaultMultipartHttpServletRequest) request;
                    Map<String, MultipartFile> fileMap = multiRequest.getFileMap();
                    if (fileMap != null && fileMap.size() > 0) {
                        Set<String> keySet = fileMap.keySet();
                        Iterator<String> iter = keySet.iterator();
                        while (iter.hasNext()) {
                            String key = iter.next();
                            MultipartFile file = fileMap.get(key);

                            if (sizeOfAssetsDirectory + file.getSize() > projectMaxTotalAssetsSize) {
                                // Adding this asset will exceed the maximum allowed for the project, so don't add it
                                // Show a message to the user
                                PrintWriter writer = response.getWriter();
                                writer.write("Error: Exceeded project max asset size.\nPlease delete unused assets.\n\nContact WISE if your project needs more disk space.");
                                writer.close();
                                return;
                            } else {
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

    /**
     * Returns <code>boolean</code> true iff the given <code>User</code> user has sufficient permissions
     * to create a project
     *
     * @param user
     * @return boolean
     */
    private boolean hasAuthorPermissions(User user) {
        return user.getUserDetails().hasGrantedAuthority(UserDetailsService.AUTHOR_ROLE) ||
                user.getUserDetails().hasGrantedAuthority(UserDetailsService.TEACHER_ROLE);
    }
}