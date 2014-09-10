/**
 * Copyright (c) 2007-2014 Encore Research Group, University of Toronto
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
import org.wise.portal.domain.authentication.MutableGrantedAuthority;
import org.wise.portal.domain.authentication.MutableUserDetails;


/**
 * Provides TELS-specific ROLES on top of what is already
 * available in PAS
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface UserDetailsService extends
	org.springframework.security.core.userdetails.UserDetailsService {
	
	public static final String USER_ROLE = "ROLE_USER";

    public static final String ADMIN_ROLE = "ROLE_ADMINISTRATOR";

	public static final String TEACHER_ROLE = "ROLE_TEACHER";
	
	public static final String STUDENT_ROLE = "ROLE_STUDENT";
	
	public static final String AUTHOR_ROLE = "ROLE_AUTHOR";

	public static final String TRUSTED_AUTHOR_ROLE = "ROLE_TRUSTED_AUTHOR";

	public static final String RESEARCHER_ROLE = "ROLE_RESEARCHER";

	public static final String RUN_GRADE_ROLE = "ROLE_RUN_GRADE";
	
	public static final String RUN_READ_ROLE = "ROLE_RUN_READ";
		
	public static final String PROJECT_READ_ROLE = "ROLE_READ_PROJECT";
	
	public static final String PROJECT_WRITE_ROLE = "ROLE_WRITE_PROJECT";

	public static final String PROJECT_SHARE_ROLE = "ROLE_SHARE_PROJECT";
	
    /**
     * Given an object representing a role, created the granted authority record
     * in the data store.
     * 
     * @param mutableGrantedAuthority
     *            to create in the data store
     * @return the <code>MutableGrantedAuthority</code> object after it has
     *         been saved in the data store
     * @throws DuplicateAuthorityException
     *             if authority is not unique.
     */

    public MutableGrantedAuthority createGrantedAuthority(
            MutableGrantedAuthority mutableGrantedAuthority)
            throws DuplicateAuthorityException;

    /**
     * Given an authority string, loads an authority from the data store.
     * 
     * @param authority
     * @return A MutableGrantedAuthority object
     * @throws AuthorityNotFoundException
     *             If authority is not in data store.
     */
    public GrantedAuthority loadAuthorityByName(String authority)
            throws AuthorityNotFoundException;

    /**
     * Returns a list of all existing authorities in the system.
     * 
     * @return A List of MutableGrantedAuthority objects
     */
    public List<MutableGrantedAuthority> retrieveAllAuthorities();
    
    /**
     * Given a MutableUserDetails, updates the data of that object in the database
     * @param userDetails
     */
    public void updateUserDetails(final MutableUserDetails userDetails);


	public List<MutableUserDetails> retrieveAllUserDetails(String userDetailsClassName);

	public List<String> retrieveAllUsernames(String userDetailsClassName);

}
