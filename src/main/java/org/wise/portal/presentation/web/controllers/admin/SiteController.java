/**
 * Copyright (c) 2007-2018 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.service.portal.PortalService;

/**
 * Controller for single-page site app built with Angular
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
@Controller
@RequestMapping("/")
public class SiteController {

  @Autowired
  PortalService portalService;

  @GetMapping(value = { "", "/student", "/student/**", "/preview", "/preview/**", "/teacher",
      "/teacher/**", "/login", "/login/**", "/join", "/join/**", "/news", "/about", "/features",
      "/privacy", "/news", "/contact", "/contact/**", "/help", "/help/**", "/forgot",
      "/forgot/**" })
  protected String showSite() {
    return "forward:/site/dist/index.html";
  }

  @ResponseBody
  @GetMapping("/announcement")
  protected String getAnnouncement() throws ObjectNotFoundException {
    Portal portal = portalService.getById(new Integer(1));
    return portal.getAnnouncement();
  }
}
