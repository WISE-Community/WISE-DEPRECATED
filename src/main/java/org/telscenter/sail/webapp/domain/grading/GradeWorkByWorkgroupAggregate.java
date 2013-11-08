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

import java.util.List;

import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.annotation.AnnotationBundle;
import net.sf.sail.webapp.domain.sessionbundle.SessionBundle;

/**
 * A transfer object for aggregating necessary objects to allow
 * WISE teachers to "grade student work by workgroup".
 * This object encapsulates the following objects:
 * 1) <code>AnnotationBundle</code>
 * 2) <code>ESessionBundle</code>
 * 3) <code>ECurnitmap</code>
 * Only the AnnotationBundle is modifiable and persist-able.
 *  
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface GradeWorkByWorkgroupAggregate extends GradeWorkAggregate {

	/**
	 * @return the AnnotationBundle belonging to the workgroup
	 */
	public AnnotationBundle getAnnotationBundle();

	/**
	 * @param annotationBundle the annotationbundle to set
	 */
	public void setAnnotationBundle(AnnotationBundle annotationBundle);

	/**
	 * @return the SessionBundles belonging to the workgroup
	 */
	public List<SessionBundle> getSessionBundles();

	/**
	 * @param the SessionBundle to set
	 */
	public void setSessionBundles(List<SessionBundle> sessionBundles);
	
	/**
	 * @return the workgroup to grade
	 */
	public Workgroup getWorkgroup();

	/**
	 * @param workgroup the workgroup to set
	 */
	public void setWorkgroup(Workgroup workgroup);
}
