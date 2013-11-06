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
package org.telscenter.sail.webapp.domain.premadecomment;

import java.util.Set;

import net.sf.sail.webapp.domain.User;

/**
 * An Owned object with the added information of a List of
 * PremadeComments
 * 
 * @author patrick lawler
 */
public interface PremadeCommentList extends Comparable {

	/**
	 * @return a list of PremadeComments
	 */
	public Set<PremadeComment> getPremadeCommentList();
	
	/**
	 * @param premadeCommentList that sets the List of PremadeComments
	 */
	public void setPremadeCommentList(Set<PremadeComment> premadeCommentList);
	
	public int compareTo(Object premadeCommentList);
	
	public String getLabel();
	
	public void setLabel(String label);
	
	public User getOwner();
	
	public void setOwner(User owner);
	
	public Long getId();

	public void setGlobal(boolean global);
	
	public boolean isGlobal();
	
	public Long getProjectId();

	public void setProjectId(Long projectId);
	
	public boolean equals(PremadeCommentList premadeCommentList);
}
