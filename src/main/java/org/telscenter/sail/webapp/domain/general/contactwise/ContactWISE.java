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
package org.telscenter.sail.webapp.domain.general.contactwise;

import java.io.Serializable;
import java.util.Properties;

import net.sf.sail.webapp.domain.User;


/**
 * @author Hiroki Terashima
 * @author Geoff Kwan
 *
 * @version $Id$
 */
public interface ContactWISE extends Serializable {
	
	public String getName();
	
	public void setName(String name);
	
	public String getEmail();

	public void setEmail(String email);

	public IssueType getIssuetype();
	
	public void setIssuetype(IssueType issuetype);
	
	public String getSummary();
	
	public void setSummary(String summary);
	
	public String getDescription();
	
	public void setDescription(String description);
	
	public void setEmaillisteners(Properties emaillisteners);
	
	public String[] getMailRecipients();
	
	public String getMailSubject();
	
	public String getMailMessage();
	
	public String[] getMailCcs();

	public void setIsStudent(Boolean isStudent);
	
	public void setIsStudent(User user);
	
	public Boolean getIsStudent();
	
	public String getUsersystem();
	
	public void setUsersystem(String usersystem);
}
