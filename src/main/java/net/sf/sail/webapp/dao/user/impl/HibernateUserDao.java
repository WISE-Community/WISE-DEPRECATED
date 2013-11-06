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
package net.sf.sail.webapp.dao.user.impl;

import java.util.List;
import java.util.Vector;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;
import net.sf.sail.webapp.dao.user.UserDao;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.apache.commons.lang.StringUtils;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.dao.support.DataAccessUtils;
import org.springframework.security.core.userdetails.UserDetails;


/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class HibernateUserDao extends AbstractHibernateDao<User> implements
        UserDao<User> {

    private static final String FIND_ALL_QUERY = "from UserImpl";

    /**
     * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getFindAllQuery()
     */
    @Override
    protected String getFindAllQuery() {
        return FIND_ALL_QUERY;
    }

    /**
     * @see net.sf.sail.webapp.dao.user.UserDao#retrieveByUserDetails(org.acegisecurity.userdetails.UserDetails)
     */
    public User retrieveByUserDetails(UserDetails userDetails) {
        return (User) DataAccessUtils
                .uniqueResult(this
                        .getHibernateTemplate()
                        .findByNamedParam(
                                "from UserImpl as user where user.userDetails = :userDetails",
                                "userDetails", userDetails));
    }

	/**
	 * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getDataObjectClass()
	 */
	@Override
	protected Class<UserImpl> getDataObjectClass() {
		return UserImpl.class;
	}

	/**
	 * @see net.sf.sail.webapp.dao.user.UserDao#retrieveAllUsernames()
	 */
	@SuppressWarnings("unchecked")
	public List<String> retrieveAll(String selectClause) {
		return this.getHibernateTemplate().find("select " + selectClause + " from UserImpl");
	}

    /**
     * @see net.sf.sail.webapp.dao.user.UserDao#retrieveByUsername(java.lang.String)
     */
    public User retrieveByUsername(String username) {
        return (User) DataAccessUtils
                .requiredUniqueResult(this
                        .getHibernateTemplate()
                        .findByNamedParam(
                                "from UserImpl as user where upper(user.userDetails.username) = :username",
                                "username", username.toUpperCase()));
    }
    
    /**
     * @see net.sf.sail.webapp.dao.user.UserDao#retrieveByEmailAddress(java.lang.String)
     */
    @SuppressWarnings("unchecked")
	public List<User> retrieveByEmailAddress(String emailAddress) {
        return this
        .getHibernateTemplate()
        .findByNamedParam(
                "from UserImpl as user where user.userDetails.emailAddress = :emailAddress",
                "emailAddress", emailAddress);
    }

    /**
     * @see net.sf.sail.webapp.dao.user.UserDao#retrieveDisabledUsers()
     */
    @SuppressWarnings("unchecked")
	public List<User> retrieveDisabledUsers() {
        return this
        .getHibernateTemplate()
        .findByNamedParam(
                "from UserImpl as user where user.userDetails.enabled = :enabled",
                "enabled", false);
    }
    
    /**
     * @see net.sf.sail.webapp.dao.user.UserDao#retrieveByField(java.lang.String, java.lang.String, java.lang.String, java.lang.String)
     */
    @SuppressWarnings("unchecked")
    public List<User> retrieveByField(String field, String type, Object term, String classVar){
    	if (field == null && type == null && term == null) {
    		return this.getHibernateTemplate().find(
    				"select user from UserImpl user, " + capitalizeFirst(classVar) + " " +
    				classVar +	" where user.userDetails.id = " + classVar + ".id");
    	} else {
    		return this.getHibernateTemplate().findByNamedParam(
    				"select user from UserImpl user, " + capitalizeFirst(classVar) + " " +
    				classVar +	" where user.userDetails.id = " + classVar + ".id and " +
    				classVar + "."	+ field + " " +	type + " :term", "term", term);
    	}
    }
    
    /**
     * Capitalizes the first letter of a given String
     * 
     * @param string
     * @return String
     */
    private String capitalizeFirst(String string){
    	return StringUtils.upperCase(StringUtils.left(string, 1)) 
    		+ StringUtils.right(string, string.length() - 1);
    }

    /**
     * Get all the Users that have fields with the given matching values
     * @param fields an array of field names
     * e.g.
     * 'firstname'
     * 'lastname'
     * 'birthmonth'
     * 'birthday'
     * 
     * @param values an array of values, the index of a value must line up with
     * the index in the field array
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
    @SuppressWarnings("unchecked")
    public List<User> retrieveByFields(String[] fields, String[] values, String classVar) {
    	Vector<Object> objectValues = new Vector<Object>();
    	
    	StringBuffer query = new StringBuffer();
    	
    	//make the beginning of the query
    	query.append("select user from UserImpl user, " + capitalizeFirst(classVar) + " " + classVar + " where ");
    	query.append("user.userDetails.id=" + classVar + ".id");
    	
    	//loop through all the fields so we can add more constraints to the 'where' clause
    	for(int x=0; x<fields.length; x++) {
    		query.append(" and ");
    		
    		if(fields[x] != null && (fields[x].equals("birthmonth") || fields[x].equals("birthday"))) {
    			//field is a birth month or birth day so we need to use a special function call
    			if(fields[x].equals("birthmonth")) {
    				query.append("month(" + classVar + ".birthday)=?");
    			} else if(fields[x].equals("birthday")) {
    				query.append("day(" + classVar + ".birthday)=?");    				
    			}
    			
    			//number values must be Integer objects in the array we pass to the find() below
    			objectValues.add(Integer.parseInt(values[x]));
    		} else {
    			//add the constraint
    			query.append(classVar + "." + fields[x] + "=?");
    			objectValues.add(values[x]);
    		}
    	}
    	
    	//run the query and return the results
    	return this.getHibernateTemplate().find(query.toString(), objectValues.toArray());
    }

    /**
     * Given a reset password key retrieve a corresponding user.
     * @param resetPasswordKey an alphanumeric key
     * @return a User object or null if there is no user with the given reset password key
     */
	@Override
	public User retrieveByResetPasswordKey(String resetPasswordKey) {
		User user = null;
		try {
	        user = (User) DataAccessUtils
	                .requiredUniqueResult(this
	                        .getHibernateTemplate()
	                        .findByNamedParam(
	                                "from UserImpl as user where user.userDetails.resetPasswordKey = :resetPasswordKey",
	                                "resetPasswordKey", resetPasswordKey));
		} catch(EmptyResultDataAccessException e) {
			e.printStackTrace();
		}
        
        return user;
	}
}