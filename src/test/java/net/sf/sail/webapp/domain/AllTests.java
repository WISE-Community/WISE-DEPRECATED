package net.sf.sail.webapp.domain;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses( { 
	net.sf.sail.webapp.domain.authentication.impl.AllTests.class,
	net.sf.sail.webapp.domain.webservice.http.AllTests.class
})

public class AllTests {
}
