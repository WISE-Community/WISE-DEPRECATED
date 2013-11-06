package org.telscenter.sail.webapp.domain.project.impl;

import org.telscenter.sail.webapp.domain.project.FamilyTag;
import org.telscenter.sail.webapp.domain.project.ProjectInfo;


/**
 * Project information associated to TELS Projects
 * @author Carlos
 */
public class ProjectInfoImpl implements ProjectInfo {

	private static final long serialVersionUID = 1L;
	
	private String name;
	private String author;
	private String gradeLevel;
	private String subject;
	private String keywords;
	private String projectLiveCycle;
	private FamilyTag familyTag;
	private boolean isCurrent;
	private String comment;
	private String description;
	private String source;
	
	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}
	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}
	/**
	 * @return the author
	 */
	public String getAuthor() {
		return author;
	}
	/**
	 * @param author the author to set
	 */
	public void setAuthor(String author) {
		this.author = author;
	}
	/**
	 * @return the gradeLevel
	 */
	public String getGradeLevel() {
		return gradeLevel;
	}
	/**
	 * @param gradeLevel the gradeLevel to set
	 */
	public void setGradeLevel(String gradeLevel) {
		this.gradeLevel = gradeLevel;
	}
	/**
	 * @return the subject
	 */
	public String getSubject() {
		return subject;
	}
	/**
	 * @param subject the subject to set
	 */
	public void setSubject(String subject) {
		this.subject = subject;
	}
	/**
	 * @return the keywords
	 */
	public String getKeywords() {
		return keywords;
	}
	/**
	 * @param keywords the keywords to set
	 */
	public void setKeywords(String keywords) {
		this.keywords = keywords;
	}
	/**
	 * @return the projectLiveCycle
	 */
	public String getProjectLiveCycle() {
		return projectLiveCycle;
	}
	/**
	 * @param projectLiveCycle the projectLiveCycle to set
	 */
	public void setProjectLiveCycle(String projectLiveCycle) {
		this.projectLiveCycle = projectLiveCycle;
	}
	/**
	 * @return the familyTag
	 */
	public FamilyTag getFamilyTag() {
		return familyTag;
	}
	/**
	 * @param familyTag the familyTag to set
	 */
	public void setFamilyTag(FamilyTag familyTag) {
		this.familyTag = familyTag;
	}
	
	/**
	 * @return the isCurrent
	 */
	public boolean isCurrent() {
		return isCurrent;
	}

	/**
	 * @param isCurrent the isCurrent to set
	 */
	public void setCurrent(boolean isCurrent) {
		this.isCurrent = isCurrent;
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
	 * @return description
	 */
	public String getDescription() {
		return description;
	}
	
	/**
	 * @param description <code>String</code> description about this project
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * @return the source
	 */
	public String getSource() {
		return source;
	}
	/**
	 * @param source the source to set
	 */
	public void setSource(String source) {
		this.source = source;
	}
}
