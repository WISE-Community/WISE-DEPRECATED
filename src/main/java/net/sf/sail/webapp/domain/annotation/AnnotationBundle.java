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
package net.sf.sail.webapp.domain.annotation;

import net.sf.sail.emf.sailuserdata.EAnnotationBundle;
import net.sf.sail.webapp.domain.Persistable;
import net.sf.sail.webapp.domain.Workgroup;

/**
 * AnnotationBundle domain object interface. An AnnotationBundle encapsulates
 * the xml string representation of the PAS AnnotationBundle as well as a reference
 * to the workgroup to which the AnnotationBundle is for. 
 * For reference on PAS AnnotationBundle, look at
 * http://www.telscenter.org/confluence/display/SAIL/EMFBundleAnnotationService
 *
 * @author Hiroki Terashima
 * @author Laurel Williams
 * @version $Id$
 */
public interface AnnotationBundle extends Persistable {

	/**
	 * @return the annotation bundle
	 */
	public String getBundle();
	
	/**
	 * @param bundle
	 *     the bundle to set
	 */
	public void setBundle(String bundle);
	
	/**
	 * @return <code>Workgroup</code> that owns
	 *     this AnnotationBundle
	 */
	public Workgroup getWorkgroup();
	
	/**
	 * @param workgroup the <code>Workgroup</code> that owns this
	 *     AnnotationBundle
	 */
	public void setWorkgroup(Workgroup workgroup);

	/**
	 * Returns this <code>AnnotationBundle</code> represented as an
	 * <code>EAnnotationBundle</code> object.
	 * 
	 * <code>bundle</code> must be set before calling this method.
	 * If it is no set, the behavior of this method is undefined.
	 * 
	 * @return <code>EAnnotationBundle</code>
	 */
	public EAnnotationBundle getEAnnotationBundle();
	
}
