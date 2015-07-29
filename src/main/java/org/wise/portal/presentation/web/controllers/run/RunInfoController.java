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
package org.wise.portal.presentation.web.controllers.run;

import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.service.offering.RunService;

/**
 * Usable by anonymous and logged-in users for retrieving public run information,
 * such as run periods given runcode
 * @author Hiroki Terashima
 */
@Controller
public class RunInfoController {

	@Autowired
	private RunService runService;

	@RequestMapping("/runinfo.html")
	protected ModelAndView handleRequestInternal(
			@RequestParam("runcode") String runcode,
			HttpServletResponse response) throws Exception {

    	ModelAndView modelAndView = null;
    	
    	try {
    		Run run = runService.retrieveRunByRuncode(runcode);

    		Set<Group> periods = run.getPeriods();
    		StringBuffer periodsStr = new StringBuffer();
    		for (Group period : periods) {
    			periodsStr.append(period.getName());
    			periodsStr.append(",");
    		}
    		response.setContentType("text/plain");
    		response.getWriter().print(periodsStr.toString());
    	} catch (ObjectNotFoundException e) {
    		response.setContentType("text/plain");
    		response.getWriter().print("not found");
    	}
        return modelAndView;
	}
}
