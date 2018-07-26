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
package org.wise.portal.domain.newsitem.impl;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import lombok.Getter;
import lombok.Setter;
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

/**
 * NewsItem domain object that contains a String: news item,
 * Long: id and Date: date
 *
 * @author Patrick Lawler
 */
@Entity
@Table(name = NewsItemImpl.DATA_STORE_NAME)
@Getter
@Setter
public class NewsItemImpl implements NewsItem, Comparable<NewsItem> {

  @Transient
  public static final String DATA_STORE_NAME = "newsitem";

  @Transient
  public static final String COLUMN_NAME_NEWS = "news";

  @Transient
  public static final String COLUMN_NAME_DATE = "date";

  @Transient
  public static final String JOIN_COLUMN_NAME_OWNER = "owner";

  @Transient
  public static final String COLUMN_NAME_TITLE = "title";

  @Transient
  public static final String COLUMN_NAME_TYPE = "type";

  @Transient
  private static final long serialVersionUID = 1L;

  @Column(name = NewsItemImpl.COLUMN_NAME_NEWS, length=64000, columnDefinition = "text", nullable = false)
  private String news = null;

  @Column(name = NewsItemImpl.COLUMN_NAME_DATE, nullable = false)
  private Date date = null;

  @ManyToOne(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
  @JoinColumn(name = NewsItemImpl.JOIN_COLUMN_NAME_OWNER, nullable = false, unique = false)
  private User owner;

  @Column(name = NewsItemImpl.COLUMN_NAME_TITLE, nullable = false)
  private String title;

  @Column(name = NewsItemImpl.COLUMN_NAME_TYPE, nullable = false)
  private String type;  // type of news item: [public,teacherOnly]

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Integer id = null;

  public int compareTo(NewsItem news){
    return news.getDate().compareTo(this.getDate());
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((date == null) ? 0 : date.hashCode());
    result = prime * result + ((news == null) ? 0 : news.hashCode());
    result = prime * result + ((owner == null) ? 0 : owner.hashCode());
    result = prime * result + ((title == null) ? 0 : title.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    final NewsItemImpl other = (NewsItemImpl) obj;
    if (date == null) {
      if (other.date != null)
        return false;
    } else if (!date.equals(other.date))
      return false;
    if (news == null) {
      if (other.news != null)
        return false;
    } else if (!news.equals(other.news))
      return false;
    if (owner == null) {
      if (other.owner != null)
        return false;
    } else if (!owner.equals(other.owner))
      return false;
    if (title == null) {
      if (other.title != null)
        return false;
    } else if (!title.equals(other.title))
      return false;
    return true;
  }
}
