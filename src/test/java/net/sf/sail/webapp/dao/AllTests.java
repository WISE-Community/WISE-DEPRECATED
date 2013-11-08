package net.sf.sail.webapp.dao;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses( {
	net.sf.sail.webapp.dao.annotation.impl.AllTests.class,
	net.sf.sail.webapp.dao.authentication.impl.AllTests.class,
	net.sf.sail.webapp.dao.curnit.impl.AllTests.class,
	net.sf.sail.webapp.dao.group.impl.AllTests.class,
	net.sf.sail.webapp.dao.jnlp.impl.AllTests.class,
	net.sf.sail.webapp.dao.offering.impl.AllTests.class,
	net.sf.sail.webapp.dao.sds.impl.AllTests.class,
	net.sf.sail.webapp.dao.user.impl.AllTests.class,
	net.sf.sail.webapp.dao.workgroup.impl.AllTests.class
})

public class AllTests {
}
