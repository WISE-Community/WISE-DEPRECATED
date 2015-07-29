/**
 * Copyright (c) 2006-2015 Encore Research Group, University of Toronto
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
package org.wise.portal.dao.user;

import java.util.List;


import org.springframework.security.core.userdetails.UserDetails;
import org.wise.portal.dao.SimpleDao;
import org.wise.portal.domain.user.User;

/**
 * @author Cynick Young
 */
public interface UserDao<T extends User> extends SimpleDao<T> {

    /**
     * Given a user details retrieve a corresponding user record from data
     * store.
     * 
     * @param userDetails
     *            A <code>UserDetails</code> associated with the User in the
     *            data store.
     * @return A new instance of a data object.
     */
    T retrieveByUserDetails(UserDetails userDetails);
    
    
    /**
     * Given a username retrieve a corresponding user record from data store
     * 
     * @param username the users username
     * @return A new instance of a data object
     */
    T retrieveByUsername(String username);
    
    /**
     * Retrieves all users whose accounts are disabled.
     * @return A list of users whose accounts are disabled.
     */
    List<T> retrieveDisabledUsers();
   
    /**
     * Given a username retrieve a corresponding user records from data store.
     * 
     * @param emailAddress
     * @return  new instances of a data object
     */
    List<T> retrieveByEmailAddress(String emailAddress);
    
    /**
     * Retrieves all usernames from the datastore.
     * @param selectClause ___ portion of the query in  "select ___ from" 
     * @return
     */
    List<String> retrieveAll(String selectClause);
    
    /**
     * Given a field, search type, search term and classVar (teacher or studentUserDetails),
     *  retrieves a list of Users from data store
     * 
     *  @param field
     *  @param type
     *  @param search term
     *  @param classVar
     */
    List<T> retrieveByField(String field, String type, Object term, String classVar);
    
    /**
     * Given an array of fields and an array of values and classVar, retrieves a list
     * of Users
     * @param fields an array of field names
     * @param values an array of values, the index of a value must line up with
     * the index in the field array
     * 
     * e.g.
     * fields[0] = "firstname"
     * fields[1] = "lastname"
     * 
     * values[0] = "Spongebob"
     * values[1] = "Squarepants"
     * 
     * @param classVar 'studentUserDetails' or 'teacherUserDetails'
     * @return a list of Users that have matching values for the given fields
     */
    List<T> retrieveByFields(String[] fields, String[] values, String classVar);
    
    /**
     * Given a reset password key retrieve a corresponding user.
     * @param resetPasswordKey an alphanumeric key
     * @return a User object
     */
    T retrieveByResetPasswordKey(String resetPasswordKey);
    
}