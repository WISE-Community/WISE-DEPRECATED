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

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.CurnitImpl;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.telscenter.sail.webapp.domain.Module;

/**
 * WISE "Project" domain object. A WISE Project is a Curnit with more
 * information.
 *
 * @author Hiroki Terashima
 * @author Sally
 * 
 * @version $Id$
 */
@Entity
@Table(name = ModuleImpl.DATA_STORE_NAME)
@Inheritance(strategy = InheritanceType.JOINED)
public class ModuleImpl extends CurnitImpl implements Module {

	@Transient
	public static final String DATA_STORE_NAME = "modules";
	
    @Transient
    public static final String COLUMN_NAME_DESCRIPTION = "description";

    @Transient
    public static final String COLUMN_NAME_GRADES = "grades";
    
    @Transient
    public static final String COLUMN_NAME_TOPICKEYWORDS = "topic_keywords";

    @Transient
    public static final String COLUMN_NAME_COMPUTERTIME = "computer_time";
    
    @Transient
    public static final String COLUMN_NAME_TOTALTIME = "total_time";
    
    @Transient
    public static final String COLUMN_NAME_TECHREQS = "tech_reqs";
    
    @Transient
    public static final String PROJECTS_JOIN_COLUMN_NAME = "module_fk";

    @Transient
    public static final String OWNERS_JOIN_TABLE_NAME = "modules_related_to_owners";
    
    @Transient
    public static final String OWNERS_JOIN_COLUMN_NAME = "owners_fk";

    @Transient
	private static final String COLUMN_NAME_AUTHORS = "authors";

	@Transient
	private static final long serialVersionUID = 1L;

    @Column(name = ModuleImpl.COLUMN_NAME_DESCRIPTION)
	private String description;

    @Column(name = ModuleImpl.COLUMN_NAME_GRADES)
	private String grades;
    
    @Column(name = ModuleImpl.COLUMN_NAME_TOPICKEYWORDS)
	private String topicKeywords;
	
    @Column(name = ModuleImpl.COLUMN_NAME_TOTALTIME)
	private Long totalTime;
	
    @Column(name = ModuleImpl.COLUMN_NAME_COMPUTERTIME)
	private Long computerTime;
	
    @Column(name = ModuleImpl.COLUMN_NAME_TECHREQS)
	private String techReqs;
    
    @Column(name = ModuleImpl.COLUMN_NAME_AUTHORS)
    private String authors;
	
    @ManyToMany(targetEntity = UserImpl.class, fetch = FetchType.EAGER)
    @JoinTable(name = OWNERS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name = PROJECTS_JOIN_COLUMN_NAME) }, inverseJoinColumns = @JoinColumn(name = OWNERS_JOIN_COLUMN_NAME))
	private Set<User> owners;
		
	public String getGrades() {
		return grades;
	}

	/**
	 * @param grades
	 */
	public void setGrades(String grades) {
		this.grades = grades;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.Module#getDescription()
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.Module#setDescription(java.lang.String)
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	public Long getComputerTime() {
		return computerTime	;
	}

	public Long getTotalTime() {
		return totalTime;
	}

	public void setComputerTime(Long computerTime) {
		this.computerTime = computerTime;
	}

	public void setTotalTime(Long totalTime) {
		this.totalTime = totalTime;
	}

	public Set<User> getOwners() {
		return owners;
	}

	public String getTechReqs() {
		return techReqs;
	}

	public void setOwners(Set<User> owners) {
		this.owners = owners;
	}

	public void setTechReqs(String techReqs) {
		this.techReqs = techReqs;
	}

	public String getTopicKeywords() {
		return topicKeywords;
	}

	public void setTopicKeywords(String topicKeywords) {
		this.topicKeywords = topicKeywords;
	}

	/**
	 * @return the authors
	 */
	public String getAuthors() {
		return authors;
	}

	/**
	 * @param authors the authors to set
	 */
	public void setAuthors(String authors) {
		this.authors = authors;
	}

}
