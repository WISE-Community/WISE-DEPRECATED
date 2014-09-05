/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
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
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.domain.project;

import java.io.Serializable;

/**
 * Information associated with a particular <code>Project</code>
 * 
 * @author Carlos
 */
public interface ProjectInfo extends Serializable {

	/**
	 * @return name of the project
	 */
	public String getName();

	/**
	 * @param name of the project
	 */
	public void setName(String name);

	/**
	 * @return the author
	 */
	public String getAuthor();

	/**
	 * @param author the author to set
	 */
	public void setAuthor(String author);
	
	/**
	 * @return the gradeLevel
	 */
	public String getGradeLevel();
	
	/**
	 * @param gradeLevel the gradeLevel to set
	 */
	public void setGradeLevel(String gradeLevel);
	
	/**
	 * @return the subject
	 */
	public String getSubject();
	
	/**
	 * @param subject the subject to set
	 */
	public void setSubject(String subject);
	
	/**
	 * @return the keywords
	 */
	public String getKeywords();
	
	/**
	 * @param keywords the keywords to set
	 */
	public void setKeywords(String keywords);
	
	/**
	 * @return the projectLiveCycle
	 */
	public String getProjectLiveCycle();
	
	/**
	 * @param projectLiveCycle the projectLiveCycle to set
	 */
	public void setProjectLiveCycle(String projectLiveCycle);
	
	/**
	 * @return the familyTag
	 */
	public FamilyTag getFamilyTag();
	
	/**
	 * @param familyTag the familyTag to set
	 */
	public void setFamilyTag(FamilyTag familyTag);
	
	/**
	 * @return the isCurrent
	 */
	public boolean isCurrent();

	/**
	 * @param isCurrent the isCurrent to set
	 */
	public void setCurrent(boolean isCurrent);
	
	/**
	 * @param comment the comment to set
	 */
	public void setComment(String comment);
	
	/**
	 * @return comment
	 */
	public String getComment();
	
	/**
	 * @param description the description to set
	 */
	public void setDescription(String description);

	/**
	 * @return description
	 */
	public String getDescription();
	
	/**
	 * @return
	 */
	public String getSource();
	
	/**
	 * @return
	 */
	public void setSource(String source);
	
}
