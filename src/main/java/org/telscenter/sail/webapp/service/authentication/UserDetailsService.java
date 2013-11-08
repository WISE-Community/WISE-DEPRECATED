/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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
package org.telscenter.sail.webapp.service.authentication;

import java.util.List;

import net.sf.sail.webapp.domain.authentication.MutableUserDetails;


/**
 * Provides TELS-specific ROLES on top of what is already
 * available in PAS
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface UserDetailsService extends
		net.sf.sail.webapp.service.authentication.UserDetailsService {
	
	public static final String TEACHER_ROLE = "ROLE_TEACHER";
	
	public static final String STUDENT_ROLE = "ROLE_STUDENT";
	
	public static final String AUTHOR_ROLE = "ROLE_AUTHOR";

	public static final String RESEARCHER_ROLE = "ROLE_RESEARCHER";

	public static final String RUN_GRADE_ROLE = "ROLE_RUN_GRADE";
	
	public static final String RUN_READ_ROLE = "ROLE_RUN_READ";
		
	public static final String PROJECT_READ_ROLE = "ROLE_READ_PROJECT";
	
	public static final String PROJECT_WRITE_ROLE = "ROLE_WRITE_PROJECT";

	public static final String PROJECT_SHARE_ROLE = "ROLE_SHARE_PROJECT";

	public List<MutableUserDetails> retrieveAllUserDetails(String userDetailsClassName);

	public List<String> retrieveAllUsernames(String userDetailsClassName);

}
