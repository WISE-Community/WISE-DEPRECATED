/**
 * Copyright (c) 2007-2017 Encore Research Group, University of Toronto
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
package org.wise.portal.domain.user.impl;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.authentication.UserDetailsService;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Laurel Williams
 */
@Entity
@Table(name = UserImpl.DATA_STORE_NAME)
@Getter
@Setter
public class UserImpl implements User {

  @Transient
  public static final String DATA_STORE_NAME = "users";

  @Transient
  public static final String COLUMN_NAME_USER_DETAILS_FK = "user_details_fk";

  @Transient
  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long id = null;

  @Version
  @Column(name = "OPTLOCK")
  private Integer version = null;

  @OneToOne(cascade = CascadeType.ALL, targetEntity = PersistentUserDetails.class)
  @JoinColumn(name = COLUMN_NAME_USER_DETAILS_FK, nullable = false, unique = true)
  private MutableUserDetails userDetails;

  public boolean isStudent() {
    return userDetails.hasGrantedAuthority(UserDetailsService.STUDENT_ROLE);
  }

  public boolean isTeacher() {
    return userDetails.hasGrantedAuthority(UserDetailsService.TEACHER_ROLE);
  }

  public boolean isAdmin() {
    return userDetails.hasGrantedAuthority(UserDetailsService.ADMIN_ROLE);
  }

  public boolean isResearcher() {
    return userDetails.hasGrantedAuthority(UserDetailsService.RESEARCHER_ROLE);
  }

  public boolean isTrustedAuthor() {
    return userDetails.hasGrantedAuthority(UserDetailsService.TRUSTED_AUTHOR_ROLE);
  }

  @Override
  public int hashCode() {
    final int PRIME = 31;
    int result = 1;
    result = PRIME
      * result
      + ((userDetails == null) ? 0 : userDetails.hashCode());
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
    final UserImpl other = (UserImpl) obj;
    if (userDetails == null) {
      if (other.userDetails != null)
        return false;
    } else if (!userDetails.equals(other.userDetails))
      return false;
    return true;
  }

  @Override
  public int compareTo(User o) {
    return getId().compareTo(o.getId());
  }
}
