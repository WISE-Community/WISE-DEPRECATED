package org.wise.vle.web.wise5;

import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.vle.domain.work.NotebookItem;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Controller for handling GET and POST of WISE5 Notebooks and Notebook Items
 * @author Hiroki Terashima
 */
@Controller
public class NotebookController {

    @Autowired
    private VLEService vleService;

    @Autowired
    private RunService runService;

    @RequestMapping(method = RequestMethod.GET, value = "/student/notebook/{runId}")
    protected void getNotebookItems(
            @PathVariable Integer runId,
            @RequestParam(value = "id", required = false) Integer id,
            @RequestParam(value = "periodId", required = false) Integer periodId,
            @RequestParam(value = "workgroupId", required = false) Integer workgroupId,
            @RequestParam(value = "nodeId", required = false) String nodeId,
            @RequestParam(value = "componentId", required = false) String componentId,
            HttpServletResponse response) throws IOException {

        User signedInUser = ControllerUtil.getSignedInUser();
        try {
            Run run = runService.retrieveById(new Long(runId));
            if (signedInUser.getUserDetails() instanceof StudentUserDetails &&
                    !run.isStudentAssociatedToThisRun(signedInUser)) {
                // user is student and is not in this run, so deny access
                return;
            }
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
            return;
        }

        if (workgroupId != null) {
            List<NotebookItem> notebookItemList = vleService.getNotebookItems(
                    id, runId, periodId, workgroupId, nodeId, componentId);
            JSONArray notebookItems = new JSONArray();
            for (NotebookItem notebookItem : notebookItemList) {
                notebookItems.put(notebookItem.toJSON());
            }
            response.getWriter().write(notebookItems.toString());
        }
    }

    @RequestMapping(method = RequestMethod.POST, value = "/student/notebook/{runId}")
    protected void postNotebookItem(
            @PathVariable Integer runId,
            @RequestParam(value = "periodId", required = true) Integer periodId,
            @RequestParam(value = "workgroupId", required = true) Integer workgroupId,
            @RequestParam(value = "nodeId", required = false) String nodeId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "studentWorkId", required = false) Integer studentWorkId,
            @RequestParam(value = "studentAssetId", required = false) Integer studentAssetId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "clientSaveTime", required = true) String clientSaveTime,
            HttpServletResponse response) throws IOException {

        User signedInUser = ControllerUtil.getSignedInUser();
        try {
            Run run = runService.retrieveById(new Long(runId));
            if (signedInUser.getUserDetails() instanceof StudentUserDetails &&
                    !run.isStudentAssociatedToThisRun(signedInUser)) {
                // user is student and is not in this run, so deny access
                return;
            }
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
            return;
        }

        Integer id = null;
        String clientDeleteTime = null;
        NotebookItem notebookItem = vleService.saveNotebookItem(
                id,
                runId,
                periodId,
                workgroupId,
                nodeId,
                componentId,
                studentWorkId,
                studentAssetId,
                title,
                description,
                clientSaveTime,
                clientDeleteTime
        );
        response.getWriter().write(notebookItem.toJSON().toString());
    }

}
