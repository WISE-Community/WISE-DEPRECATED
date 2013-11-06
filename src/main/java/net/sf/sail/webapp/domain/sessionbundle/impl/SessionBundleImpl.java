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
package net.sf.sail.webapp.domain.sessionbundle.impl;

import java.util.List;

import org.eclipse.emf.common.util.EList;

import net.sf.sail.emf.sailuserdata.EPortfolio;
import net.sf.sail.emf.sailuserdata.ESessionBundle;
import net.sf.sail.emf.sailuserdata.ESockPart;
import net.sf.sail.emf.sailuserdata.util.PortfolioLoader;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.sessionbundle.SessionBundle;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class SessionBundleImpl implements SessionBundle {

//	private String bundleString;
	
    private Workgroup workgroup;
    
    private ESessionBundle eSessionBundle;
	
//	/**
//	 * @see net.sf.sail.webapp.domain.sessionbundle.SessionBundle#getBundleString()
//	 */
//	public String getBundleString() {
//		return bundleString;
//	}
//
//	/**
//	 * @see net.sf.sail.webapp.domain.sessionbundle.SessionBundle#setBundleString(java.lang.String)
//	 */
//	public void setBundleString(String bundleString) {
//		this.bundleString = bundleString;
//	}

	/**
	 * @see net.sf.sail.webapp.domain.sessionbundle.SessionBundle#getWorkgroup()
	 */
	public Workgroup getWorkgroup() {
		return workgroup;
	}

	/**
	 * @see net.sf.sail.webapp.domain.sessionbundle.SessionBundle#setWorkgroup(net.sf.sail.webapp.domain.Workgroup)
	 */
	public void setWorkgroup(Workgroup workgroup) {
		this.workgroup = workgroup;
	}

	/**
	 * @see net.sf.sail.webapp.domain.sessionbundle.SessionBundle#getESessionBundle()
	 */
	public ESessionBundle getESessionBundle() {
		return eSessionBundle;
	}

	/**
	 * @see net.sf.sail.webapp.domain.sessionbundle.SessionBundle#setESessionBundle(net.sf.sail.emf.sailuserdata.ESessionBundle)
	 */
	public void setESessionBundle(ESessionBundle eSessionBundle) {
		this.eSessionBundle = eSessionBundle;
	}

}
