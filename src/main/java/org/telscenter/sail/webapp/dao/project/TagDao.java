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
package org.telscenter.sail.webapp.dao.project;

import net.sf.sail.webapp.dao.SimpleDao;

import org.telscenter.sail.webapp.domain.project.Tag;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public interface TagDao<T extends Tag> extends SimpleDao<T> {

	/**
	 * Given a <code>String</code> name, returns the <code>Tag</code>
	 * with that name if it exists, returns null otherwise.
	 * 
	 * @param String - name
	 * @return Tag - tag
	 */
	public Tag getTagByName(String name);
	
	/**
	 * Given a <code>Long</code> tagId, removes that tag from the database
	 * if it is not used by any projects.
	 * 
	 * @param Long - tag id
	 */
	public void removeIfOrphaned(Long tagId);
}
