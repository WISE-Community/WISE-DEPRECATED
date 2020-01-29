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
package org.wise.portal.service.authentication;

import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.wise.portal.domain.authentication.MutableGrantedAuthority;
import org.wise.portal.domain.authentication.MutableUserDetails;

/**
 * Provides WISE-specific ROLES on top of what is already available in WISE
 * @author Hiroki Terashima
 */
public interface UserDetailsService extends
    org.springframework.security.core.userdetails.UserDetailsService {

  String ANONYMOUS_ROLE = "ROLE_ANONYMOUS";

  String USER_ROLE = "ROLE_USER";

  String ADMIN_ROLE = "ROLE_ADMINISTRATOR";

  String PREVIOUS_ADMIN_ROLE = "ROLE_PREVIOUS_ADMINISTRATOR";

  String TEACHER_ROLE = "ROLE_TEACHER";

  String STUDENT_ROLE = "ROLE_STUDENT";

  String AUTHOR_ROLE = "ROLE_AUTHOR";

  String TRUSTED_AUTHOR_ROLE = "ROLE_TRUSTED_AUTHOR";

  String RESEARCHER_ROLE = "ROLE_RESEARCHER";

  String RUN_GRADE_ROLE = "ROLE_RUN_GRADE";

  String RUN_READ_ROLE = "ROLE_RUN_READ";

  String PROJECT_READ_ROLE = "ROLE_READ_PROJECT";

  String PROJECT_WRITE_ROLE = "ROLE_WRITE_PROJECT";

  String PROJECT_SHARE_ROLE = "ROLE_SHARE_PROJECT";

  /**
   * Given an object representing a role, created the granted authority record
   * in the data store.
   *
   * @param mutableGrantedAuthority to create in the data store
   * @return the <code>MutableGrantedAuthority</code> object after it has
   * been saved in the data store
   * @throws DuplicateAuthorityException if authority is not unique.
   */
  MutableGrantedAuthority createGrantedAuthority(MutableGrantedAuthority mutableGrantedAuthority)
    throws DuplicateAuthorityException;

  /**
   * Given an authority string, loads an authority from the data store.
   *
   * @param authority
   * @return A MutableGrantedAuthority object
   * @throws AuthorityNotFoundException if authority is not in data store.
   */
  GrantedAuthority loadAuthorityByName(String authority)
    throws AuthorityNotFoundException;

  /**
   * Returns a list of all existing authorities in the system.
   * @return A List of MutableGrantedAuthority objects
   */
  List<MutableGrantedAuthority> retrieveAllAuthorities();

  void updateUserDetails(final MutableUserDetails userDetails);

  UserDetails loadUserByGoogleUserId(String googleUserId);

  void updateStatsOnSuccessfulLogin(MutableUserDetails userDetails);

  List<String> retrieveAllTeacherUsernames();
  List<String> retrieveAllStudentUsernames();
}
