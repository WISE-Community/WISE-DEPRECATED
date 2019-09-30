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
import javax.persistence.UniqueConstraint;
import javax.persistence.Version;

import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.wise.portal.domain.authentication.MutableAclSid;

/**
 * Concrete implementation of <code>MutableAclSid</code> marked with EJB3
 * annotations for persistence.
 *
 * @author Cynick Young
 * @see org.springframework.security.acls.model.Sid
 */
@Entity
@Table(name = PersistentAclSid.DATA_STORE_NAME, uniqueConstraints = { @UniqueConstraint(columnNames = {
  PersistentAclSid.COLUMN_NAME_SID,
  PersistentAclSid.COLUMN_NAME_IS_PRINCIPAL }) })
public class PersistentAclSid implements MutableAclSid {

  @Transient
  private static final long serialVersionUID = 1L;

  @Transient
  public static final String DATA_STORE_NAME = "acl_sid";

  @Transient
  static final String COLUMN_NAME_IS_PRINCIPAL = "principal";

  @Transient
  public static final String COLUMN_NAME_SID = "sid";

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

  //@Column(name = COLUMN_NAME_IS_PRINCIPAL, nullable = false)
  // we need principal to be boolean. the default behavior of hibernate is to make it a bit
  // so we need to force it to be a boolean when the sql is exported
  @Column(name = COLUMN_NAME_IS_PRINCIPAL, nullable = false, columnDefinition = "boolean")
  private Boolean isPrincipal;

  @Column(name = COLUMN_NAME_SID, nullable = false)
  @Getter
  @Setter
  private String sidName;

  public Boolean isPrincipal() {
    return this.getIsPrincipal();
  }

  private Boolean getIsPrincipal() {
    return isPrincipal;
  }

  private void setIsPrincipal(Boolean isPrincipal) {
    this.isPrincipal = isPrincipal;
  }

  public String getPrincipal() {
    if (this.getIsPrincipal() == null) {
      throw new IllegalStateException();
    }
    if (this.getIsPrincipal()) {
      return this.getSidName();
    }
    throw new UnsupportedOperationException(
      "Unsupported method for this instance of Sid");
  }

  public void setPrincipal(Authentication authentication) {
    this.setIsPrincipal(Boolean.TRUE);
    if (authentication.getPrincipal() instanceof UserDetails) {
      this.setSidName(((UserDetails) authentication.getPrincipal())
        .getUsername());
    } else {
      this.setSidName(authentication.getPrincipal().toString());
    }
  }

  public void setGrantedAuthority(GrantedAuthority grantedAuthority) {
    this.setIsPrincipal(Boolean.FALSE);
    this.setSidName(grantedAuthority.getAuthority());
  }

  public String getGrantedAuthority() {
    if (this.getIsPrincipal() == null) {
      throw new IllegalStateException();
    }
    if (this.getIsPrincipal()) {
      throw new UnsupportedOperationException(
        "Unsupported method for this instance of Sid");
    } else {
      return this.getSidName();
    }
  }

  @Override
  public int hashCode() {
    final int PRIME = 31;
    int result = 1;
    result = PRIME * result
      + ((isPrincipal == null) ? 0 : isPrincipal.hashCode());
    result = PRIME * result + ((sidName == null) ? 0 : sidName.hashCode());
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
    final PersistentAclSid other = (PersistentAclSid) obj;
    if (isPrincipal == null) {
      if (other.isPrincipal != null)
        return false;
    } else if (!isPrincipal.equals(other.isPrincipal))
      return false;
    if (sidName == null) {
      if (other.sidName != null)
        return false;
    } else if (!sidName.equals(other.sidName))
      return false;
    return true;
  }
}
