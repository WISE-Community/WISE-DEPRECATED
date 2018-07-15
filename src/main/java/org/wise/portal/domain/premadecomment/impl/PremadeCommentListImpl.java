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
package org.wise.portal.domain.premadecomment.impl;

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

import lombok.Getter;
import lombok.Setter;
import org.wise.portal.domain.premadecomment.PremadeComment;
import org.wise.portal.domain.premadecomment.PremadeCommentList;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

/**
 * @author Patrick Lawler
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

  @ManyToMany(targetEntity = PremadeCommentImpl.class, fetch=FetchType.LAZY)
  @JoinTable(name = PREMADECOMMENTS_JOIN_TABLE, joinColumns = {@JoinColumn(name = PREMADECOMMENTSLIST_JOIN_COLUMN_NAME, nullable = false)}, inverseJoinColumns = @JoinColumn(name = PREMADECOMMENTS_JOIN_COLUMN_NAME, nullable=false))
  private Set<PremadeComment> list;

  @Column(name = PremadeCommentImpl.COLUMN_NAME_LABEL, nullable=false)
  @Getter
  @Setter
  private String label;

  @OneToOne(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
  @JoinColumn(name = PremadeCommentImpl.COLUMN_NAME_OWNER, nullable = true)
  @Getter
  @Setter
  private User owner = null;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Getter
  @Setter
  private Long id = null;

  @Column(name = PremadeCommentImpl.COLUMN_NAME_GLOBAL, nullable = true)
  @Getter
  @Setter
  private boolean global = false;

  @Column(name = COLUMN_NAME_PROJECT_ID, nullable = true)
  @Getter
  @Setter
  private Long projectId = null;

  public Set<PremadeComment> getPremadeCommentList() {
  return list;
}

  public void setPremadeCommentList(Set<PremadeComment> premadeCommentList) {
    this.list = premadeCommentList;
  }

  /**
   * Compare this list with another list to determine their ordering in a Set
   */
  public int compareTo(Object premadeCommentList){
    int result = 0;
    if (premadeCommentList != null) {
      PremadeCommentListImpl otherPremadeCommentListImpl = (PremadeCommentListImpl) premadeCommentList;
      String otherLabel = otherPremadeCommentListImpl.getLabel();
      if (otherLabel != null) {
        result = this.getLabel().compareTo(otherLabel);
      }
      if (result == 0) {
        Long otherId = otherPremadeCommentListImpl.getId();
        if (otherId != null) {
          result = this.getId().compareTo(otherId);
        }
      }
    }
    return result;
  }

  /**
   * Compares the id of the lists to determine if they are the same
   * @param premadeCommentList the other premade comment list to compare to
   * @see org.wise.portal.domain.premadecomment.PremadeCommentList#equals(org.wise.portal.domain.premadecomment.PremadeCommentList)
   * @return whether the lists have the same ids or not
   */
  public boolean equals(PremadeCommentList premadeCommentList) {
    Long thisId = this.getId();
    if (thisId != null && thisId.equals(premadeCommentList.getId())) {
      return true;
    }
    return false;
  }
}
