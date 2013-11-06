/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
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
package net.sf.sail.webapp.presentation.web.controllers.offerings;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.impl.OfferingParameters;
import net.sf.sail.webapp.service.offering.OfferingService;

import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.springframework.web.servlet.view.RedirectView;

/**
 * The controller for the create offering page
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class CreateOfferingController extends SimpleFormController {
	
	protected OfferingService offeringService = null;

    /**
     * On submission of the createoffering form, an offering is created and saved to the data
     * store.
     * @throws Exception 
     * 
     * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse, java.lang.Object,
     *      org.springframework.validation.BindException)
     */
    @Override
    protected ModelAndView onSubmit(HttpServletRequest request,
            HttpServletResponse response, Object command, BindException errors) 
            throws Exception {
    	OfferingParameters offeringParameters = (OfferingParameters) command;

    	// TODO: LAW or HT: shouldn't createOffering throw exception?
    	// e.g. CurnitNotFoundException and JNLPNotFoundException
    	// answer: yes
    	try {
			this.offeringService.createOffering(offeringParameters);
		} catch (ObjectNotFoundException e) {
			errors.rejectValue("curnitId", "error.curnit-not_found",
					new Object[] { offeringParameters.getCurnitId() }, 
					"Curnit Not Found.");
			return showForm(request, response, errors);
		}
    	return new ModelAndView(new RedirectView(getSuccessView()));
    }
    
	/**
	 * Sets the offeringService object
	 * 
	 * @param offeringService the offeringService to set
	 */
	public void setOfferingService(OfferingService offeringService) {
		this.offeringService = offeringService;
	}

}
