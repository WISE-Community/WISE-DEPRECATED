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
package org.wise.portal.presentation.web.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.portal.PortalStatistics;
import org.wise.portal.service.portal.PortalStatisticsService;
import org.wise.vle.domain.statistics.VLEStatistics;

/**
 * Controller for handling WISE statistics page
 * 
 * @author Geoffrey Kwan
 */
@Controller
@RequestMapping("/pages/statistics.html")
public class StatisticsController {

  @Autowired
  private PortalStatisticsService portalStatisticsService;

  @GetMapping
  protected ModelAndView getStatisticsPage(HttpServletRequest request, HttpServletResponse response)
      throws Exception {
    String typeParam = request.getParameter("type");
    if ("portal".equals(typeParam)) {
      List<PortalStatistics> portalStatisticsList = portalStatisticsService.getPortalStatistics();
      JSONArray portalStatisticsArray = new JSONArray();
      for (PortalStatistics portalStatistics : portalStatisticsList) {
        JSONObject portalStatisticsJSONObject = portalStatistics.getJSONObject();
        portalStatisticsArray.put(portalStatisticsJSONObject);
      }
      response.getWriter().write(portalStatisticsArray.toString());
      return null;
    } else {
      ModelAndView modelAndView = new ModelAndView();
      modelAndView.addObject("wiseBaseURL", request.getContextPath());
      return modelAndView;
    }
  }
}
