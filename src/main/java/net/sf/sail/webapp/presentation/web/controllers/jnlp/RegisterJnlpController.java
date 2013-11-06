/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package net.sf.sail.webapp.presentation.web.controllers.jnlp;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.impl.JnlpParameters;
import net.sf.sail.webapp.service.jnlp.JnlpService;

import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;

/**
 * The controller for registering a new jnlp with the portal
 * Note that when a new jnlp is created, we say "register a jnlp",
 * and when a new offering is created, we say "create an offering".
 * This is because a jnlp is a domain that is stored outside of the portal
 * and the offering is created and stored inside the portal.
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class RegisterJnlpController extends SimpleFormController {

	protected JnlpService jnlpService = null;
	
	@Override
    protected ModelAndView onSubmit(HttpServletRequest request,
            HttpServletResponse response, Object command, BindException errors)  {
		JnlpParameters jnlpParameters = (JnlpParameters) command;
		this.jnlpService.createJnlp(jnlpParameters);
		
		return null;
	}

	/**
	 * @param jnlpService the jnlpService to set
	 */
	public void setJnlpService(JnlpService jnlpService) {
		this.jnlpService = jnlpService;
	}
}
