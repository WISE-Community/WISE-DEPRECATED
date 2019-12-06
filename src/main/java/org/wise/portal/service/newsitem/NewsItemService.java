/**
 * Copyright (c) 2007-2019 Regents of the University of California (Regents).
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
package org.wise.portal.service.newsitem;

import java.util.Date;
import java.util.List;

import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.domain.user.User;

/**
 * A service for working with <code>NewsItem</code> objects.
 * @author Patrick Lawler
 */
public interface NewsItemService {

  /**
   * Creates a new NewsItem in the data store.
   * @param date date news item was created
   * @param owner user who created this news item
   * @param title news item title
   * @param news news item text
   * @param type news item type
   * @return a NewsItem that was created
   */
  NewsItem createNewsItem(Date date, User owner, String title, String news, String type);

  /**
   * Retrieves all NewsItem from the data store.
   * @return a Set of NewsItem
   */
  List<NewsItem> retrieveAllNewsItem();

  /**
   * Retrieves all NewsItem by specified type
   * @return a Set of NewsItem of specified type
   */
  List<NewsItem> retrieveByType(String type);

  /**
   * Retrieves a NewsItem given an ID
   * @param id <code>Integer</code> id of news item to retrieve
   * @return NewsItem
   * @throws ObjectNotFoundException if news item is not in the datastore
   */
  NewsItem retrieveById(Integer id) throws ObjectNotFoundException;

  /**
   * Updates a NewsItem in the data store.
   * @param id news item id
   * @param date date news item was created
   * @param owner user who created this news item
   * @param title news item title
   * @param news news item text
   * @param type news item type
   * @throws ObjectNotFoundException if news item is not in the datastore
   */
  void updateNewsItem(Integer id, Date date, User owner, String title, String news, String type)
      throws ObjectNotFoundException;

  /**
   * Deletes a NewsItem from the data store.
   * @param id <code>Integer</code> id of the news item
   * @throws ObjectNotFoundException if news item is not in the datastore
   */
  void deleteNewsItem(Integer id) throws ObjectNotFoundException;
}
