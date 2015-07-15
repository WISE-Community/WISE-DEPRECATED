/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 * 
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.domain.module.impl;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.wise.portal.domain.module.Module;

/**
 * WISE "Project" domain object. A WISE Project is a Curnit with more
 * information.
 *
 * @author Hiroki Terashima
 * @author Sally Ahn
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
	 * @see org.wise.portal.domain.Module#getDescription()
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @see org.wise.portal.domain.Module#setDescription(java.lang.String)
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

	public String getTechReqs() {
		return techReqs;
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
