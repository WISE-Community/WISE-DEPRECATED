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
package org.telscenter.sail.webapp.service.workgroup;

import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.webservice.http.HttpRestTransport;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

/**
 * An extended <code>WorkgroupService</code> for WISEWorkgroups
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface WISEWorkgroupService extends WorkgroupService {

	/**
	 * Creates a <code>WISEWorkgroup</code> with given parameters
	 * 
	 * @param name
	 * @param members
	 * @param run
	 * @param period
	 * @return the created <code>WISEWorkgroup</code>
	 * @throws ObjectNotFoundException when the curnitmap could not be
	 *     retrieved for the <code>Run</code>
	 */
	public WISEWorkgroup createWISEWorkgroup(String name, Set<User> members, Run run, Group period) throws ObjectNotFoundException;
	
	/**
	 * Generates the url string that users need to go to get the given workgroups' work as PDF
	 * 
	 * @param httpRestTransport
	 * @param request request that was made
	 * @param run <code>Run</code> that the user is in
	 * @param workgroup <code>Workgroup</code> that the user is in
	 * @param retrieveAnnotationBundleUrl
	 * @returnurl String url representation to download the jnlp and start
     *     the project
	 * 
	 * @return
	 */
	public String generateWorkgroupWorkPdfUrlString(HttpRestTransport httpRestTransport, HttpServletRequest request, WISEWorkgroup workgroup);
}
