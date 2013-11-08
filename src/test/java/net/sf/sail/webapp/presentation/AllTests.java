package net.sf.sail.webapp.presentation;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses( {
	net.sf.sail.webapp.presentation.validators.AllTests.class,
	net.sf.sail.webapp.presentation.web.controllers.AllTests.class
})

public class AllTests {
}