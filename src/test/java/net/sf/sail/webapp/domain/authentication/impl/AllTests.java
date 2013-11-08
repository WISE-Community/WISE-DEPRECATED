package net.sf.sail.webapp.domain.authentication.impl;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses( { 
	PersistentSidTest.class,
	PersistentAclTargetObjectIdentityTest.class
})

public class AllTests {
}
