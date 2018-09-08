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

import lombok.Getter;
import lombok.Setter;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;

/**
 * @author Patrick Lawler
 */
public class PremadeCommentParameters {

  @Getter
  @Setter
  private String comment = null;

  @Getter
  @Setter
  private String labels = null;

  @Getter
  @Setter
  private User owner = null;

  @Getter
  @Setter
  private Run run = null;

  private boolean global = false;

  @Getter
  @Setter
  private long listPosition = 0;

  public PremadeCommentParameters() {
  }

  public PremadeCommentParameters(String comment, User owner) {
    this(comment, owner, false, 0, "");
  }

  public PremadeCommentParameters(String comment, User owner, boolean global, long listPosition, String labels) {
    this.comment = comment;
    this.owner = owner;
    this.global = global;
    this.listPosition = listPosition;
    this.labels = labels;
  }

  public void setGlobal(boolean global) {
    this.global = global;
  }

  public boolean isGlobal() {
    return global;
  }
}
