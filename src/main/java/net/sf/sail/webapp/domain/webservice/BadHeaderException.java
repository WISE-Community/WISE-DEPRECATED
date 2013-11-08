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
package net.sf.sail.webapp.domain.webservice;

/**
 * Represents errors in headers for a request.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class BadHeaderException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * @param message
     *            is a string that should give an explanation of the error.
     */
    public BadHeaderException(String message) {
        super(message);
    }
}