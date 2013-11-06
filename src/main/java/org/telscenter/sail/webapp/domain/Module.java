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
package org.telscenter.sail.webapp.domain;

import java.util.Set;

import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.User;

/**
 * A Module is a WISE implemention of a Curnit.
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface Module extends Curnit {

	public void setGrades(String grades);

	public String getGrades();
	
	public String getTopicKeywords();
	
	public void setTopicKeywords(String topicKeywords);
	
	public void setDescription(String description);
	
	public String getDescription();
	
	public Long getTotalTime();
	
	public void setTotalTime(Long totalTime);
	
	public Long getComputerTime();
	
	public void setComputerTime(Long computerTime);
	
	public String getTechReqs();
	
	public void setTechReqs(String techReqs);
	
	public String getAuthors();
	
	public void setAuthors(String authors);
	
	public Set<User> getOwners();
	
	public void setOwners(Set<User> owners);
	

}
