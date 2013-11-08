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
package net.sf.sail.webapp.domain.sessionbundle;

import java.util.List;

import net.sf.sail.emf.sailuserdata.ESessionBundle;
import net.sf.sail.webapp.domain.Workgroup;

/**
 * SessonBundle contains a workgroup's data. A SessionBundle encapsulates
 * the xml string representation of the SessionBundle that is gotten from the SDS
 * as well as a reference to the workgroup to which the SessionBundle is for. 
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface SessionBundle {

//	/**
//	 * @param bundleString the bundleString to set
//	 */
//	public void setBundleString(String bundleString);
//
//	/**
//	 * @return the sessionbundle in string format
//	 */
//	public String getBundleString();

	/**
	 * @return <code>Workgroup</code> that owns
	 *     this SessionBundle
	 */
	public Workgroup getWorkgroup();
	
	/**
	 * @param workgroup the <code>Workgroup</code> that owns
	 *     this SessionBundle
	 */
	public void setWorkgroup(Workgroup workgroup);
	
	/**
	 * Returns this <code>SessionBundle<code> represented as an
	 * <code>ESessionBundle</code> object.
	 * 
	 * @return <code>ESessionBundle</code>
	 */
	public ESessionBundle getESessionBundle();
	
	/**
	 * Sets this <code>SessionBundle<code> represented as an
	 * <code>ESessionBundle</code> object.
	 * 
	 * @param <code>ESessionBundle</code>
	 */
	public void setESessionBundle(ESessionBundle eSessionBundle);
}
