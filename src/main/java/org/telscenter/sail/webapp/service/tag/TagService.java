/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
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
package org.telscenter.sail.webapp.service.tag;

import org.telscenter.sail.webapp.domain.project.Tag;

/**
 * A Service for tags
 * 
 * @author patrick lawler
 * @version $Id:$
 */
public interface TagService {
	
	/**
	 * Given a <code>Long</code> tag id, returns the tag associated with that
	 * id, returns null if it does not exist.
	 * 
	 * @param Long - id
	 * @return Tag - tag
	 */
	public Tag getTagById(Long id);

	/**
	 * Given a <code>String</code> name, returns the <code>Tag</code> tag with
	 * the given name if it exists, creates and returns one if not.
	 * 
	 * @param String - name
	 * @return Tag - tag
	 */
	public Tag createOrGetTag(String name);
	
	/**
	 * Returns <code>boolean</code> true iff the given <code>Tag</code> tag is
	 * a tag that was retrieved from the database, returns false otherwise.
	 * 
	 * @param Tag - tag
	 * @return boolean
	 */
	public boolean isFromDatabase(Tag tag);
	
	/**
	 * Given a <code>Long</code> tag id of a tag that has just been removed 
	 * from a project, checks to see if this now makes this tag an orphan 
	 * and removes it from the database if it is.
	 * 
	 * @param Long - tag id
	 */
	public void removeIfOrphaned(Long tagId);
}
