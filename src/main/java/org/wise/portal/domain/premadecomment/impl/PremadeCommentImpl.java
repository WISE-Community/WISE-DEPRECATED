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

import lombok.Getter;
import lombok.Setter;
import org.wise.portal.domain.premadecomment.PremadeComment;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

/**
 * PremadeComment domain object that is Owned but with the following added
 * information: comment
 *
 * @author Patrick Lawler
 */
@Entity
@Table(name = PremadeCommentImpl.DATA_STORE_NAME)
public class PremadeCommentImpl
    implements PremadeComment, Comparable<PremadeComment> {

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
  @Getter
  @Setter
  private String comment;

  @OneToOne(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
  @JoinColumn(name = PremadeCommentImpl.COLUMN_NAME_OWNER, nullable = true)
  @Getter
  @Setter
  private User owner = null;

  @Column(name = PremadeCommentImpl.COLUMN_NAME_LISTPOSITION, nullable = true)
  @Getter
  @Setter
  private Long listPosition = null;

  @Column(name = PremadeCommentImpl.COLUMN_NAME_LABELS, nullable = true)
  @Getter
  @Setter
  private String labels;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Getter
  @Setter
  private Long id = null;

  public int compareTo(PremadeComment o) {
    int result = 0;

    long thisListPosition = this.getListPosition();
    long otherListPosition = o.getListPosition();

    if (thisListPosition == otherListPosition) {
      result = 0;
    } else if (thisListPosition < otherListPosition) {
      result = -1;
    } else if (thisListPosition > otherListPosition) {
      result = 1;
    }

    return result;
  }
}
