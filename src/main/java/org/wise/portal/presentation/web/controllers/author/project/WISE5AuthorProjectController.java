package org.wise.portal.presentation.web.controllers.author.project;

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

    @RequestMapping("/project/edit/{projectId}")
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

    @RequestMapping(value = "/project/save/{projectId}", method = RequestMethod.POST)
    protected void saveProject(
            @PathVariable Long projectId,
            @RequestBody String projectJSONString
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
        String projectDir = curriculumBaseDir + rawProjectUrl;
        File projectFile = new File(projectDir);
        try {
        if (!projectFile.exists()) {
            projectFile.createNewFile();
        }
            Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(projectFile), "UTF-8"));
            writer.write(projectJSONString);
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @RequestMapping("/authorConfig/{projectId}")
    protected void getAuthorProjectConfig(
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
            String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
            config.put("projectId", projectId);
            // set the content url
            String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
            String rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
            String projectURL = curriculumBaseWWW + rawProjectUrl;
            //String previewProjectURL = wiseBaseURL + "/project/preview/" + projectId;
            String previewProjectURL = wiseBaseURL + "/previewproject.html?projectId=" + projectId;
            String saveProjectURL = wiseBaseURL + "/project/save/" + projectId;

            config.put("projectURL", projectURL);
            config.put("previewProjectURL", previewProjectURL);
            config.put("saveProjectURL", saveProjectURL);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        PrintWriter writer = response.getWriter();
        writer.write(config.toString());
        writer.close();
    }

}
