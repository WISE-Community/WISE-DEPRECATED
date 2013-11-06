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

import org.telscenter.sail.webapp.domain.Run;

import net.sf.sail.webapp.domain.User;

/**
 * @author patrick lawler
 *
 */
public class PremadeCommentParameters {
	
	private String comment = null;
	
	private String labels = null;
	
	private User owner = null;
	
	private Run run = null;
	
	private boolean global = false;
	
	private long listPosition = 0;

	public PremadeCommentParameters() {

	}
	
	public PremadeCommentParameters(String comment, User owner) {
		this(comment, owner, false, 0, "");
	}
	
	public PremadeCommentParameters(String comment, User owner, boolean global, long listPosition, String labels) {
		this.comment = comment;
		this.owner = owner;
		this.global = global;
		this.listPosition = listPosition;
		this.labels = labels;
	}
	
	/**
	 * @return the comment
	 */
	public String getComment() {
		return comment;
	}

	/**
	 * @param comment the comment to set
	 */
	public void setComment(String comment) {
		this.comment = comment;
	}

	/**
	 * @return the label
	 */
	public String getLabels() {
		return labels;
	}

	/**
	 * @param label the label to set
	 */
	public void setLabels(String labels) {
		this.labels = labels;
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


	public long getListPosition() {
		return listPosition;
	}

	public void setListPosition(long listPosition) {
		this.listPosition = listPosition;
	}	
}
