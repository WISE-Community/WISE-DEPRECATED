/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
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
package org.telscenter.sail.webapp.service.newsitem;

import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;

import org.telscenter.sail.webapp.domain.impl.NewsItemParameters;
import org.telscenter.sail.webapp.domain.newsitem.NewsItem;

/**
 * A service for working with <code>NewsItem</code> objects.
 * 
 * @author patrick lawler
 *
 */
public interface NewsItemService {
	
	/**
	 * creates a new NewsItem in the data store.
	 * 
	 * @param params <code>NewsItemParameters</code>
	 * @return a NewsItem
	 */
	public NewsItem createNewsItem(NewsItemParameters params);
	
	
	/**
	 * deletes a NewsItem from the data store.
	 * 
	 * @param newsItemId <code>Long</code>
	 */
	public void deleteNewsItem(Long newsItemId);
	
	/**
	 * Updates a NewsItem in the data store.
	 * 
	 * @param newsItemParameters <code>NewsItemParameters</code>
	 * @param id <code>Long</code>
	 * @return an updated NewsItem
	 * @throws ObjectNotFoundException 
	 */
	public NewsItem updateNewsItem(Long id, NewsItemParameters params) throws ObjectNotFoundException;
	
	/**
	 * retrieves all NewsItem from the data store.
	 * 
	 * @return a Set of NewsItem
	 */
	public Set<NewsItem> retrieveAllNewsItem();
	
	/**
	 * retrieves a NewsItem given an ID
	 * 
	 * @param newsItemId <code>Long</code>
	 * @return NewsItem
	 * @throws ObjectNotFoundException
	 */
	public NewsItem retrieveById(Long id) throws ObjectNotFoundException;
	
	/**
	 * retrieves the newest NewsItem
	 * 
	 * @return NewsItem
	 */
	public NewsItem retrieveLatest() throws ObjectNotFoundException;

}
