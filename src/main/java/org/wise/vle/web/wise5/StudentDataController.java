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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
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

    @RequestMapping(method = RequestMethod.GET,
            value = {"/student/wise5StudentDataControllerTest.html"})
    public ModelAndView handleGETWISE5StudentDataControllerTest(
            @RequestParam(value = "id", required = false) Integer id,
            @RequestParam(value = "runId", required = false) Integer runId,
            @RequestParam(value = "periodId", required = false) Integer periodId,
            @RequestParam(value = "workgroupId", required = false) Integer workgroupId,
            @RequestParam(value = "nodeId", required = false) String nodeId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "componentType", required = false) String componentType
            ) {
        System.out.println("handleGETWISE5StudentDataControllerTest");
        List<ComponentState> componentStates = vleService.getComponentStates(id, runId, periodId, workgroupId,
                nodeId, componentId, componentType);

        ModelAndView mav = new ModelAndView();
        mav.addObject("componentStates", componentStates);
        return mav;
    }
    
    @RequestMapping(method = RequestMethod.GET,
            value = {"/student/componentState.html"})
    public ModelAndView handleGETWISE5StudentDataController(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestParam(value = "id", required = false) Integer id,
            @RequestParam(value = "runId", required = false) Integer runId,
            @RequestParam(value = "periodId", required = false) Integer periodId,
            @RequestParam(value = "workgroupId", required = false) Integer workgroupId,
            @RequestParam(value = "nodeId", required = false) String nodeId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "componentType", required = false) String componentType
            ) {
        System.out.println("handleGETWISE5StudentDataController");
        List<ComponentState> componentStates = vleService.getComponentStates(id, runId, periodId, workgroupId,
                nodeId, componentId, componentType);

        if (componentStates != null) {
            
            try {
                PrintWriter writer = response.getWriter();
                JSONArray componentStatesJSONArray = new JSONArray();
                
                // loop through all the component states
                for (int c = 0; c < componentStates.size(); c++) {
                    ComponentState componentState = componentStates.get(c);
                    
                    // get the JSON representation of the component state
                    JSONObject componentStateJSONObject = componentState.toJSON();
                    
                    componentStatesJSONArray.put(componentStateJSONObject);
                }
                
                // write the array of component states to the response
                writer.write(componentStatesJSONArray.toString());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        
        return null;
    }

    @RequestMapping(method = RequestMethod.POST,
            value = {"/student/wise5StudentDataControllerTest.html"})
    public ModelAndView handlePOSTWISE5StudentDataControllerTest(
            @RequestParam(value = "id", required = false) Integer id,
            @RequestParam(value = "runId", required = false) Integer runId,
            @RequestParam(value = "periodId", required = false) Integer periodId,
            @RequestParam(value = "workgroupId", required = false) Integer workgroupId,
            @RequestParam(value = "nodeId", required = false) String nodeId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "componentType", required = false) String componentType,
            @RequestParam(value = "studentData", required = false) String studentData
    ) {
        System.out.println("handlePOSTWISE5StudentDataControllerTest");

        ComponentState componentState = vleService.saveComponentState(id, runId, periodId, workgroupId,
                nodeId, componentId, componentType, studentData);

        ModelAndView mav = new ModelAndView();
        mav.addObject("componentState", componentState);
        return mav;
    }
    
    @RequestMapping(method = RequestMethod.POST,
            value = {"/student/componentState.html"})
    public ModelAndView handlePOSTWISE5StudentDataController(
            @RequestParam(value = "id", required = false) Integer id,
            @RequestParam(value = "runId", required = false) Integer runId,
            @RequestParam(value = "periodId", required = false) Integer periodId,
            @RequestParam(value = "workgroupId", required = false) Integer workgroupId,
            @RequestParam(value = "nodeId", required = false) String nodeId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "componentType", required = false) String componentType,
            @RequestParam(value = "studentData", required = false) String studentData
    ) {
        System.out.println("handlePOSTWISE5StudentDataController");

        ComponentState componentState = vleService.saveComponentState(id, runId, periodId, workgroupId,
                nodeId, componentId, componentType, studentData);

        return null;
    }
}
