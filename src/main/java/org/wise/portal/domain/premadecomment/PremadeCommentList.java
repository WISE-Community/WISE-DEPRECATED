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
package org.wise.portal.domain.premadecomment;

import java.util.Set;

import org.wise.portal.domain.user.User;

/**
 * An Owned object with the added information of a List of
 * PremadeComments
 *
 * @author Patrick Lawler
 */
public interface PremadeCommentList extends Comparable {

  /**
   * @return a list of PremadeComments
   */
  Set<PremadeComment> getPremadeCommentList();

  /**
   * @param premadeCommentList that sets the List of PremadeComments
   */
  void setPremadeCommentList(Set<PremadeComment> premadeCommentList);

  int compareTo(Object premadeCommentList);

  String getLabel();

  void setLabel(String label);

  User getOwner();

  void setOwner(User owner);

  Long getId();

  void setGlobal(boolean global);

  boolean isGlobal();

  Long getProjectId();

  void setProjectId(Long projectId);

  boolean equals(PremadeCommentList premadeCommentList);
}
