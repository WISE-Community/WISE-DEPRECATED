package org.wise.portal.presentation.web.controllers.author.project;

import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.revwalk.RevCommit;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.DefaultMultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.module.impl.ModuleParameters;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.impl.ProjectMetadataImpl;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.project.impl.ProjectType;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.presentation.web.filters.WISEAuthenticationProcessingFilter;
import org.wise.portal.presentation.web.listeners.WISESessionListener;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.module.CurnitService;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;
import org.wise.vle.utils.FileManager;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.util.*;

/**
 * Controller for authoring WISE5 projects
 * @author Hiroki Terashima
 */
@Controller
public class WISE5AuthorProjectController {

    @Autowired
    PortalService portalService;

    @Autowired
    ProjectService projectService;

    @Autowired
    RunService runService;

    @Autowired
    CurnitService curnitService;

    @Autowired
    Properties wiseProperties;

    @Autowired
    ServletContext servletContext;

    /**
     * Handle user's request to launch the Authoring Tool without specified project
     * @return
     */
    @RequestMapping(value = "/author", method = RequestMethod.GET)
    protected String authorProject(
            HttpServletRequest request,
            HttpServletResponse response,
            ModelMap modelMap) {

        // if login is disallowed, log out user and redirect them to the home page
        try {
            Portal portal = portalService.getById(new Integer(1));
            if (!portal.isLoginAllowed()) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null){
                    new SecurityContextLogoutHandler().logout(request, response, auth);
                }
                SecurityContextHolder.getContext().setAuthentication(null);
                return "redirect:/index.html";
            }
        } catch (ObjectNotFoundException e) {
            // do nothing
        }

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

            // if this is new original project, set a new fresh metadata object
            ProjectMetadata metadata = new ProjectMetadataImpl();
            metadata.setTitle(projectName);
            pParams.setMetadata(metadata);

            Project project = projectService.createProject(pParams);
            response.getWriter().write(project.getId().toString());

            try {
                // now commit changes
                String author = user.getUserDetails().getUsername();
                JGitUtils.commitAllChangesToCurriculumHistory(newProjectPath.getAbsolutePath(), author, commitMessage);

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
                            String commitAuthor = commit.getAuthorIdent().getName();
                            commitHistoryJSONObject.put("commitAuthor", commitAuthor);
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
     * Handle user's request to register a new WISE5 project.
     * Registers the new project in DB and returns the new project ID
     * If the parentProjectId is specified, the user is requesting to copy that project
     * @return
     */
    @RequestMapping(value = "/project/copy/{projectId}", method = RequestMethod.POST)
    protected void copyProject(
            @PathVariable Long projectId,
            HttpServletResponse response) {
        User user = ControllerUtil.getSignedInUser();
        if (!this.hasAuthorPermissions(user)) {
            return;
        }

        if (projectId != null) {
            try {
                Project parentProject = projectService.getById(projectId);
                Set<String> tagNames = new TreeSet<String>();
                tagNames.add("library");
                if (parentProject != null && (this.projectService.canAuthorProject(parentProject, user) || parentProject.hasTags(tagNames))) {
                    // upload the zipfile to curriculum_base_dir
                    String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
                    String parentProjectJSONAbsolutePath = curriculumBaseDir + (String) parentProject.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
                    File parentProjectJSONFile = new File(parentProjectJSONAbsolutePath);
                    File parentProjectDir = parentProjectJSONFile.getParentFile();

                    String newProjectDirectoryPath = copyProjectDirectory(parentProjectDir);
                    ModuleParameters mParams = new ModuleParameters();
                    mParams.setUrl("/" + newProjectDirectoryPath + "/project.json");
                    Curnit curnit = curnitService.createCurnit(mParams);

                    ProjectParameters pParams = new ProjectParameters();
                    pParams.setCurnitId(curnit.getId());
                    pParams.setOwner(user);
                    pParams.setProjectname(parentProject.getName());
                    pParams.setProjectType(ProjectType.LD);
                    pParams.setWiseVersion(new Integer(5));

                    // if this is new original project, set a new fresh metadata object
                    ProjectMetadata metadata = new ProjectMetadataImpl();
                    metadata.setTitle(parentProject.getName());
                    pParams.setMetadata(metadata);
                    pParams.setParentProjectId(Long.valueOf(projectId));
                    // get the project's metadata from the parent
                    ProjectMetadata parentProjectMetadata = parentProject.getMetadata();
                    if (parentProjectMetadata != null) {
                        // copy into new metadata object
                        ProjectMetadata newProjectMetadata = new ProjectMetadataImpl(parentProjectMetadata.toJSONString());
                        pParams.setMetadata(newProjectMetadata);
                    }
                    Project project = projectService.createProject(pParams);
                    response.getWriter().write(project.getId().toString());

                }
            } catch (ObjectNotFoundException onfe) {
                onfe.printStackTrace();
                return;
            } catch (IOException ie) {
                ie.printStackTrace();
                return;
            } catch (JSONException je) {
                je.printStackTrace();
                return;
            }
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
            
            // check if we need to update the project name in the project table in the db
            try {
                // convert the project JSON string into a JSON object
                JSONObject projectJSONObject = new JSONObject(projectJSONString);
                
                // get the metadata object from the project
                JSONObject projectMetadata = projectJSONObject.getJSONObject("metadata");
                
                if (projectMetadata != null) {
                    // get the project title from the metadata
                    String projectTitle = projectMetadata.getString("title");
                    
                    if (projectTitle != null) {
                        
                        // check if the project title has changed
                        if (!projectTitle.equals(project.getName())) {
                            // the project title has changed
                            
                            // set the project title in the db table
                            project.setName(projectTitle);
                            
                            // update the project
                            this.projectService.updateProject(project, user);
                        }
                    }
                }
            } catch(JSONException e) {
                e.printStackTrace();
            } catch (NotAuthorizedException e) {
                e.printStackTrace();
            }

            try {
                // now commit changes if they specify a commit message
                if (commitMessage != null && !commitMessage.isEmpty()) {
                    String author = user.getUserDetails().getUsername();
                    JGitUtils.commitAllChangesToCurriculumHistory(fullProjectDir, author, commitMessage);

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
                                String commitAuthor = commit.getAuthorIdent().getName();
                                commitHistoryJSONObject.put("commitAuthor", commitAuthor);
                                long commitTime = commit.getCommitTime() * 1000l; // x1000 to make into milliseconds since epoch
                                commitHistoryJSONObject.put("commitTime", commitTime);
                                commitHistoryJSONArray.put(commitHistoryJSONObject);
                            }
                            response.getWriter().print(commitHistoryJSONArray);
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
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
            Long runId = this.getRunId(projectId);
            
            config.put("projectId", projectId);
            config.put("projectURL", projectURL);
            config.put("projectAssetTotalSizeMax", projectAssetTotalSizeMax);
            config.put("projectAssetURL", projectAssetURL);
            config.put("projectBaseURL", projectBaseURL);
            config.put("previewProjectURL", previewProjectURL);
            config.put("saveProjectURL", saveProjectURL);
            config.put("commitProjectURL", commitProjectURL);
            config.put("mode", "author");

            if (runId != null) {
                config.put("runId", runId);
            }
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
            config.put("copyProjectURL", wiseBaseURL + "/project/copy");
            config.put("mainHomePageURL", wiseBaseURL);
            config.put("renewSessionURL", wiseBaseURL + "/session/renew");
            config.put("sessionLogOutURL", wiseBaseURL + "/logout");
            config.put("registerNewProjectURL", wiseBaseURL + "/project/new");
            config.put("wiseBaseURL", wiseBaseURL);
            config.put("notifyProjectBeginURL", wiseBaseURL + "/project/notifyAuthorBegin/");
            config.put("notifyProjectEndURL", wiseBaseURL + "/project/notifyAuthorEnd/");
            config.put("getCurrentAuthorsURL", wiseBaseURL + "/project/currentAuthors/");
            config.put("getLibraryProjectsURL", wiseBaseURL + "/author/authorproject.html?command=projectList&projectPaths=&projectTag=library&wiseVersion=5");

            // add this teachers's info in config.userInfo.myUserInfo object
            JSONObject myUserInfo = new JSONObject();
            myUserInfo.put("userName", user.getUserDetails().getUsername());
            JSONObject userInfo = new JSONObject();
            userInfo.put("myUserInfo", myUserInfo);
            config.put("userInfo", userInfo);

            // get a list of projects this user owns
            List<Project> allProjectsOwnedByUser = projectService.getProjectList(user);
            List<JSONObject> wise5ProjectsOwnedByUser = new ArrayList<JSONObject>();
            for (Project project : allProjectsOwnedByUser) {
                if (new Integer(5).equals(project.getWiseVersion())) {
                    JSONObject projectJSONObject = new JSONObject();
                    projectJSONObject.put("id", project.getId());
                    projectJSONObject.put("name", project.getName());

                    // get the project id
                    String projectIdString = project.getId().toString();
                    Long projectId = new Long(projectIdString);

                    // get the run id if it exists
                    Long runId = this.getRunId(projectId);
                    
                    if (runId != null) {
                        projectJSONObject.put("runId", runId);
                    }
                    
                    wise5ProjectsOwnedByUser.add(projectJSONObject);
                }
            }
            config.put("projects", wise5ProjectsOwnedByUser);

            // get a list of projects this user has shared access to
            List<Project> sharedProjects = projectService.getSharedProjectList(user);
            List<JSONObject> wise5SharedProjects = new ArrayList<JSONObject>();
            for (Project project : sharedProjects) {
                if (new Integer(5).equals(project.getWiseVersion())) {

                    JSONObject projectJSONObject = new JSONObject();
                    projectJSONObject.put("id", project.getId());
                    projectJSONObject.put("name", project.getName());

                    // get the project id
                    String projectIdString = project.getId().toString();
                    Long projectId = new Long(projectIdString);

                    // get the run id if it exists
                    Long runId = this.getRunId(projectId);

                    if (runId != null) {
                        projectJSONObject.put("runId", runId);
                    }

                    if (projectService.canAuthorProject(project, user)) {
                        projectJSONObject.put("canEdit", true);
                    }

                    wise5SharedProjects.add(projectJSONObject);
                }
            }
            config.put("sharedProjects", wise5SharedProjects);

            // set user's locale
            Locale locale = request.getLocale();
            if (user != null) {
                String userLanguage = user.getUserDetails().getLanguage();
                if (userLanguage != null) {
                    if (userLanguage.contains("_")) {
                        String language = userLanguage.substring(0, userLanguage.indexOf("_"));
                        String country = userLanguage.substring(userLanguage.indexOf("_") + 1);
                        locale = new Locale(language, country);
                    } else {
                        locale = new Locale(userLanguage);
                    }
                }
            }
            config.put("locale", locale);

            //get the websocket base url e.g. ws://wise.berkeley.edu:8080
            String webSocketBaseURL = wiseProperties.getProperty("webSocketBaseUrl");

            if (webSocketBaseURL == null) {
				/*
				 * if the websocket base url was not provided in the portal properties
				 * we will use the default websocket base url.
				 * e.g.
				 * ws://localhost:8080/wise
				 */
                if (wiseBaseURL.contains("http")) {
                    webSocketBaseURL = wiseBaseURL.replace("http", "ws");
                } else {
                    String portalContextPath = ControllerUtil.getPortalUrlString(request);
                    webSocketBaseURL = portalContextPath.replace("http", "ws");
                }
            }

            //get the url for websocket connections
            String webSocketURL = webSocketBaseURL + "/websocket";
            config.put("webSocketURL", webSocketURL);

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
                String commitAuthor = commit.getAuthorIdent().getName();
                commitHistoryJSONObject.put("commitAuthor", commitAuthor);
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
     * @return an array of files in the directory
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

    /**
     * Given a path to curriculum base directory and the path to the project directory that we want to copy,
     * copies the directory and returns <code>String</code> the path to the freshly copied directory.
     *
     * @param srcDir the directory of the project we are copying, e.g. "/tomcat/webapps/curriculum/5"
     * @return the path to the new project
     * @throws IOException
     */
    public static String copyProjectDirectory(File srcDir) throws IOException {
        String result = "";

        if (srcDir.exists() && srcDir.isDirectory()) {
            File destDir = createNewprojectPath(srcDir.getParentFile());
            copy(srcDir, destDir);
            result = destDir.getName();
        } else {
            throw new IOException("Provided path is not found or is not a directory. Path: " + srcDir.getPath());
        }

        return result;
    }

    /**
     * Given a parent directory, attempts to generate and return
     * a unique project directory.
     *
     * @param parent
     * @return
     */
    public static File createNewprojectPath(File parent){
        Integer counter = 1;

        while (true) {
            File tryMe = new File(parent, String.valueOf(counter));
            if (!tryMe.exists()) {
                tryMe.mkdir();
                return tryMe;
            }
            counter++;
        }
    }

    /**
     * Copies the given <code>File</code> src to the given <code>File</code> dest. If the src is
     * a directories, recursively copies the contents of the directory into dest.
     *
     * @param src directory to copy from
     * @param dest directory to copy to
     * @throws IOException
     */
    public static void copy(File src, File dest) throws IOException {
        if (src.isDirectory()) {
            if (!dest.exists()) {
                dest.mkdir();
            }

            String[] files = src.list();
            for (int a = 0; a < files.length; a++) {
                copy(new File(src, files[a]), new File(dest, files[a]));
            }
        } else {
            InputStream in = new FileInputStream(src);
            FileOutputStream out = new FileOutputStream(dest);

            byte[] buffer = new byte[2048];
            int len;
            while ((len = in.read(buffer)) > 0) {
                out.write(buffer, 0, len);
            }

            in.close();
            out.close();
        }
    }
    
    /**
     * Get the run id that uses the project id
     * @param projectId the project id
     * @returns the run id that uses the project if the project is used
     * in a run
     */
    private Long getRunId(Long projectId) {
        
        Long runId = null;
        
        if (projectId != null) {
            // get the runs that use the project
            List<Run> runs = this.runService.getProjectRuns(projectId);
            
            if (runs != null && runs.size() > 0) {

                // get the first run since a project can only be used in one run
                Run run = runs.get(0);
                
                if (run != null) {
                    // add the runId to the JSON object
                    runId = run.getId();
                }
            }
        }
        
        return runId;
    }

    /**
     * Returns a list of authors who are currently editing the specified project
     * @param request
     * @param response
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/project/currentAuthors/{projectId}", method = RequestMethod.GET)
    private void handleGetCurrentAuthors(
            @PathVariable String projectId,
            HttpServletRequest request,
            HttpServletResponse response) throws Exception {
        User user = ControllerUtil.getSignedInUser();
        if (this.hasAuthorPermissions(user)) {

            HashMap<String, ArrayList<String>> openedProjectsToSessions =
                    (HashMap<String, ArrayList<String>>) servletContext.getAttribute("openedProjectsToSessions");

            if (openedProjectsToSessions == null) {
                openedProjectsToSessions = new HashMap<String, ArrayList<String>>();
                servletContext.setAttribute("openedProjectsToSessions", openedProjectsToSessions);
            }

            if (openedProjectsToSessions.get(projectId) == null) {
                openedProjectsToSessions.put(projectId, new ArrayList<String>());
            }
            ArrayList<String> sessions = openedProjectsToSessions.get(projectId);  // sessions that are currently authoring this project

            // Now get all the logged in users who are editing this same project
            HashMap<String, User> allLoggedInUsers = (HashMap<String, User>) servletContext
                    .getAttribute(WISESessionListener.ALL_LOGGED_IN_USERS);

            HttpSession currentUserSession = request.getSession();
            JSONArray otherUsersAlsoEditingProject = new JSONArray();

            for (String sessionId : sessions) {
                if (sessionId != currentUserSession.getId()) {
                    user = allLoggedInUsers.get(sessionId);
                    if (user != null) {
                        otherUsersAlsoEditingProject.put(user.getUserDetails().getUsername());
                    }
                }
            }

            response.getWriter().write(otherUsersAlsoEditingProject.toString());
        }
    }

    /**
     * Handles notifications of opened projects
     * @param request
     * @param response
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/project/notifyAuthorBegin/{projectId}", method = RequestMethod.POST)
    private ModelAndView handleNotifyAuthorProjectBegin(
            @PathVariable String projectId,
            HttpServletRequest request,
            HttpServletResponse response) throws Exception{
        User user = ControllerUtil.getSignedInUser();
        if (this.hasAuthorPermissions(user)) {

            HttpSession currentUserSession = request.getSession();
            HashMap<String, ArrayList<String>> openedProjectsToSessions =
                    (HashMap<String, ArrayList<String>>) servletContext.getAttribute("openedProjectsToSessions");

            if (openedProjectsToSessions == null) {
                openedProjectsToSessions = new HashMap<String, ArrayList<String>>();
                servletContext.setAttribute("openedProjectsToSessions", openedProjectsToSessions);
            }

            if (openedProjectsToSessions.get(projectId) == null) {
                openedProjectsToSessions.put(projectId, new ArrayList<String>());
            }
            ArrayList<String> sessions = openedProjectsToSessions.get(projectId);  // sessions that are currently authoring this project
            if (!sessions.contains(currentUserSession.getId())) {
                sessions.add(currentUserSession.getId());
            }

            // Now get all the logged in users who are editing this same project
            HashMap<String, User> allLoggedInUsers = (HashMap<String, User>) servletContext
                    .getAttribute(WISESessionListener.ALL_LOGGED_IN_USERS);

            String otherUsersAlsoEditingProject = "";
            for (String sessionId : sessions) {
                if (sessionId != currentUserSession.getId()) {
                    user = allLoggedInUsers.get(sessionId);
                    if (user != null) {
                        otherUsersAlsoEditingProject += user.getUserDetails().getUsername() + ",";
                    }
                }
            }

			/* strip off trailing comma */
            if (otherUsersAlsoEditingProject.contains(",")) {
                otherUsersAlsoEditingProject = otherUsersAlsoEditingProject.substring(0, otherUsersAlsoEditingProject.length() - 1);
            }

            response.getWriter().write(otherUsersAlsoEditingProject);
            return null;
        } else {
            return new ModelAndView(new RedirectView("accessdenied.html"));
        }
    }

    /**
     * Handles notifications of closed projects
     *
     * @param request
     * @param response
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/project/notifyAuthorEnd/{projectId}", method = RequestMethod.POST)
    private ModelAndView handleNotifyAuthorProjectEnd(
            @PathVariable String projectId,
            HttpServletRequest request,
            HttpServletResponse response) throws Exception{
        User user = ControllerUtil.getSignedInUser();
        if (this.hasAuthorPermissions(user)) {
            HttpSession currentSession = request.getSession();

            Map<String, ArrayList<String>> openedProjectsToSessions = (Map<String, ArrayList<String>>) servletContext.getAttribute("openedProjectsToSessions");

            if (openedProjectsToSessions == null || openedProjectsToSessions.get(projectId) == null) {
                return null;
            } else {
                ArrayList<String> sessions = openedProjectsToSessions.get(projectId);
                if (!sessions.contains(currentSession.getId())) {
                    return null;
                } else {
                    sessions.remove(currentSession.getId());
                    // if there are no more users authoring this project, remove this project from openedProjectsToSessions
                    if (sessions.size() == 0) {
                        openedProjectsToSessions.remove(projectId);
                    }
                    response.getWriter().write("success");
                    return null;
                }
            }
        } else {
            return new ModelAndView(new RedirectView("accessdenied.html"));
        }
    }
}