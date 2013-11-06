/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package net.sf.sail.webapp.dao.user;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;

import net.sf.sail.webapp.dao.SimpleDao;
import net.sf.sail.webapp.domain.User;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
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
    public T retrieveByUserDetails(UserDetails userDetails);
    
    
    /**
     * Given a username retrieve a corresponding user record from data store
     * 
     * @param username the users username
     * @return A new instance of a data object
     */
    public T retrieveByUsername(String username);
    
    /**
     * Retrieves all users whose accounts are disabled.
     * @return A list of users whose accounts are disabled.
     */
    public List<T> retrieveDisabledUsers();
   
    /**
     * Given a username retrieve a corresponding user records from data store.
     * 
     * @param emailAddress
     * @return  new instances of a data object
     */
    public List<T> retrieveByEmailAddress(String emailAddress);
    
    /**
     * Retrieves all usernames from the datastore.
     * @param selectClause ___ portion of the query in  "select ___ from" 
     * @return
     */
    public List<String> retrieveAll(String selectClause);
    
    /**
     * Given a field, search type, search term and classVar (teacher or studentUserDetails),
     *  retrieves a list of Users from data store
     * 
     *  @param field
     *  @param type
     *  @param search term
     *  @param classVar
     */
    public List<T> retrieveByField(String field, String type, Object term, String classVar);
    
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
    public List<T> retrieveByFields(String[] fields, String[] values, String classVar);
    
    /**
     * Given a reset password key retrieve a corresponding user.
     * @param resetPasswordKey an alphanumeric key
     * @return a User object
     */
    public T retrieveByResetPasswordKey(String resetPasswordKey);
    
}