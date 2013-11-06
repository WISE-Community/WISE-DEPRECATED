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
package org.telscenter.sail.webapp.presentation.web.controllers.student;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.annotation.AnnotationBundle;
import net.sf.sail.webapp.service.annotation.AnnotationBundleService;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

/**
 * Controller to return the AnnotationBundle for the specified <code>Workgroup</code>.
 * 
 * The workgroup id is specified as a request parameters in the url
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public class GetAnnotationBundleController extends AbstractController {

	private static final String ANNOTATION_BUNDLE_KEY = "annotationbundle";

	private AnnotationBundleService annotationBundleService;
	
	private WorkgroupService workgroupService;
	
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		Long workgroupId = Long.decode(request.getParameter("workgroupId"));
		AnnotationBundle annotationBundle = annotationBundleService.getAnnotationBundle(workgroupService.retrieveById(workgroupId));

		ModelAndView modelAndView = new ModelAndView();
		modelAndView.addObject(ANNOTATION_BUNDLE_KEY, annotationBundle.getBundle());

		return modelAndView;
	}

	/**
	 * @param annotationBundleService the annotationBundleService to set
	 */
	public void setAnnotationBundleService(
			AnnotationBundleService annotationBundleService) {
		this.annotationBundleService = annotationBundleService;
	}

	/**
	 * @param workgroupService the workgroupService to set
	 */
	public void setWorkgroupService(WorkgroupService workgroupService) {
		this.workgroupService = workgroupService;
	}

}
