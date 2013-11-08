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
package org.telscenter.sail.webapp.domain.grading;

import java.util.Map;
import java.util.Set;

import org.telscenter.pas.emf.pas.EStep;

import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.annotation.AnnotationBundle;
import net.sf.sail.webapp.domain.sessionbundle.SessionBundle;

/**
 * A transfer object for aggregating necessary objects to allow
 * WISE teachers to "grade student work by step".
 * This object encapsulates the following objects:
 * 1) <code>AnnotationBundle</code>
 * 2) <code>ESessionBundle</code>
 * 3) <code>ECurnitmap</code>
 * Only the AnnotationBundle is modifiable and persist-able.
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface GradeWorkByStepAggregate extends GradeWorkAggregate {

	/**
	 * TODO HT comment me
	 * @return
	 */
	public EStep getStep();
	
	/**
	 * TODO HT comment me
	 * @return
	 */
	public void setStep(EStep step);
	
	/**
	 * TODO HT comment me
	 * @return
	 */
	public Map<Workgroup, AnnotationBundle> getAnnotationBundles();

	/**
	 * TODO HT comment me
	 * @return
	 */
	public void setAnnotationBundles(Map<Workgroup, AnnotationBundle> annotationBundles);

	/**
	 * TODO HT comment me
	 * @return
	 */
	public Map<Workgroup, SessionBundle> getSessionBundles();

	/**
	 * TODO HT comment me
	 * @return
	 */
	public void setSessionBundles(Map<Workgroup, SessionBundle> sessionBundles);

	/**
	 * Returns a <code>Set</code> of <code>Workgroup</code> that are contained
	 * in this aggregate.
	 * 
	 * @return set of Workgroups that are in this aggregate
	 */
	public Set<Workgroup> getWorkgroups();
}
