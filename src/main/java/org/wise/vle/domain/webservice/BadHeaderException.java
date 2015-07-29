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
package org.wise.vle.domain.webservice;

/**
 * Represents errors in headers for a request.
 * 
 * @author Cynick Young
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