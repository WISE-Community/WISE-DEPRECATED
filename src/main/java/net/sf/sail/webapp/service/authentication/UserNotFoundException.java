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
package net.sf.sail.webapp.service.authentication;

/**
 * A checked exception thrown when the data store already contains a user
 * details object with the same username.
 * 
 * @author Laurel Williams
 * 
 * @version $Id: DuplicateUsernameException.java 257 2007-03-30 14:59:02Z cynick $
 * 
 */
public class UserNotFoundException extends Exception {

	private static final long serialVersionUID = 1L;

	private String message;

	public UserNotFoundException(String username) {
		this.message = "Username:" + username + " not found use.";
	}

	public String getMessage() {
		return this.message;
	}

}
