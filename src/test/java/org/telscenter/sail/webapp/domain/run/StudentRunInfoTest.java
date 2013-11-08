package org.telscenter.sail.webapp.domain.run;

import java.util.Set;
import java.util.TreeSet;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.sds.SdsUser;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.internal.runners.TestClassRunner;
import org.junit.runner.RunWith;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.RunImpl;

import junit.framework.TestCase;

/**
 * 
 * @author patrick lawler
 *
 */
@RunWith(TestClassRunner.class)
public class StudentRunInfoTest extends TestCase{

	private final static String ONEFIRSTNAME = "Charlie";
	
	private final static String TWOFIRSTNAME = "Stephanie";
	
	private final static String ONELASTNAME = "Stefanos";
	
	private final static String TWOLASTNAME = "Chappela";
	
	private final static String ONEOFFERINGNAME = "Starship";
	
	private final static String TWOOFFERINGNAME = "Starslip";

	private static final String THIS_RUN_NAME = "this run name";

	private static final String THAT_RUN_NAME = "that run name";
	
	private User thisTeacher;
	
	private User thatTeacher;
	
	private SdsUser thisSdsTeacher;
	
	private SdsUser thatSdsTeacher;
	
	private Run thisRun;
	
	private Run thatRun;
	
	private StudentRunInfo thisStudentRunInfo;
	
	private StudentRunInfo thatStudentRunInfo;
	
	private SdsOffering thisOffering;
	
	private SdsOffering thatOffering;
		
	@Before
	public void setup(){
		thisSdsTeacher = new SdsUser();
		thatSdsTeacher = new SdsUser();
		thisTeacher = new UserImpl();
		thatTeacher = new UserImpl();
		
		thisTeacher.setSdsUser(thisSdsTeacher);
		thatTeacher.setSdsUser(thatSdsTeacher);
		
		Set<User> thisUser = new TreeSet<User>();
		Set<User> thatUser = new TreeSet<User>();
		
		thisUser.add(thisTeacher);
		thatUser.add(thatTeacher);
		
		thisOffering = new SdsOffering();
		thatOffering = new SdsOffering();
		thisOffering.setName(ONEOFFERINGNAME);
		thatOffering.setName(TWOOFFERINGNAME);
		
		thisRun = new RunImpl();
		thatRun = new RunImpl();
		thisRun.setOwners(thisUser);
		thatRun.setOwners(thatUser);
		thisRun.setSdsOffering(thisOffering);
		thatRun.setSdsOffering(thatOffering);
		thisRun.setName(THIS_RUN_NAME);
		thatRun.setName(THAT_RUN_NAME);
		
		thisStudentRunInfo = new StudentRunInfo();
		thatStudentRunInfo = new StudentRunInfo();
		thisStudentRunInfo.setRun(thisRun);
		thatStudentRunInfo.setRun(thatRun);
	}
	
	@After
	public void tearDown() {
		thisSdsTeacher = null;
		thatSdsTeacher = null;
		thisTeacher = null;
		thatTeacher = null;
		thisRun = null;
		thatRun = null;
		thisStudentRunInfo = null;
		thatStudentRunInfo = null;
	}
	
	@Test
	public void testCompareTo(){
		//test same owner last name, different owner first names
		thisSdsTeacher.setFirstName(ONEFIRSTNAME);
		thatSdsTeacher.setFirstName(TWOFIRSTNAME);
		thisSdsTeacher.setLastName(ONELASTNAME);
		thatSdsTeacher.setLastName(ONELASTNAME);
		assertTrue(thisStudentRunInfo.compareTo(thatStudentRunInfo) < 0 );
		
		//test different owner last name, same owner first names
		thisSdsTeacher.setFirstName(ONEFIRSTNAME);
		thatSdsTeacher.setFirstName(ONEFIRSTNAME);
		thisSdsTeacher.setLastName(ONELASTNAME);
		thatSdsTeacher.setLastName(TWOLASTNAME);
		assertTrue(thisStudentRunInfo.compareTo(thatStudentRunInfo) > 0);
		
		
		//test same owner first and last names, different run names
		thisSdsTeacher.setFirstName(ONEFIRSTNAME);
		thatSdsTeacher.setFirstName(ONEFIRSTNAME);
		thisSdsTeacher.setLastName(TWOLASTNAME);
		thatSdsTeacher.setLastName(TWOLASTNAME);
		assertTrue(thisStudentRunInfo.compareTo(thatStudentRunInfo) > 0);
		
		
		//test same owner first and last names, same run names
		thisSdsTeacher.setFirstName(ONEFIRSTNAME);
		thatSdsTeacher.setFirstName(ONEFIRSTNAME);
		thisSdsTeacher.setLastName(ONELASTNAME);
		thatSdsTeacher.setLastName(ONELASTNAME);
		thatOffering.setName(ONEOFFERINGNAME);
		thatRun.setName(THIS_RUN_NAME);
		assertEquals(thisStudentRunInfo.compareTo(thatStudentRunInfo), 0);
		
		//test same owner first and last names, both runs' names are null
		thisSdsTeacher.setFirstName(ONEFIRSTNAME);
		thatSdsTeacher.setFirstName(ONEFIRSTNAME);
		thisSdsTeacher.setLastName(ONELASTNAME);
		thatSdsTeacher.setLastName(ONELASTNAME);
		thatOffering.setName(ONEOFFERINGNAME);
		thisRun.setName(null);
		thatRun.setName(null);
		assertEquals(thisStudentRunInfo.compareTo(thatStudentRunInfo), 0);
		
		//test same owner first and last names, one of the run's name is null
		thisSdsTeacher.setFirstName(ONEFIRSTNAME);
		thatSdsTeacher.setFirstName(ONEFIRSTNAME);
		thisSdsTeacher.setLastName(ONELASTNAME);
		thatSdsTeacher.setLastName(ONELASTNAME);
		thatOffering.setName(ONEOFFERINGNAME);
		thisRun.setName(THIS_RUN_NAME);
		thatRun.setName(null);
		assertEquals(thisStudentRunInfo.compareTo(thatStudentRunInfo), 0);
		
		//test same owner first and last names, one of the run's name is null
		thisSdsTeacher.setFirstName(ONEFIRSTNAME);
		thatSdsTeacher.setFirstName(ONEFIRSTNAME);
		thisSdsTeacher.setLastName(ONELASTNAME);
		thatSdsTeacher.setLastName(ONELASTNAME);
		thatOffering.setName(ONEOFFERINGNAME);
		thisRun.setName(null);
		thatRun.setName(THAT_RUN_NAME);
		assertEquals(thisStudentRunInfo.compareTo(thatStudentRunInfo), 0);
	}
	
}
