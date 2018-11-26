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
package org.wise.portal.domain.authentication;

import org.springframework.security.acls.model.Sid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.wise.portal.domain.Persistable;

/**
 * Mutable extension of the <code>Sid</code> (security id) interface. This
 * interface supports both principal and granted authority based
 * <code>Sid</code> in a single interface. There is no need for separate
 * implementations.
 *
 * @author Cynick Young
 * @see Sid
 */
public interface MutableAclSid extends Sid, Persistable {

  /**
   * Tests whether this instance of <code>Sid</code> was created as a
   * principal.
   * @return <code>true</code> if this instance of <code>Sid</code> has
   *         been created using a principal, <code>false</code> if this has
   *         been created using a granted authority, and <code>null</code>
   *         if this instance has not been initialized properly.
   */
  Boolean isPrincipal();

  /**
   * Gets the <code>Sid</code> as a <code>String</code> if this instance
   * has been created using a principal.
   * @return the principal
   * @throws UnsupportedOperationException if this instance of Sid is not a principal
   */
  String getPrincipal();

  /**
   * Sets the <code>Sid</code> using an <code>Authentication</code>
   * principal.
   * @param authentication to set
   */
  void setPrincipal(Authentication authentication);

  /**
   * Sets the <code>Sid</code> using a <code>GrantedAuthority</code>.
   * @param grantedAuthority to set
   */
  void setGrantedAuthority(GrantedAuthority grantedAuthority);

  /**
   * Gets the <code>Sid</code> as a <code>String</code> if this instance
   * has been created using a granted authority.
   * @return the granted authority
   * @throws UnsupportedOperationException if this instance of Sid is not a granted authority
   */
  String getGrantedAuthority();
}
