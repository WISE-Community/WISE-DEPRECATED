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
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.work.NotebookItem;

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

    @Autowired
    private WorkgroupService workgroupService;

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
            if (signedInUser.isStudent()) {
                Workgroup workgroup = workgroupService.retrieveById(new Long(workgroupId));
                if ((!run.isStudentAssociatedToThisRun(signedInUser) || !workgroup.getMembers().contains(signedInUser))
                        ) {
                    // user is student and is not in this run or not in the specified workgroup, so deny access
                    return;
                }
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
            @RequestParam(value = "notebookItemId", required = false) Integer notebookItemId,
            @RequestParam(value = "nodeId", required = false) String nodeId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "studentWorkId", required = false) Integer studentWorkId,
            @RequestParam(value = "studentAssetId", required = false) Integer studentAssetId,
            @RequestParam(value = "localNotebookItemId", required = false) String localNotebookItemId,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "clientSaveTime", required = true) String clientSaveTime,
            @RequestParam(value = "clientDeleteTime", required = false) String clientDeleteTime,
            HttpServletResponse response) throws IOException {

        User signedInUser = ControllerUtil.getSignedInUser();
        try {
            Run run = runService.retrieveById(new Long(runId));
            Workgroup workgroup = workgroupService.retrieveById(new Long(workgroupId));
            if (signedInUser.getUserDetails() instanceof StudentUserDetails &&
                    (!run.isStudentAssociatedToThisRun(signedInUser) || !workgroup.getMembers().contains(signedInUser))
                    ) {
                // user is student and is not in this run or not in the specified workgroup, so deny access
                return;
            }
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
            return;
        }

        NotebookItem notebookItem = vleService.saveNotebookItem(
                notebookItemId,
                runId,
                periodId,
                workgroupId,
                nodeId,
                componentId,
                studentWorkId,
                studentAssetId,
                localNotebookItemId,
                type,
                title,
                content,
                clientSaveTime,
                clientDeleteTime
        );
        response.getWriter().write(notebookItem.toJSON().toString());
    }

}
