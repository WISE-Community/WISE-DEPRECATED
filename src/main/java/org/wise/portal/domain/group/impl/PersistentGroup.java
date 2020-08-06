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
package org.wise.portal.domain.group.impl;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Cascade;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

/**
 * WISE implementation of group
 * @author Cynick Young
 */
@Entity
@Table(name = PersistentGroup.DATA_STORE_NAME)
public class PersistentGroup implements Group {

  @Transient
  public static final String DATA_STORE_NAME = "`groups`";

  @Transient
  public static final String USERS_JOIN_TABLE_NAME = "groups_related_to_users";

  @Transient
  public static final String COLUMN_NAME_NAME = "name";

  @Transient
  public static final String COLUMN_NAME_PARENT_FK = "parent_fk";

  @Transient
  public static final String USERS_JOIN_COLUMN_NAME = "user_fk";

  @Transient
  public static final String GROUPS_JOIN_COLUMN_NAME = "group_fk";

  @Transient
  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Getter
  @Setter
  private Long id = null;

  @Version
  @Column(name = "OPTLOCK")
  @Getter
  @Setter
  private Integer version = null;

  // TODO: why is the EAGER fetched?
  @ManyToMany(targetEntity = UserImpl.class, fetch = FetchType.EAGER)
  @JoinTable(name = USERS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name = GROUPS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = USERS_JOIN_COLUMN_NAME, nullable = false))
  @Getter
  @Setter
  private Set<User> members = new HashSet<User>();

  @Column(name = PersistentGroup.COLUMN_NAME_NAME, nullable = false)
  @Getter
  @Setter
  private String name;

  @ManyToOne(targetEntity = PersistentGroup.class, fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
  @Cascade( { org.hibernate.annotations.CascadeType.SAVE_UPDATE })
  @JoinColumn(name = COLUMN_NAME_PARENT_FK)
  @Getter
  @Setter
  private Group parent;

  public void addMember(User member) {
    // TODO: LW & HT DISCUSS: WHY IS THIS IF CASE NEEDED? IT'S USING A SET
    if (this.members.contains(member)) {
      return;
    }
    this.members.add(member);
  }

  public void removeMember(User member) {
    this.members.remove(member);
  }

  @Override
  public int hashCode() {
    final int PRIME = 31;
    int result = 1;
    result = PRIME * result + ((name == null) ? 0 : name.hashCode());
    result = PRIME * result + ((parent == null) ? 0 : parent.hashCode());
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
    final PersistentGroup other = (PersistentGroup) obj;
    if (name == null) {
      if (other.name != null)
        return false;
    } else if (!name.equals(other.name))
      return false;
    if (parent == null) {
      if (other.parent != null)
        return false;
    } else if (!parent.equals(other.parent))
      return false;
    return true;
  }

  public int compareTo(Group o) {
    try {
      return Integer.valueOf(this.getName()).compareTo(Integer.valueOf(o.getName()));
    } catch (NumberFormatException e) {
      return this.getName().compareTo(o.getName());
    }
  }
}
