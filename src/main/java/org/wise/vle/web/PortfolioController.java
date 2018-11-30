/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3.
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
package org.wise.vle.web;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.vle.VLEService;
import org.wise.vle.domain.portfolio.Portfolio;

/**
 * Controller for processing requests related to portfolio
 * @author Hiroki Terashima
 * @author Eddie Pan
 */
@Controller
@RequestMapping("/portfolio")
public class PortfolioController {

  @Autowired
  private VLEService vleService;

  @RequestMapping(method = RequestMethod.POST)
  public ModelAndView doPost(
      @RequestParam("action") String action,
      @RequestParam("runId") String runIdStr,
      @RequestParam("workgroupId") String workgroupIdStr,
      HttpServletRequest request,
      HttpServletResponse response) throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    Long runId = new Long(runIdStr);
    Long workgroupId = new Long(workgroupIdStr);
    boolean allowedAccess = isAllowedAcess(signedInUser,runId,workgroupId);

    if (!allowedAccess) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return null;
    }

    if (action.equals("savePortfolio") && runId != null && workgroupId != null) {
      try {
        String portfolioJSONString = request.getParameter("portfolio");
        JSONObject portfolioJSONObject = new JSONObject(portfolioJSONString);
        Portfolio portfolioToSave = new Portfolio(portfolioJSONObject);
        Portfolio lastSavedPortfolio = vleService.getPortfolioByRunIdWorkgroupId(runId, workgroupId);
        if (lastSavedPortfolio == null ||
            (lastSavedPortfolio != null &&
            portfolioToSave.getItems() != null &&
            !portfolioToSave.getItems().equals(lastSavedPortfolio.getItems()))) {
          vleService.savePortfolio(portfolioToSave);
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return null;
  }

  @RequestMapping(method = RequestMethod.GET)
  public ModelAndView doGet(
      HttpServletRequest request,
      HttpServletResponse response) throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    String runIdStr = request.getParameter("runId");
    Long runId = null;
    if (runIdStr != null) {
      try {
        runId = new Long(runIdStr);
      } catch(NumberFormatException e) {
        e.printStackTrace();
      }
    }

    String workgroupIdStr = request.getParameter("workgroupId");
    Long workgroupId = null;
    if (workgroupIdStr != null) {
      try {
        workgroupId = new Long(workgroupIdStr);
      } catch(NumberFormatException e) {
        e.printStackTrace();
      }
    }

    boolean allowedAccess = isAllowedAcess(signedInUser,runId,workgroupId);
    if (!allowedAccess) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return null;
    }

    if (runId != null && workgroupId != null) {
      Portfolio portfolio = vleService.getPortfolioByRunIdWorkgroupId(runId, workgroupId);

      if (portfolio == null) {
        portfolio = new Portfolio(runId,workgroupId);
      }

      if (portfolio != null) {
        String portfolioJSONString = portfolio.toJSONString();
        response.getWriter().print(portfolioJSONString);
      }
    }
    return null;
  }

  /*
   * admins can make a request
   * teachers that are owners of the run can make a request
   * students that are in the run and in the workgroup can make a request
   */
  private boolean isAllowedAcess(User signedInUser, Long runId, Long workgroupId) {
    if (SecurityUtils.isAdmin(signedInUser)) {
      return true;
    } else if (SecurityUtils.isTeacher(signedInUser) &&
        SecurityUtils.isUserOwnerOfRun(signedInUser, runId)) {
      return true;
    } else if (SecurityUtils.isStudent(signedInUser) &&
        SecurityUtils.isUserInRun(signedInUser, runId) &&
        SecurityUtils.isUserInWorkgroup(signedInUser, workgroupId)) {
      return true;
    }
    return false;
  }
}
