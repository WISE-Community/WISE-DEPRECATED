/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
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
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.dao.project.impl;

import java.util.List;

import org.springframework.stereotype.Repository;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.project.TagDao;
import org.wise.portal.domain.project.Tag;
import org.wise.portal.domain.project.impl.TagImpl;

/**
 * @author patrick lawler
 * @version $Id:$
 */
@Repository
public class HibernateTagDao extends AbstractHibernateDao<Tag> implements TagDao<Tag>{
	
	private static final String FIND_ALL_QUERY = "from TagImpl";

	@Override
	protected Class<? extends Tag> getDataObjectClass() {
		return TagImpl.class;
	}

	@Override
	protected String getFindAllQuery() {
		return HibernateTagDao.FIND_ALL_QUERY;
	}
	
	/**
	 * @see org.wise.portal.dao.project.TagDao#getTagByName(java.lang.String)
	 */
	@SuppressWarnings("unchecked")
	public Tag getTagByName(String name){
		List<Tag> tags = (List<Tag>) this.getHibernateTemplate().find("select tag from TagImpl tag where tag.name='" + name + "'");
		
		if(tags.size() == 0){
			return null;
		} else {
			return tags.get(0);
		}
	}
	
	/**
	 * 
	 * @param tagId
	 */
	@SuppressWarnings("unchecked")
	public void removeIfOrphaned(Long tagId){
		List<Tag> projects = (List<Tag>) this.getHibernateTemplate().find("select project from ProjectImpl project inner join project.tags tag where tag.id=" + tagId);
		
		if(projects.size() == 0){
			try{
				Tag tag = this.getById(tagId);
				this.delete(tag);
			} catch (ObjectNotFoundException e){
				e.printStackTrace();
			}
		}
	}
}
