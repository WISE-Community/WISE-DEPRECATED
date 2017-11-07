/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
package org.wise.portal.domain.project;

import java.io.Serializable;

/**
 * Information associated with a particular <code>Project</code>
 *
 * @author Carlos Celorrio
 */
public interface ProjectInfo extends Serializable {

  /**
   * @return name of the project
   */
  String getName();

  /**
   * @param name of the project
   */
  void setName(String name);

  /**
   * @return the author
   */
  String getAuthor();

  /**
   * @param author the author to set
   */
  void setAuthor(String author);

  /**
   * @return the gradeLevel
   */
  String getGradeLevel();

  /**
   * @param gradeLevel the gradeLevel to set
   */
  void setGradeLevel(String gradeLevel);

  /**
   * @return the subject
   */
  String getSubject();

  /**
   * @param subject the subject to set
   */
  void setSubject(String subject);

  /**
   * @return the keywords
   */
  String getKeywords();

  /**
   * @param keywords the keywords to set
   */
  void setKeywords(String keywords);

  /**
   * @return the projectLiveCycle
   */
  String getProjectLiveCycle();

  /**
   * @param projectLiveCycle the projectLiveCycle to set
   */
  void setProjectLiveCycle(String projectLiveCycle);

  /**
   * @return the familyTag
   */
  FamilyTag getFamilyTag();

  /**
   * @param familyTag the familyTag to set
   */
  void setFamilyTag(FamilyTag familyTag);

  /**
   * @return the isCurrent
   */
  boolean isCurrent();

  /**
   * @param isCurrent the isCurrent to set
   */
  void setCurrent(boolean isCurrent);

  /**
   * @param comment the comment to set
   */
  void setComment(String comment);

  /**
   * @return comment
   */
  String getComment();

  /**
   * @param description the description to set
   */
  void setDescription(String description);

  /**
   * @return description
   */
  String getDescription();

  /**
   * @return
   */
  String getSource();

  /**
   * @return
   */
  void setSource(String source);
}
