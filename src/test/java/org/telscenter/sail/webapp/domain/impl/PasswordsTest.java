
package org.telscenter.sail.webapp.domain.impl;

import junit.framework.TestCase;
/**
 * @author patricklawler
 * $Id:$
 */
public class PasswordsTest extends TestCase{

	private final String INITIAL_PASSWORD = "b";
	
	private final String PASSWORD_MATCH = "b";
	
	private final String PASSWORD_MISMATCH = "c";
	
	private Passwords passwordsMatch, passwordsMismatch;
	
	public void setUp(){
		passwordsMatch = new Passwords(INITIAL_PASSWORD, PASSWORD_MATCH);
		passwordsMismatch = new Passwords(INITIAL_PASSWORD, PASSWORD_MISMATCH);
	}
	
	public void testMatch(){
		assertTrue(passwordsMatch.match());
	}
	
	public void testMismatch(){
		assertFalse(passwordsMismatch.match());
	}
	
}
