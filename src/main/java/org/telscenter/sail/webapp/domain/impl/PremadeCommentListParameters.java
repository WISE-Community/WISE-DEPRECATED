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
package org.telscenter.sail.webapp.domain.impl;

import java.util.Set;
import java.util.TreeSet;

import net.sf.sail.webapp.domain.User;

import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeComment;

/**
 * @author patrick lawler
 *
 */
public class PremadeCommentListParameters {

	private Set<PremadeComment> list = null;
	
	private String label = null;
	
	private User owner = null;
	
	private Run run = null;
	
	private boolean global = false;
	
	private Long projectId = null;

	public PremadeCommentListParameters() {
		
	}
			
	public PremadeCommentListParameters(String label, User owner) {
		this(label, owner, false, null);
	}
	
	public PremadeCommentListParameters(String label, User owner, boolean global, Long projectId) {
		this.label = label;
		this.owner = owner;
		this.global = global;
		this.projectId = projectId;
		this.list = new TreeSet<PremadeComment>();
	}
	
	/**
	 * @return the list
	 */
	public Set<PremadeComment> getList() {
		return list;
	}

	/**
	 * @param list the list to set
	 */
	public void setList(Set<PremadeComment> list) {
		this.list = list;
	}

	/**
	 * @return the label
	 */
	public String getLabel() {
		return label;
	}

	/**
	 * @param label the label to set
	 */
	public void setLabel(String label) {
		this.label = label;
	}

	/**
	 * @return the owner
	 */
	public User getOwner() {
		return owner;
	}

	/**
	 * @param owner the owner to set
	 */
	public void setOwner(User owner) {
		this.owner = owner;
	}

	/**
	 * @return the run
	 */
	public Run getRun() {
		return run;
	}

	/**
	 * @param run the run to set
	 */
	public void setRun(Run run) {
		this.run = run;
	}


	public void setGlobal(boolean global) {
		this.global = global;
	}


	public boolean isGlobal() {
		return global;
	}
	
	/**
	 * 
	 * @return
	 */
	public Long getProjectId() {
		return projectId;
	}

	/**
	 * 
	 * @param projectId
	 */
	public void setProjectId(Long projectId) {
		this.projectId = projectId;
	}
}
