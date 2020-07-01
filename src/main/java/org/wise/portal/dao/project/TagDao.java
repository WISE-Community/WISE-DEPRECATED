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
package org.wise.portal.dao.project;

import java.util.List;

import org.wise.portal.dao.SimpleDao;
import org.wise.portal.domain.Tag;
import org.wise.portal.domain.run.Run;

/**
 * @author Patrick Lawler
 */
public interface TagDao<T extends Tag> extends SimpleDao<T> {

  /**
   * Given a <code>String</code> name, returns the <code>Tag</code>
   * with that name if it exists, returns null otherwise.
   *
   * @param String - name
   * @return Tag - tag
   */
  Tag getTagByName(String name);

  /**
   * Given a <code>Integer</code> tagId, removes that tag from the database
   * if it is not used by any projects.
   *
   * @param Integer - tag id
   */
  void removeIfOrphaned(Integer tagId);

  List<Tag> getTags(Run run);

  Tag getTag(Run run, String name);
}
