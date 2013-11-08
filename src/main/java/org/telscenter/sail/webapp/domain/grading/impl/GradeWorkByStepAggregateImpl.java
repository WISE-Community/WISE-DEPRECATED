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
package org.telscenter.sail.webapp.domain.grading.impl;

import java.util.Map;
import java.util.Set;

import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.annotation.AnnotationBundle;
import net.sf.sail.webapp.domain.sessionbundle.SessionBundle;

import org.telscenter.pas.emf.pas.EStep;
import org.telscenter.sail.webapp.domain.grading.GradeWorkByStepAggregate;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class GradeWorkByStepAggregateImpl extends GradeWorkAggregateImpl
		implements GradeWorkByStepAggregate {
	
	protected EStep step;
	
	protected Map<Workgroup, SessionBundle> sessionBundles;

	protected Map<Workgroup, AnnotationBundle> annotationBundles;

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.GradeWorkByStepAggregate#getStep()
	 */
	public EStep getStep() {
		return step;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.GradeWorkByStepAggregate#setStep(EStep)
	 */
	public void setStep(EStep step) {
		this.step = step;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.domain.grading.GradeWorkByStepAggregate#getAnnotationBundles()
	 */
	public Map<Workgroup, AnnotationBundle> getAnnotationBundles() {
		return annotationBundles;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.domain.grading.GradeWorkByStepAggregate#setAnnotationBundles(Map)
	 */
	public void setAnnotationBundles(
			Map<Workgroup, AnnotationBundle> annotationBundles) {
		this.annotationBundles = annotationBundles;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.domain.grading.GradeWorkByStepAggregate#getSessionBundles()
	 */
	public Map<Workgroup, SessionBundle> getSessionBundles() {
		return sessionBundles;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.GradeWorkByStepAggregate#setSessionBundles(Map)
	 */
	public void setSessionBundles(Map<Workgroup, SessionBundle> sessionBundles) {
		this.sessionBundles = sessionBundles;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.GradeWorkByStepAggregate#getWorkgroups()
	 */
	public Set<Workgroup> getWorkgroups() {
		// getting the workgroups from annotationbundles or sessionbundles
		// would be ok
		return getAnnotationBundles().keySet();
	}
}
