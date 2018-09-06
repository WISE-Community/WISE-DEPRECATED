/**
 * Copyright (c) 2007-2015 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.domain.authentication.impl;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import lombok.Getter;
import lombok.Setter;
import org.wise.portal.domain.authentication.MutableAclTargetObject;

/**
 * Concrete implementation of <code>MutableAclTargetObject</code> marked with
 * EJB3 annotations for persistence.
 *
 * @author Cynick Young
 */
@Entity
@Table(name = PersistentAclTargetObject.DATA_STORE_NAME)
public class PersistentAclTargetObject implements MutableAclTargetObject {

  @Transient
  private static final long serialVersionUID = 1L;

  @Transient
  public static final String DATA_STORE_NAME = "acl_class";

  @Transient
  public static final String COLUMN_NAME_CLASSNAME = "class";

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Getter
  @Setter
  private Long id;

  @Version
  @Column(name = "OPTLOCK")
  @Getter
  @Setter
  private Integer version = null;

  @Column(name = COLUMN_NAME_CLASSNAME, unique = true, nullable = false)
  @Getter
  @Setter
  private String classname;

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result
      + ((classname == null) ? 0 : classname.hashCode());
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
    final PersistentAclTargetObject other = (PersistentAclTargetObject) obj;
    if (classname == null) {
      if (other.classname != null)
        return false;
    } else if (!classname.equals(other.classname))
      return false;
    return true;
  }
}
