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

import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.telscenter.sail.webapp.domain.premadecomment.PremadeComment;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeCommentList;

/**
 * 
 * @author patrick lawler
 */

@Entity
@Table(name = PremadeCommentListImpl.DATA_STORE_NAME)
public class PremadeCommentListImpl implements PremadeCommentList, Comparable {
	
    @Transient
    public static final String DATA_STORE_NAME = "premadecommentlists";

    @Transient
    public static final String COLUMN_NAME_LABEL = "label";
    
    @Transient
    public static final String COLUMN_NAME_RUN = "run";
    
    @Transient
    public static final String COLUMN_NAME_OWNER = "owner";
    
    @Transient
    public static final String COLUMN_NAME_PROJECT_ID = "projectId";
    
    @Transient
    public static final long serialVersionUID = 1L;

	private static final String PREMADECOMMENTS_JOIN_TABLE = "premadecomments_related_to_premadecommentlists";
		
	private static final String PREMADECOMMENTSLIST_JOIN_COLUMN_NAME = "premadecommentslist_fk";

	private static final String PREMADECOMMENTS_JOIN_COLUMN_NAME = "premadecomments_fk";
    
    @ManyToMany(targetEntity = PremadeCommentImpl.class, fetch=FetchType.EAGER)
    @JoinTable(name = PREMADECOMMENTS_JOIN_TABLE, joinColumns = {@JoinColumn(name = PREMADECOMMENTSLIST_JOIN_COLUMN_NAME, nullable = false)}, inverseJoinColumns = @JoinColumn(name = PREMADECOMMENTS_JOIN_COLUMN_NAME, nullable=false))
    private Set<PremadeComment> list;

    @Column(name = PremadeCommentImpl.COLUMN_NAME_LABEL, nullable=false)
    private String label;
    
    @OneToOne(targetEntity = UserImpl.class, fetch = FetchType.EAGER)
    @JoinColumn(name = PremadeCommentImpl.COLUMN_NAME_OWNER, nullable = true)
    private User owner = null;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;
    
    @Column(name = PremadeCommentImpl.COLUMN_NAME_GLOBAL, nullable=true)
    private boolean global = false;
    
    @Column(name = COLUMN_NAME_PROJECT_ID, nullable=true)
    private Long projectId = null;

	/**
	 * @return the list of Premade Comments
	 */
	public Set<PremadeComment> getPremadeCommentList() {
		return list;
	}

	/**
	 * @param premadeCommentList the PremadeComment list to set
	 */
	public void setPremadeCommentList(Set<PremadeComment> premadeCommentList) {
		this.list = premadeCommentList;
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

	/**
	 * Compare this list with another list to determine their ordering
	 * in a Set
	 * @see org.telscenter.sail.webapp.domain.premadecomment.PremadeCommentList#compareTo(java.lang.Object)
	 */
	public int compareTo(Object premadeCommentList){
		int result = 0;
		
		if(premadeCommentList != null) {
			//cast the other PremadeCommentList
			PremadeCommentListImpl otherPremadeCommentListImpl = (PremadeCommentListImpl) premadeCommentList;
			
			//get the other label
			String otherLabel = otherPremadeCommentListImpl.getLabel();
			
			if(otherLabel != null) {
				//compare the labels
				result = this.getLabel().compareTo(otherLabel);
			}
			
			if(result == 0) {
				//the labels were the same so we will now use the id to compare
				Long otherId = otherPremadeCommentListImpl.getId();
				
				if(otherId != null) {
					//compare the ids
					result = this.getId().compareTo(otherId);
				}
			}
		}

		return result;
	}

	public void setGlobal(boolean global) {
		this.global = global;
	}

	public boolean isGlobal() {
		return global;
	}
	
	public Long getProjectId() {
		return projectId;
	}

	public void setProjectId(Long projectId) {
		this.projectId = projectId;
	}

	/**
	 * Compares the id of the lists to determine if they are the same
	 * @param premadeCommentList the other premade comment list to compare to
	 * @see org.telscenter.sail.webapp.domain.premadecomment.PremadeCommentList#equals(org.telscenter.sail.webapp.domain.premadecomment.PremadeCommentList)
	 * @return whether the lists have the same ids or not
	 */
	public boolean equals(PremadeCommentList premadeCommentList) {
		//get this list's id
		Long thisId = this.getId();
		
		//see if the ids are the same
		if(thisId != null && thisId.equals(premadeCommentList.getId())) {
			return true;
		}
		
		return false;
	}
}
