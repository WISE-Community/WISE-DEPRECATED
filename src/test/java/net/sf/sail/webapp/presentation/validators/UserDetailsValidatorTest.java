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
package net.sf.sail.webapp.presentation.validators;

import junit.framework.TestCase;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class UserDetailsValidatorTest extends TestCase {

    private MutableUserDetails userDetails;

    private Errors errors;

    private static final String USERNAME = "NAME";

    private static final String PASSWORD = "PASS";

    private static final String EMPTY = "";

    private static final String SPACES = "    ";

    protected static final String ILLEGAL1 = "<a>";

    protected static final String ILLEGAL2 = "'";

    protected static final String ILLEGAL3 = "\"";

    private static final String ILLEGAL4 = ";";

    private static final String LONG = "abcdefghijhijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    private Validator userDetailsValidator;

    protected void setUp() throws Exception {
        super.setUp();
        userDetails = new PersistentUserDetails();
        userDetails.setUsername(USERNAME);
        userDetails.setPassword(PASSWORD);
        errors = new BeanPropertyBindingResult(userDetails, "");
        userDetailsValidator = new UserDetailsValidator();
    }

    public void testUsernameNullValidate() {
        userDetails.setUsername(null);

        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("username"));
        assertNull(errors.getFieldError("password"));
    }

    public void testUsernameEmptyValidate() {
        userDetails.setUsername(EMPTY);

        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("username"));
        assertNull(errors.getFieldError("password"));
    }

    public void testUsernameSpacesValidate() {
        userDetails.setUsername(SPACES);

        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("username"));
        assertNull(errors.getFieldError("password"));
    }

    public void testPasswordNullValidate() {
        userDetails.setPassword(null);

        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNull(errors.getFieldError("username"));
        assertNotNull(errors.getFieldError("password"));
    }

    public void testPasswordEmptyValidate() {
        userDetails.setPassword(EMPTY);

        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNull(errors.getFieldError("username"));
        assertNotNull(errors.getFieldError("password"));
    }

    public void testPasswordSpacesValidate() {
        userDetails.setPassword(SPACES);

        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNull(errors.getFieldError("username"));
        assertNotNull(errors.getFieldError("password"));
    }

    public void testUsernameIllegalChars1Validate() {
        userDetails.setUsername(ILLEGAL1);
        userDetailsValidator.validate(userDetails, errors);
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("username"));
        assertNull(errors.getFieldError("password"));

    }

    public void testUsernameIllegalChars2Validate() {
        userDetails.setUsername(ILLEGAL2);
        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("username"));
        assertNull(errors.getFieldError("password"));

    }

    public void testUsernameIllegalChars3Validate() {
        userDetails.setUsername(ILLEGAL3);
        userDetailsValidator.validate(userDetails, errors);
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("username"));
        assertNull(errors.getFieldError("password"));

    }

    public void testUsernameIllegalChars4Validate() {
        userDetails.setUsername(ILLEGAL4);
        userDetailsValidator.validate(userDetails, errors);
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("username"));
        assertNull(errors.getFieldError("password"));
    }

    public void testUsernameLongValidate() {
        assertTrue(LONG.length() > UserDetailsValidator.MAX_USERNAME_LENGTH);
        userDetails.setUsername(LONG);
        userDetailsValidator.validate(userDetails, errors);
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("username"));
        assertNull(errors.getFieldError("password"));

    }

    protected void tearDown() throws Exception {
        super.tearDown();
        userDetails = null;
        errors = null;
    }

}
