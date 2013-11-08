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
package org.telscenter.sail.webapp.service.tag.impl;

import org.springframework.transaction.annotation.Transactional;
import org.telscenter.sail.webapp.dao.project.TagDao;
import org.telscenter.sail.webapp.domain.project.Tag;
import org.telscenter.sail.webapp.domain.project.impl.TagImpl;
import org.telscenter.sail.webapp.service.tag.TagService;
import net.sf.sail.webapp.dao.ObjectNotFoundException;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class TagServiceImpl implements TagService {

	private TagDao<Tag> tagDao;
	
	/**
	 * @see org.telscenter.sail.webapp.service.tag.TagService#getTagById(java.lang.Long)
	 */
	@Transactional(readOnly = true)
	public Tag getTagById(Long id){
		try{
			return this.tagDao.getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
			return null;
		}
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.tag.TagService#createOrGetTag(java.lang.String)
	 */
	@Transactional
	public Tag createOrGetTag(String name){
		/* attempt to retrieve the tag with the given name */
		Tag tag = this.tagDao.getTagByName(name);
		
		/* if it doesn't exist, let's create it */
		if(tag == null){
			tag = new TagImpl();
			tag.setName(name.toLowerCase());
			this.tagDao.save(tag);
		}
		
		/* return the retrieved or created tag */
		return tag;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.tag.TagService#isFromDatabase(org.telscenter.sail.webapp.domain.project.Tag)
	 */
	public boolean isFromDatabase(Tag tag){
		if(tag.getId() == null){
			return false;
		} else {
			return true;
		}
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.tag.TagService#removeIfOrphaned(java.lang.Long)
	 */
	@Transactional
	public void removeIfOrphaned(Long tagId){
		this.tagDao.removeIfOrphaned(tagId);
	}
	
	/**
	 * @param tagDao the tagDao to set
	 */
	public void setTagDao(TagDao<Tag> tagDao) {
		this.tagDao = tagDao;
	}
}
