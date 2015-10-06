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
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.project.ProjectService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.Properties;

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

        } catch (IOException e) {
            e.printStackTrace();
        } catch (GitAPIException e) {
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
            String previewProjectURL = wiseBaseURL + "/project/" + projectId;
            String saveProjectURL = wiseBaseURL + "/project/save/" + projectId;
            String commitProjectURL = wiseBaseURL + "/project/commit/" + projectId;

            config.put("contextPath", contextPath);
            config.put("mainHomePageURL", wiseBaseURL);
            config.put("renewSessionURL", wiseBaseURL + "/session/renew");
            config.put("sessionLogOutURL", wiseBaseURL + "/logout");
            config.put("projectURL", projectURL);
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
}