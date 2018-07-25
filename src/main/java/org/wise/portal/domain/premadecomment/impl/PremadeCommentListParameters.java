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
import java.util.TreeSet;

import lombok.Getter;
import lombok.Setter;
import org.wise.portal.domain.premadecomment.PremadeComment;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;

/**
 * @author Patrick Lawler
 */
public class PremadeCommentListParameters {

  @Getter
  @Setter
  private Set<PremadeComment> list = null;

  @Getter
  @Setter
  private String label = null;

  @Getter
  @Setter
  private User owner = null;

  @Getter
  @Setter
  private Run run = null;

  private boolean global = false;

  @Getter
  @Setter
  private Long projectId = null;

  public PremadeCommentListParameters() {
  }

  public PremadeCommentListParameters(String label, User owner) {
    this(label, owner, false, null);
  }

  public PremadeCommentListParameters(String label, User owner, boolean global, Long projectId) {
    this.label = label;
    this.owner = owner;
    this.global = global;
    this.projectId = projectId;
    this.list = new TreeSet<PremadeComment>();
  }

  public void setGlobal(boolean global) {
    this.global = global;
  }

  public boolean isGlobal() {
    return global;
  }
}
