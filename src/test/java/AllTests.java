import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses( { 
	net.sf.sail.webapp.AllTests.class,
	org.wise.portal.AllTests.class 
})

public class AllTests {
}
