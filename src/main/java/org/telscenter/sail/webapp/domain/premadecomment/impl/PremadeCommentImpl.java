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
package org.telscenter.sail.webapp.domain.premadecomment.impl;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeComment;


/**
 * PremadeComment domain object that is Owned but
 * with the following added information: comment
 * 
 * @author patrick lawler
 */

@Entity
@Table(name = PremadeCommentImpl.DATA_STORE_NAME)
public class PremadeCommentImpl implements PremadeComment, Comparable<PremadeComment>{

    @Transient
    public static final String DATA_STORE_NAME = "premadecomments";

    @Transient
    public static final String COLUMN_NAME_COMMENT = "comment";
    
    @Transient
    public static final String COLUMN_NAME_LABEL = "label";
    
    @Transient
    public static final String COLUMN_NAME_OWNER = "owner";
    
    @Transient
    public static final String COLUMN_NAME_GLOBAL = "global";
    
    @Transient
    public static final String COLUMN_NAME_LISTPOSITION = "listposition";
    
    @Transient
    public static final String COLUMN_NAME_LABELS = "labels";
    
    @Transient
    public static final long serialVersionUID = 1L;
    
    @Column(name = PremadeCommentImpl.COLUMN_NAME_COMMENT, nullable = false)
    private String comment;
    
    @OneToOne(targetEntity = UserImpl.class, fetch = FetchType.EAGER)
    @JoinColumn(name = PremadeCommentImpl.COLUMN_NAME_OWNER, nullable = true)
    private User owner = null;
    
    @Column(name = PremadeCommentImpl.COLUMN_NAME_LISTPOSITION, nullable = true)
    private Long listPosition = null;
    
    @Column(name = PremadeCommentImpl.COLUMN_NAME_LABELS, nullable = true)
    private String labels;

	@Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;
    
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
	 * @return the id
	 */
	public Long getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	public void setId(Long id) {
		this.id = id;
	}
    
    public Long getListPosition() {
		return listPosition;
	}

	public void setListPosition(Long listPosition) {
		this.listPosition = listPosition;
	}
	
	public String getLabels() {
		return labels;
	}

	public void setLabels(String labels) {
		this.labels = labels;
	}
	
	public int compareTo(PremadeComment o) {
		int result = 0;
		
		long thisListPosition = this.getListPosition();
		long otherListPosition = o.getListPosition();
		
		if(thisListPosition == otherListPosition) {
			result = 0;
		} else if(thisListPosition < otherListPosition) {
			result = -1;
		} else if(thisListPosition > otherListPosition) {
			result = 1;
		}
		
		return result;
	}
}
