package org.telscenter.sail.webapp.domain.run;

import java.util.Set;
import java.util.TreeSet;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;

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

	private static final String THIS_RUN_NAME = "this run name";

	private static final String THAT_RUN_NAME = "that run name";
	
	private User thisTeacher;
	
	private User thatTeacher;
	
	private Run thisRun;
	
	private Run thatRun;
	
	private StudentRunInfo thisStudentRunInfo;
	
	private StudentRunInfo thatStudentRunInfo;
	
	@Before
	public void setup(){
		thisTeacher = new UserImpl();
		thatTeacher = new UserImpl();
		
		Set<User> thisUser = new TreeSet<User>();
		Set<User> thatUser = new TreeSet<User>();
		
		thisUser.add(thisTeacher);
		thatUser.add(thatTeacher);
		
		thisRun = new RunImpl();
		thatRun = new RunImpl();
		thisRun.setOwners(thisUser);
		thatRun.setOwners(thatUser);
		thisRun.setName(THIS_RUN_NAME);
		thatRun.setName(THAT_RUN_NAME);
		
		thisStudentRunInfo = new StudentRunInfo();
		thatStudentRunInfo = new StudentRunInfo();
		thisStudentRunInfo.setRun(thisRun);
		thatStudentRunInfo.setRun(thatRun);
	}
	
	@After
	public void tearDown() {
		thisTeacher = null;
		thatTeacher = null;
		thisRun = null;
		thatRun = null;
		thisStudentRunInfo = null;
		thatStudentRunInfo = null;
	}
	
	@Test
	public void testCompareTo(){
		thatRun.setName(THIS_RUN_NAME);
		assertEquals(thisStudentRunInfo.compareTo(thatStudentRunInfo), 0);
		
		thisRun.setName(null);
		thatRun.setName(null);
		assertEquals(thisStudentRunInfo.compareTo(thatStudentRunInfo), 0);
		
		thisRun.setName(THIS_RUN_NAME);
		thatRun.setName(null);
		assertEquals(thisStudentRunInfo.compareTo(thatStudentRunInfo), 0);
		
		thisRun.setName(null);
		thatRun.setName(THAT_RUN_NAME);
		assertEquals(thisStudentRunInfo.compareTo(thatStudentRunInfo), 0);
	}
	
}
