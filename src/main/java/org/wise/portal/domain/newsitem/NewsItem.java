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
package org.wise.portal.domain.newsitem;

import java.util.Date;

import org.wise.portal.domain.user.User;

/**
 * A News Item that contains an unspecified format for the news
 * but includes the date of creation.
 *
 * @author Patrick Lawler
 */
public interface NewsItem {

  /**
   * @return the News Item
   */
  String getNews();

  /**
   * @param news - the News Item to set
   */
  void setNews(String news);

  /**
   * @return the object id
   */
  Integer getId();

  /**
   * @param id - the id to set
   */
  void setId(Integer id);

  /**
   * @return the Date of the News Item
   */
  Date getDate();

  /**
   * @param date - the Date of the News Item to set
   */
  void setDate(Date date);

  /**
   * @return User - the Owner of the News Item
   */
  User getOwner();

  /**
   * @param User - the Owner of the News Item
   */
  void setOwner(User owner);

  /**
   * @return String - the Title of the News Item
   */
  String getTitle();

  /**
   * @param String - the Title of the News Item
   */
  void setTitle(String title);

  /**
   * @return String - the Type of the News Item
   */
  String getType();

  /**
   * @param String - the Type of the News Item
   */
  void setType(String type);
}
