/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
package org.wise.portal.service.tag;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.wise.portal.domain.Tag;
import org.wise.portal.domain.run.Run;

/**
 * A Service for tags
 * @author Patrick Lawler
 */
public interface TagService {

  /**
   * Given a <code>Long</code> tag id, returns the tag associated with that
   * id, returns null if it does not exist.
   * @param Integer - id
   * @return Tag - tag
   */
  Tag getTagById(Integer id);

  /**
   * Given a <code>String</code> name, returns the <code>Tag</code> tag with
   * the given name if it exists, creates and returns one if not.
   * @param String - name
   * @return Tag - tag
   */
  Tag createOrGetTag(String name);

  /**
   * Returns <code>boolean</code> true iff the given <code>Tag</code> tag is
   * a tag that was retrieved from the database, returns false otherwise.
   * @param Tag - tag
   * @return boolean
   */
  boolean isFromDatabase(Tag tag);

  /**
   * Given a <code>Long</code> tag id of a tag that has just been removed
   * from a project, checks to see if this now makes this tag an orphan
   * and removes it from the database if it is.
   * @param Integer - tag id
   */
  void removeIfOrphaned(Integer tagId);

  /**
   * Creates a new tag and return it. If one exists with the same run and name, ignore
   */
  Tag createTag(Run run, String name);

  /**
   * Returns tags for a run
   * @param run get the tags for
   * @return Set<tag> set of tags for the specified run
   */
  List<Tag> getTagsForRun(Run run);

  /**
   * Updates existing tag and returns it
   */
  Tag updateTag(Tag tag);

  boolean canEditTag(Authentication auth, Tag tag);

  void deleteTag(Authentication auth, Tag tag);
}
