/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.teacher.management;

import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.impl.ChangeWorkgroupParameters;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.validators.teacher.ChangeWorkgroupParametersValidator;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * @author Sally Ahn
 */
@Controller
@SessionAttributes("changeWorkgroupParameters")
@RequestMapping("/teacher/management/changeworkgroup.html")
public class ChangeWorkgroupController {

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private RunService runService;

  @Autowired
  private UserService userService;

  @Autowired
  protected ChangeWorkgroupParametersValidator changeWorkgroupParametersValidator;

  private static final String STUDENT_PARAM_NAME = "student";

  private static final String WORKGROUPFROM_PARAM_NAME = "workgroupFrom";

  private static final String WORKGROUPS_TO = "workgroupsTo";

  private static final String RUN_ID = "runId";

  private static final String PERIOD_ID = "periodId";

  protected String formView = "/teacher/management/changeworkgroup";

  protected String successView = "/teacher/management/changeworkgroupsuccess";

  /**
   * Called before the page is loaded to initialize values
   * @param model the model object that contains values for the page to use when rendering the view
   * @param request the http request object
   * @return the path of the view to display
   * @throws Exception
   */
  @RequestMapping(method = RequestMethod.GET)
  public String initializeForm(ModelMap model, HttpServletRequest request) throws Exception {
    ChangeWorkgroupParameters params = new ChangeWorkgroupParameters();
    params.setStudent(userService.retrieveUserByUsername(request.getParameter(STUDENT_PARAM_NAME)));
    params.setRunId(Long.parseLong(request.getParameter(RUN_ID)));
    params.setPeriodId(Long.parseLong(request.getParameter(PERIOD_ID)));
    String workgroupFromId = request.getParameter(WORKGROUPFROM_PARAM_NAME);
    if (workgroupFromId == null) {
      params.setWorkgroupFrom(null);
    } else {
      params.setWorkgroupFrom(workgroupService.retrieveById(Long.parseLong(workgroupFromId)));
    }
    model.addAttribute("changeWorkgroupParameters", params);

    List<Workgroup> workgroups = runService
        .getWorkgroups(Long.parseLong(request.getParameter(RUN_ID)),
        Long.parseLong(request.getParameter(PERIOD_ID)));
    model.addAttribute(WORKGROUPS_TO, workgroups);
    return formView;
  }

  /**
   * Called when the user submits the form
   * @param params the object that contains values from the form
   * @param bindingResult the object used for validation in which errors will be stored
   * @return the path of the view to display
   */
  @RequestMapping(method = RequestMethod.POST)
  protected String onSubmit(
      @ModelAttribute("changeWorkgroupParameters") ChangeWorkgroupParameters params,
      BindingResult bindingResult,
      SessionStatus sessionStatus) {
    String view = "";
    changeWorkgroupParametersValidator.validate(params, bindingResult);

    if (bindingResult.hasErrors()) {
      view = formView;
    } else {
      Long workgroupToId = params.getWorkgroupToId();
      try {
        params.setWorkgroupTo(workgroupService.retrieveById(workgroupToId));
      } catch (ObjectNotFoundException e1) {
        params.setWorkgroupTo(null);
        view = formView;
      }

      try {
        workgroupService.updateWorkgroupMembership(params);
        view = successView;
        sessionStatus.setComplete();
      } catch (Exception e){
        e.printStackTrace();
        view = formView;
      }
    }
    return view;
  }
}
