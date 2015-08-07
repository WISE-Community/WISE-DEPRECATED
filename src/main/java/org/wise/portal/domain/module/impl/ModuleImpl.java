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

import org.wise.portal.domain.module.CurnitVisitor;
import org.wise.portal.domain.module.Module;

/**
 * WISE "Module" domain object. A WISE Module is a Curnit with more
 * information.
 *
 * @author Hiroki Terashima
 * @author Sally Ahn
 */
@Entity
@Table(name = "modules")
public class ModuleImpl extends CurnitImpl implements Module {

	@Transient
	private static final long serialVersionUID = 1L;

    @Column(name = "description")
	private String description;

    @Column(name = "grades")
	private String grades;
    
    @Column(name = "topic_keywords")
	private String topicKeywords;
	
    @Column(name = "total_time")
	private Long totalTime;
	
    @Column(name = "computer_time")
	private Long computerTime;
	
    @Column(name = "tech_reqs")
	private String techReqs;
    
    @Column(name = "authors")
    private String authors;

	@Column(name = "moduleUrl", nullable = false)
	private String moduleUrl;  // url where the module file can be retrieved

	public String getGrades() {
		return grades;
	}

	public void setGrades(String grades) {
		this.grades = grades;
	}

	public String getDescription() {
		return description;
	}

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

	public String getAuthors() {
		return authors;
	}

	public void setAuthors(String authors) {
		this.authors = authors;
	}

	public String getModuleUrl() {
		return moduleUrl;
	}

	public void setModuleUrl(String moduleUrl) {
		this.moduleUrl = moduleUrl;
	}

    public Object accept(CurnitVisitor visitor) {
        return visitor.visit(this);
    }

}
