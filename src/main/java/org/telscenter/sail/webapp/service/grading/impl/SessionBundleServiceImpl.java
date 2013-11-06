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
package org.telscenter.sail.webapp.service.grading.impl;

import java.util.ArrayList;
import java.util.List;

import net.sf.sail.emf.sailuserdata.EPortfolio;
import net.sf.sail.emf.sailuserdata.ESessionBundle;
import net.sf.sail.emf.sailuserdata.util.PortfolioLoader;
import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.sds.SdsWorkgroupDao;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;
import net.sf.sail.webapp.domain.sessionbundle.SessionBundle;
import net.sf.sail.webapp.domain.sessionbundle.impl.SessionBundleImpl;

import org.eclipse.emf.common.util.EList;
import org.telscenter.sail.webapp.service.grading.SessionBundleService;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class SessionBundleServiceImpl implements SessionBundleService {

	private SdsWorkgroupDao sdsWorkgroupDao;
	
	/**
	 * @see org.telscenter.sail.webapp.service.grading.SessionBundleService#getSessionBundle(java.lang.Long, net.sf.sail.webapp.domain.Workgroup)
	 */
//	public SessionBundle getSessionBundle(Long runId, Workgroup workgroup) throws ObjectNotFoundException {
//
//		// get most-recent SessionBundle from SDS.
//		SdsWorkgroup sdsWorkgroupWithSessionBundle = sdsWorkgroupDao.getById(workgroup.getSdsWorkgroup().getSdsObjectId());
//		SessionBundle sessionBundle = new SessionBundleImpl();
//		sessionBundle.setBundleString(sdsWorkgroupWithSessionBundle.getSdsSessionBundle());
//		sessionBundle.setWorkgroup(workgroup);
//		return sessionBundle;
//	}

	/**
	 * @see org.telscenter.sail.webapp.service.grading.SessionBundleService#getSessionBundles(java.lang.Long, net.sf.sail.webapp.domain.Workgroup)
	 */
	public List<SessionBundle> getSessionBundles(Long runId, Workgroup workgroup)
			throws ObjectNotFoundException {
		SdsWorkgroup sdsWorkgroupWithSessionBundle = sdsWorkgroupDao.getById(workgroup.getSdsWorkgroup().getSdsObjectId());
		List<SessionBundle> sessionBundles = new ArrayList<SessionBundle>();
		String sdsSessionBundleString = sdsWorkgroupWithSessionBundle.getSdsSessionBundle();
		EPortfolio portfolio = PortfolioLoader.loadPortfolio(sdsSessionBundleString);
		EList eSessionBundles = portfolio.getSessionBundles();

		for (int i = 0; i < eSessionBundles.size(); i++) {
			ESessionBundle eSessionBundle = (ESessionBundle) eSessionBundles.get(i);
			SessionBundle sessionBundle = new SessionBundleImpl();
			sessionBundle.setESessionBundle(eSessionBundle);
			sessionBundle.setWorkgroup(workgroup);
			sessionBundles.add(sessionBundle);
		}
		
		return sessionBundles;
	}

	/**
	 * @param sdsWorkgroupDao the sdsWorkgroupDao to set
	 */
	public void setSdsWorkgroupDao(SdsWorkgroupDao sdsWorkgroupDao) {
		this.sdsWorkgroupDao = sdsWorkgroupDao;
	}
}
