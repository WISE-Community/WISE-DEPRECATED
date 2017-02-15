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
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.socket.WebSocketHandler;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.service.websocket.WISEWebSocketHandler;
import org.wise.vle.domain.annotation.wise5.Annotation;
import org.wise.vle.domain.work.NotebookItem;
import org.wise.vle.domain.work.StudentWork;
import org.wise.vle.domain.work.Event;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;

/**
 * Controller for handling GET and POST requests of WISE5 student data
 * WISE5 student data is stored as StudentWork, Event, Annotation, and StudentAsset domain objects
 * @author Hiroki Terashima
 */
@Controller("wise5StudentDataController")
public class StudentDataController {

    @Autowired
    private VLEService vleService;

    @Autowired
    private RunService runService;

    @Autowired
    private WebSocketHandler webSocketHandler;

    @RequestMapping(method = RequestMethod.GET, value = "/student/data")
    public void getWISE5StudentData(
            HttpServletResponse response,
            @RequestParam(value = "getStudentWork", defaultValue = "false") boolean getStudentWork,
            @RequestParam(value = "getEvents", defaultValue = "false") boolean getEvents,
            @RequestParam(value = "getAnnotations", defaultValue = "false") boolean getAnnotations,
            @RequestParam(value = "id", required = false) Integer id,
            @RequestParam(value = "runId", required = false) Integer runId,
            @RequestParam(value = "periodId", required = false) Integer periodId,
            @RequestParam(value = "workgroupId", required = false) Integer workgroupId,
            @RequestParam(value = "isAutoSave", required = false) Boolean isAutoSave,
            @RequestParam(value = "isSubmit", required = false) Boolean isSubmit,
            @RequestParam(value = "nodeId", required = false) String nodeId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "componentType", required = false) String componentType,
            @RequestParam(value = "context", required = false) String context,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "event", required = false) String event,
            @RequestParam(value = "fromWorkgroupId", required = false) Integer fromWorkgroupId,
            @RequestParam(value = "toWorkgroupId", required = false) Integer toWorkgroupId,
            @RequestParam(value = "studentWorkId", required = false) Integer studentWorkId,
            @RequestParam(value = "localNotebookItemId", required = false) String localNotebookItemId,
            @RequestParam(value = "notebookItemId", required = false) Integer notebookItemId,
            @RequestParam(value = "annotationType", required = false) String annotationType,
            @RequestParam(value = "components", required = false) List<JSONObject> components
            ) {

        JSONObject result = new JSONObject();

        if (getStudentWork) {
            List<StudentWork> studentWorkList = vleService.getStudentWorkList(id, runId, periodId, workgroupId,
                    isAutoSave, isSubmit, nodeId, componentId, componentType, components);

            JSONArray studentWorkJSONArray = new JSONArray();

            // loop through all the component states
            for (int c = 0; c < studentWorkList.size(); c++) {
                StudentWork studentWork = studentWorkList.get(c);

                // get the JSON representation of the component state and add to studentWorkJSONArray
                studentWorkJSONArray.put(studentWork.toJSON());
            }
            try {
                result.put("studentWorkList", studentWorkJSONArray);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        if (getEvents) {
            List<Event> events = vleService.getEvents(id, runId, periodId, workgroupId,
                    nodeId, componentId, componentType, context, category, event);

            JSONArray eventsJSONArray = new JSONArray();

            // loop through all the events
            for (int e = 0; e < events.size(); e++) {
                Event eventObject = events.get(e);

                // get the JSON representation of the event and add to eventsJSONArray
                eventsJSONArray.put(eventObject.toJSON());
            }
            try {
                result.put("events", eventsJSONArray);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        if (getAnnotations) {
            List<Annotation> annotations = vleService.getAnnotations(
                    id, runId, periodId, fromWorkgroupId, toWorkgroupId,
                    nodeId, componentId, studentWorkId, localNotebookItemId, notebookItemId, annotationType);

            JSONArray annotationsJSONArray = new JSONArray();

            // loop through all the annotations
            for (int a = 0; a < annotations.size(); a++) {
                Annotation annotationObject = annotations.get(a);

                // get the JSON representation of the annotation and add to annotationsJSONArray
                annotationsJSONArray.put(annotationObject.toJSON());
            }
            try {
                result.put("annotations", annotationsJSONArray);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        // write the result to the response
        try {
            PrintWriter writer = response.getWriter();
            writer.write(result.toString());
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Handles batch POSTing student data (StudentWork, Action, Annotation)
     * @param runId Run that the POSTer (student) is in
     * @param studentWorkList JSON string containing student work, ex: [{"runId":2,"nodeId":"node4",...},{"runId":2,"nodeId":"node5",...}]
     * @param events JSON string containing events
     * @param annotations JSON string containing annotations
     */
    @RequestMapping(method = RequestMethod.POST, value = "/student/data")
    public void postWISE5StudentData(
            HttpServletResponse response,
            @RequestParam(value = "runId", required = true) Integer runId,
            @RequestParam(value = "studentWorkList", required = true) String studentWorkList,
            @RequestParam(value = "events", required = true) String events,
            @RequestParam(value = "annotations", required = true) String annotations
    ) throws JSONException {
        User signedInUser = ControllerUtil.getSignedInUser();
        JSONObject result = new JSONObject();

        // verify that the student is in the run
        try {
            Run run = runService.retrieveById(new Long(runId));
            if (run.isStudentAssociatedToThisRun(signedInUser)) {
                    HashMap<String, StudentWork> savedStudentWorkList = new HashMap<>(); // maps nodeId_componentId to StudentWork.
                                                                                            // Used later for handling simultaneous POST of CRater annotation
                    // handle POST'ed studentWork
                    JSONArray studentWorkJSONArray = new JSONArray(studentWorkList);
                    if (studentWorkJSONArray != null) {
                        JSONArray studentWorkResultJSONArray = new JSONArray();
                        for (int c = 0; c < studentWorkJSONArray.length(); c++) {
                            try {
                                JSONObject studentWorkJSONObject = studentWorkJSONArray.getJSONObject(c);
                                String requestToken = studentWorkJSONObject.getString("requestToken");
                                StudentWork studentWork = vleService.saveStudentWork(
                                        studentWorkJSONObject.isNull("id") ? null : studentWorkJSONObject.getInt("id"),
                                        studentWorkJSONObject.isNull("runId") ? null : studentWorkJSONObject.getInt("runId"),
                                        studentWorkJSONObject.isNull("periodId") ? null : studentWorkJSONObject.getInt("periodId"),
                                        studentWorkJSONObject.isNull("workgroupId") ? null : studentWorkJSONObject.getInt("workgroupId"),
                                        studentWorkJSONObject.isNull("isAutoSave") ? null : studentWorkJSONObject.getBoolean("isAutoSave"),
                                        studentWorkJSONObject.isNull("isSubmit") ? null : studentWorkJSONObject.getBoolean("isSubmit"),
                                        studentWorkJSONObject.isNull("nodeId") ? null : studentWorkJSONObject.getString("nodeId"),
                                        studentWorkJSONObject.isNull("componentId") ? null : studentWorkJSONObject.getString("componentId"),
                                        studentWorkJSONObject.isNull("componentType") ? null : studentWorkJSONObject.getString("componentType"),
                                        studentWorkJSONObject.isNull("studentData") ? null : studentWorkJSONObject.getString("studentData"),
                                        studentWorkJSONObject.isNull("clientSaveTime") ? null : studentWorkJSONObject.getString("clientSaveTime"));

                                if (studentWork.getNodeId() != null && studentWork.getComponentId() != null) {
                                    // the student work was a component state, so save it for later when we might need it to add annotations
                                    savedStudentWorkList.put(studentWork.getNodeId() + "_" + studentWork.getComponentId(), studentWork);
                                }

                                // before returning saved StudentWork, strip all fields except id, responseToken, and serverSaveTime to minimize response size
                                JSONObject savedStudentWorkJSONObject = new JSONObject();
                                savedStudentWorkJSONObject.put("id", studentWork.getId());
                                savedStudentWorkJSONObject.put("requestToken", requestToken);
                                savedStudentWorkJSONObject.put("serverSaveTime", studentWork.getServerSaveTime().getTime());
                                studentWorkResultJSONArray.put(savedStudentWorkJSONObject);

                                // send this studentWork immediately to the teacher so the Classroom Monitor can be updated
                                try {
                                    if (webSocketHandler != null && studentWork != null) {
                                        WISEWebSocketHandler wiseWebSocketHandler = (WISEWebSocketHandler) webSocketHandler;

                                        if (wiseWebSocketHandler != null) {
                                            // send this message to websockets
                                            JSONObject webSocketMessageJSON = new JSONObject();
                                            webSocketMessageJSON.put("messageType", "newStudentWork");
                                            webSocketMessageJSON.put("messageParticipants", "studentToTeachers");
                                            webSocketMessageJSON.put("studentWork", studentWork.toJSON());
                                            wiseWebSocketHandler.handleMessage(signedInUser, webSocketMessageJSON.toString());
                                        }
                                    }
                                } catch (Exception e) {
                                    // if something fails during creating annotation and sending to websocket,
                                    // allow the rest to continue
                                    e.printStackTrace();
                                }

                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                        result.put("studentWorkList", studentWorkResultJSONArray);
                    }

                    // handle POST'ed events
                    JSONArray eventsJSONArray = new JSONArray(events);
                    if (eventsJSONArray != null) {
                        JSONArray eventsResultJSONArray = new JSONArray();
                        for (int e = 0; e < eventsJSONArray.length(); e++) {
                            try {
                                JSONObject eventJSONObject = eventsJSONArray.getJSONObject(e);
                                String requestToken = eventJSONObject.getString("requestToken");
                                Event event = vleService.saveEvent(
                                        eventJSONObject.isNull("id") ? null : eventJSONObject.getInt("id"),
                                        eventJSONObject.isNull("runId") ? null : eventJSONObject.getInt("runId"),
                                        eventJSONObject.isNull("periodId") ? null : eventJSONObject.getInt("periodId"),
                                        eventJSONObject.isNull("workgroupId") ? null : eventJSONObject.getInt("workgroupId"),
                                        eventJSONObject.isNull("nodeId") ? null : eventJSONObject.getString("nodeId"),
                                        eventJSONObject.isNull("componentId") ? null : eventJSONObject.getString("componentId"),
                                        eventJSONObject.isNull("componentType") ? null : eventJSONObject.getString("componentType"),
                                        eventJSONObject.isNull("context") ? null : eventJSONObject.getString("context"),
                                        eventJSONObject.isNull("category") ? null : eventJSONObject.getString("category"),
                                        eventJSONObject.isNull("event") ? null : eventJSONObject.getString("event"),
                                        eventJSONObject.isNull("data") ? null : eventJSONObject.getString("data"),
                                        eventJSONObject.isNull("clientSaveTime") ? null : eventJSONObject.getString("clientSaveTime"));

                                // before returning saved Event, strip all fields except id, responseToken, and serverSaveTime to minimize response size
                                JSONObject savedEventJSONObject = new JSONObject();
                                savedEventJSONObject.put("id", event.getId());
                                savedEventJSONObject.put("requestToken", requestToken);
                                savedEventJSONObject.put("serverSaveTime", event.getServerSaveTime().getTime());
                                eventsResultJSONArray.put(savedEventJSONObject);

                            } catch (Exception exception) {
                                exception.printStackTrace();
                            }
                        }
                        result.put("events", eventsResultJSONArray);
                    }

                    // handle POST'ed annotations
                    JSONArray annotationsJSONArray = new JSONArray(annotations);
                    if (annotationsJSONArray != null) {
                        JSONArray annotationsResultJSONArray = new JSONArray();
                        for (int a = 0; a < annotationsJSONArray.length(); a++) {
                            try {
                                JSONObject annotationJSONObject = annotationsJSONArray.getJSONObject(a);
                                String requestToken = annotationJSONObject.getString("requestToken");
                                Annotation annotation;
                                // check to see if this Annotation was posted along with a StudentWork (e.g. CRater)
                                if (annotationJSONObject.isNull("studentWorkId") &&
                                        !annotationJSONObject.isNull("nodeId") &&
                                        !annotationJSONObject.isNull("componentId") &&
                                        savedStudentWorkList.containsKey(
                                                annotationJSONObject.getString("nodeId") + "_" + annotationJSONObject.getString("componentId"))
                                        ) {
                                    // this is an annotation for a StudentWork that we just saved.
                                    String localNotebookItemId = null;  // since this is an annotation on student work, notebook item should be null.
                                    Integer notebookItemId = null;   // since this is an annotation on student work, notebook item should be null.
                                    StudentWork savedStudentWork = savedStudentWorkList.get(annotationJSONObject.getString("nodeId") + "_" + annotationJSONObject.getString("componentId"));
                                    Integer savedStudentWorkId = savedStudentWork.getId();
                                    annotation = vleService.saveAnnotation(
                                            annotationJSONObject.isNull("id") ? null : annotationJSONObject.getInt("id"),
                                            annotationJSONObject.isNull("runId") ? null : annotationJSONObject.getInt("runId"),
                                            annotationJSONObject.isNull("periodId") ? null : annotationJSONObject.getInt("periodId"),
                                            annotationJSONObject.isNull("fromWorkgroupId") ? null : annotationJSONObject.getInt("fromWorkgroupId"),
                                            annotationJSONObject.isNull("toWorkgroupId") ? null : annotationJSONObject.getInt("toWorkgroupId"),
                                            annotationJSONObject.isNull("nodeId") ? null : annotationJSONObject.getString("nodeId"),
                                            annotationJSONObject.isNull("componentId") ? null : annotationJSONObject.getString("componentId"),
                                            savedStudentWorkId,
                                            localNotebookItemId,
                                            notebookItemId,
                                            annotationJSONObject.isNull("type") ? null : annotationJSONObject.getString("type"),
                                            annotationJSONObject.isNull("data") ? null : annotationJSONObject.getString("data"),
                                            annotationJSONObject.isNull("clientSaveTime") ? null : annotationJSONObject.getString("clientSaveTime"));

                                    // send this annotation immediately to the teacher so the Classroom Monitor can be updated
                                    try {
                                        if (webSocketHandler != null && annotation != null) {
                                            WISEWebSocketHandler wiseWebSocketHandler = (WISEWebSocketHandler) webSocketHandler;

                                            if (wiseWebSocketHandler != null) {
                                                // send this message to websockets
                                                JSONObject webSocketMessageJSON = new JSONObject();
                                                webSocketMessageJSON.put("messageType", "newAnnotation");
                                                webSocketMessageJSON.put("messageParticipants", "studentToTeachers");
                                                webSocketMessageJSON.put("annotation", annotation.toJSON());
                                                wiseWebSocketHandler.handleMessage(signedInUser, webSocketMessageJSON.toString());
                                            }
                                        }
                                    } catch (Exception e) {
                                        // if something fails during creating annotation and sending to websocket,
                                        // allow the rest to continue
                                        e.printStackTrace();
                                    }
                                } else {
                                    annotation = vleService.saveAnnotation(
                                            annotationJSONObject.isNull("id") ? null : annotationJSONObject.getInt("id"),
                                            annotationJSONObject.isNull("runId") ? null : annotationJSONObject.getInt("runId"),
                                            annotationJSONObject.isNull("periodId") ? null : annotationJSONObject.getInt("periodId"),
                                            annotationJSONObject.isNull("fromWorkgroupId") ? null : annotationJSONObject.getInt("fromWorkgroupId"),
                                            annotationJSONObject.isNull("toWorkgroupId") ? null : annotationJSONObject.getInt("toWorkgroupId"),
                                            annotationJSONObject.isNull("nodeId") ? null : annotationJSONObject.getString("nodeId"),
                                            annotationJSONObject.isNull("componentId") ? null : annotationJSONObject.getString("componentId"),
                                            annotationJSONObject.isNull("studentWorkId") ? null : annotationJSONObject.getInt("studentWorkId"),
                                            annotationJSONObject.isNull("localNotebookItemId") ? null : annotationJSONObject.getString("localNotebookItemId"),
                                            annotationJSONObject.isNull("notebookItemId") ? null : annotationJSONObject.getInt("notebookItemId"),
                                            annotationJSONObject.isNull("type") ? null : annotationJSONObject.getString("type"),
                                            annotationJSONObject.isNull("data") ? null : annotationJSONObject.getString("data"),
                                            annotationJSONObject.isNull("clientSaveTime") ? null : annotationJSONObject.getString("clientSaveTime"));
                                }

                                // before returning saved Annotation, strip all fields except id, responseToken, and serverSaveTime to minimize response size
                                JSONObject savedAnnotationJSONObject = new JSONObject();
                                savedAnnotationJSONObject.put("id", annotation.getId());
                                savedAnnotationJSONObject.put("requestToken", requestToken);
                                savedAnnotationJSONObject.put("serverSaveTime", annotation.getServerSaveTime().getTime());
                                annotationsResultJSONArray.put(savedAnnotationJSONObject);

                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                        result.put("annotations", annotationsResultJSONArray);
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
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
