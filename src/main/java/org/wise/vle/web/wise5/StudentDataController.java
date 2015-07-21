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

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.vle.domain.work.ComponentState;

/**
 * Controller for handling GET and POST requests of WISE5 student data
 * WISE5 student data is stored as ComponentState and ActionLog domain objects
 * @author Hiroki Terashima
 */
@Controller("wise5StudentDataController")
public class StudentDataController {

    @Autowired
    private VLEService vleService;

    @Autowired
    private RunService runService;

    @RequestMapping(method = RequestMethod.GET,
            value = "/student/data")
    public void handleGETWISE5StudentDataController(
            HttpServletResponse response,
            @RequestParam(value = "getComponentStates", defaultValue = "false") boolean getComponentStates,
            @RequestParam(value = "getActionLogs", defaultValue = "false") boolean getActionLogs,
            @RequestParam(value = "getAnnotations", defaultValue = "false") boolean getAnnotations,
            @RequestParam(value = "id", required = false) Integer id,
            @RequestParam(value = "runId", required = false) Integer runId,
            @RequestParam(value = "periodId", required = false) Integer periodId,
            @RequestParam(value = "workgroupId", required = false) Integer workgroupId,
            @RequestParam(value = "nodeId", required = false) String nodeId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "componentType", required = false) String componentType
            ) {
        JSONObject result = new JSONObject();
        if (getComponentStates) {
            List<ComponentState> componentStates = vleService.getComponentStates(id, runId, periodId, workgroupId,
                    nodeId, componentId, componentType);

            JSONArray componentStatesJSONArray = new JSONArray();

            // loop through all the component states
            for (int c = 0; c < componentStates.size(); c++) {
                ComponentState componentState = componentStates.get(c);

                // get the JSON representation of the component state and add to componentStatesJSONArray
                componentStatesJSONArray.put(componentState.toJSON());
            }
            try {
                result.put("componentStates", componentStatesJSONArray);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        // write the result to the response
        try {
            PrintWriter writer = response.getWriter();
            writer.write(result.toString());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Handles batch POSTing student data (ComponentState, ActionLog, Annotations)
     * @param runId Run that the POSTer (student) is in
     * @param data JSON string containing batch student data
     *             ex: { "componentStates":[{"runId":2,"nodeId":"node4",...},{"runId":2,"nodeId":"node5",...}],
     *                   "actionLogs":[],
     *                   "annotations": []
     *                 }
     */
    @RequestMapping(method = RequestMethod.POST,
            value = "/student/data")
    public void handlePOSTWISE5StudentDataController(
            HttpServletResponse response,
            @RequestParam(value = "runId", required = true) Integer runId,
            @RequestParam(value = "data", required = true) String data
    ) throws JSONException {
        User signedInUser = ControllerUtil.getSignedInUser();
        JSONObject result = new JSONObject();

        // verify that the student is in the run
        try {
            Run run = runService.retrieveById(new Long(runId));
            if (run.isStudentAssociatedToThisRun(signedInUser)) {
                try {
                    JSONObject dataJSONObject = new JSONObject(data);
                    JSONArray componentStatesJSONArray = dataJSONObject.optJSONArray("componentStates");
                    if (componentStatesJSONArray != null) {
                        JSONArray componentStatesResultJSONArray = new JSONArray();
                        for (int c = 0; c < componentStatesJSONArray.length(); c++) {
                            JSONObject componentStateJSONObject = componentStatesJSONArray.getJSONObject(c);
                            String requestToken = componentStateJSONObject.getString("requestToken");
                            ComponentState componentState = vleService.saveComponentState(
                                    componentStateJSONObject.isNull("id") ? null : componentStateJSONObject.getInt("id"),
                                    componentStateJSONObject.isNull("runId") ? null : componentStateJSONObject.getInt("runId"),
                                    componentStateJSONObject.isNull("periodId") ? null : componentStateJSONObject.getInt("periodId"),
                                    componentStateJSONObject.isNull("workgroupId") ? null : componentStateJSONObject.getInt("workgroupId"),
                                    componentStateJSONObject.isNull("nodeId") ? null : componentStateJSONObject.getString("nodeId"),
                                    componentStateJSONObject.isNull("componentId") ? null : componentStateJSONObject.getString("componentId"),
                                    componentStateJSONObject.isNull("componentType") ? null : componentStateJSONObject.getString("componentType"),
                                    componentStateJSONObject.isNull("clientSaveTime") ? null : componentStateJSONObject.getString("clientSaveTime"),
                                    componentStateJSONObject.isNull("studentData") ? null : componentStateJSONObject.getString("studentData"));

                            // before returning saved ComponentState, strip all fields except id, token, and responseToken to minimize response size
                            componentState.setRun(null);
                            componentState.setPeriod(null);
                            componentState.setWorkgroup(null);
                            componentState.setNodeId(null);
                            componentState.setComponentId(null);
                            componentState.setComponentType(null);
                            componentState.setStudentData(null);
                            componentState.setClientSaveTime(null);
                            JSONObject savedComponentStateJSONObject = componentState.toJSON();
                            savedComponentStateJSONObject.put("requestToken", requestToken);
                            componentStatesResultJSONArray.put(savedComponentStateJSONObject);
                        }
                        result.put("componentStates", componentStatesResultJSONArray);
                    }

                } catch (Exception e) {

                }
            }
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
            return;
        }

        // write the result to the response
        try {
            PrintWriter writer = response.getWriter();
            writer.write(result.toString());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
