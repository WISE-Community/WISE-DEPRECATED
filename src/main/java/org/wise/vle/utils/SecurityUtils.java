/**
 * A utility class that assists with servlet security and authentication
 * when run with the portal.
 */
package org.wise.vle.utils;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.springframework.security.core.GrantedAuthority;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.workgroup.WISEWorkgroupService;

/**
 * @author patrick lawler
 *
 */
public final class SecurityUtils {

	private static List<String> ALLOWED_REFERRERS;

	private static Properties wiseProperties;
	private static WISEWorkgroupService workgroupService;
	private static RunService runService;

	private final static String AUTHENTICATION_URL = "authorize.html";

	private final static String MODEMASTER_URL = "modemaster.html";

	private static boolean retrievedPortalMode = false;

	private static boolean isPortalMode = true;

	/**
	 * Checks the list of allowed referrers and returns <code>boolean</code> true if
	 * the referer from the request matches any from the list, returns false otherwise.
	 * 
	 * @param request
	 * @return boolean
	 */
	public static boolean isValidReferrer(HttpServletRequest request){
		String referer = request.getHeader("referer");
		String domain =  "http://" + request.getServerName();
		String domainWithPort = domain + ":" + request.getLocalPort();
		
		//get the context path e.g. /wise
		String contextPath = request.getContextPath();

		for(int x=0;x<ALLOWED_REFERRERS.size();x++){
			if(referer != null && (referer.contains(domain + contextPath + ALLOWED_REFERRERS.get(x)) || referer.contains(domainWithPort + contextPath + ALLOWED_REFERRERS.get(x)))){
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns <code>boolean</code> true if the given <code>HttpServletRequest</code> request
	 * successfully authenticates with the portal, returns false otherwise.
	 * 
	 * @param request
	 * @return boolean
	 */
	public static boolean isAuthenticated(HttpServletRequest request){
		boolean result = true;
		/*
		String fullUrl = request.getRequestURL().toString();
		String fullUri = request.getRequestURI();
		String urlBase = fullUrl.substring(0, fullUrl.indexOf(fullUri));

		/// check referer to make sure the request is coming from a valid referrer 
		if(isValidReferrer(request)){
			// authenticate against the portal using the credentials passed in by the portal 
			String credentials = (String) request.getAttribute("credentials");
			if(credentials != null){
				// authenticate to the portal 
				String params = "authenticate&credentials=" + credentials;
				try{
					String response = Connector.request(urlBase + AUTHENTICATION_URL, params);
					if(response.equals("true")){
						return true;
					}
				} catch(IOException e){
					e.printStackTrace();
				}
			}
		}
		*/
		return result;
	}

	/**
	 * Given a <code>HttpServletRequest</code> request and a <code>String</code> path,
	 * returns <code>boolen</code> true if the servlet is allowed access to that path,
	 * returns false otherwise.
	 * 
	 * @param request
	 * @param path
	 * @return booelan
	 */
	public static boolean isAllowedAccess(HttpServletRequest request, String path){
		return isAllowedAccess(request, new File(path));
	}

	/**
	 * Given a <code>HttpServletRequest</code> request and a <code>File</code> file,
	 * returns <code>boolean</code> true if the servlet is allowed access to that file,
	 * returns false otherwise.
	 * 
	 * @param request
	 * @param path
	 * @return boolean
	 */
	public static boolean isAllowedAccess(HttpServletRequest request, File file){
		String accessPath = (String) request.getAttribute("accessPath");
		
		boolean allowedAccess = isAllowedAccess(accessPath, file);

		return allowedAccess;
	}
	
	/**
	 * Determine if the user should have access to the given file
	 * @param accessPath
	 * @param file
	 * @return whether the user should have access to the file
	 */
	public static boolean isAllowedAccess(String accessPath, File file) {

		if(accessPath != null && !accessPath.equals("")) {
			File accessFile = new File(accessPath);
			if(accessFile.exists()) {
				try{
					return file.getCanonicalPath().contains(accessFile.getCanonicalPath());
				} catch (IOException e){
					e.printStackTrace();
				}
			}
		}

		return false;
	}
	
	public static boolean isAllowedAccess(String fileAllowedToAccessPath, String fileTryingToAccessPath) {
		boolean result = false;
		
		File fileAllowedToAccess = new File(fileAllowedToAccessPath);
		File fileTryingToAccess = new File(fileTryingToAccessPath);
		
		result = isAllowedAccess(fileAllowedToAccess, fileTryingToAccess);
		
		return result;
	}
	
	public static boolean isAllowedAccess(File fileAllowedToAccess, File fileTryingToAccess) {
		boolean result = false;
		
		if(fileAllowedToAccess != null && fileAllowedToAccess.exists()) {
			try {
				String fileAllowedToAccessPath = fileAllowedToAccess.getCanonicalPath();
				String fileTryingToAccessPath = fileTryingToAccess.getCanonicalPath();
				
				result = fileTryingToAccessPath.contains(fileAllowedToAccessPath);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		
		return result;
	}
	
	/**
	 * Find out if the user is a student
	 * @param user a user
	 * @return whether the user is a student or not
	 */
	public static boolean isStudent(User user) {
		boolean isStudent = false;
		
		//get the authorities for the signed in user
		MutableUserDetails signedInUserDetails = user.getUserDetails();
		Collection<? extends GrantedAuthority> authorities = signedInUserDetails.getAuthorities();

		for (GrantedAuthority authority : authorities) {
			if(authority.getAuthority().equals(UserDetailsService.STUDENT_ROLE)) {
				//the user is a student
				isStudent = true;
			}
		}
		
		return isStudent;
	}
	
	/**
	 * Find out if the user is a teacher
	 * @param user a user
	 * @return whether the user is a teacher or not
	 */
	public static boolean isTeacher(User user) {
		boolean isTeacher = false;
		
		//get the authorities for the signed in user
		MutableUserDetails signedInUserDetails = user.getUserDetails();
		Collection<? extends GrantedAuthority> authorities = signedInUserDetails.getAuthorities();

		for (GrantedAuthority authority : authorities) {
			if(authority.getAuthority().equals(UserDetailsService.TEACHER_ROLE)) {
				//the user is a teacher
				isTeacher = true;
			}
		}
		
		return isTeacher;
	}
	
	/**
	 * Find out if the user is an admin
	 * @param user a user
	 * @return whether the user is an admin or not
	 */
	public static boolean isAdmin(User user) {
		boolean isAdmin = false;
		
		//get the authorities for the signed in user
		MutableUserDetails signedInUserDetails = user.getUserDetails();
		Collection<? extends GrantedAuthority> authorities = signedInUserDetails.getAuthorities();

		for (GrantedAuthority authority : authorities) {
			if (authority.getAuthority().equals(UserDetailsService.ADMIN_ROLE)) {
				//the user is an admin
				isAdmin = true;					
			}
		}
		
		return isAdmin;
	}
	
	/**
	 * Check if a user is the owner or shared owner of a run
	 * @param user the signed in user
	 * @param runId the run id
	 * @return whether the user is an owner of the run
	 */
	public static boolean isUserOwnerOfRun(User user, Long runId) {
		boolean result = false;
		
		if(user != null && runId != null) {
			try {
				//get the run
				Run run = getRunService().retrieveById(runId);
				
				if(run != null) {
					//get the owners and shared owners
					Set<User> owners = run.getOwners();
					Set<User> sharedowners = run.getSharedowners();
					
					if(owners.contains(user) || sharedowners.contains(user)) {
						//the user is the owner or a shared owner
						result = true;
					}
				}
			} catch (ObjectNotFoundException e) {
				e.printStackTrace();
			}			
		}
		
		return result;
	}
	
	/**
	 * Check if the user is in the run
	 * @param user the user
	 * @param runId the run id
	 * @return whether the user is in the run
	 */
	public static boolean isUserInRun(User user, Long runId) {
		boolean result = false;
		
		if(user != null && runId != null) {
			//get the list of runs this user is in
			List<Run> runList = getRunService().getRunList(user);
			
			Iterator<Run> runListIterator = runList.iterator();
			
			//loop through all the runs this user is in
			while(runListIterator.hasNext()) {
				//get a run
				Run tempRun = runListIterator.next();
				
				if(tempRun != null) {
					//get the run id
					Long tempRunId = tempRun.getId();
					
					//check if the run id matches the one we are searching for
					if(runId.equals(tempRunId)) {
						//the run id matches so the user is in the run
						result = true;
						break;
					}
				}
			}
		}
		
		return result;
	}
	
	/**
	 * Check if the user is in the period
	 * @param user the user
	 * @param runId the run id
	 * @param periodId the period id
	 * @return whether the user is in the period
	 */
	public static boolean isUserInPeriod(User user, Long runId, Long periodId) {
		boolean result = false;
		
		if(user != null && runId != null && periodId != null) {
			try {
				//get the run
				Run run = getRunService().retrieveById(runId);
				
				//get the period the student is in for the run
				Group periodOfStudent = run.getPeriodOfStudent(user);
				
				if(periodOfStudent != null) {
					//get the period id
					Long tempPeriodId = periodOfStudent.getId();
					
					//check if the period id matches the one we are searching for
					if(periodId.equals(tempPeriodId)) {
						//the period id matches so the user is in the period
						result = true;
					}
				}
			} catch (ObjectNotFoundException e) {
			}
		}
		
		return result;
	}
	
	/**
	 * Check if the user is in the workgroup id
	 * @param user the user
	 * @param workgroupId the workgroup id
	 * @return whether the user is in the workgroup
	 */
	public static boolean isUserInWorkgroup(User user, Long workgroupId) {
		boolean result = false;
		
		if(user != null && workgroupId != null) {
			//get all the workgroups this user is in
			List<Workgroup> workgroupsForUser = getWorkgroupService().getWorkgroupsForUser(user);
			
			Iterator<Workgroup> workgroupsForUserIterator = workgroupsForUser.iterator();
			
			//loop through all the workgroups this user is in
			while(workgroupsForUserIterator.hasNext()) {
				//get a workgroup
				Workgroup tempWorkgroup = workgroupsForUserIterator.next();
				
				if(tempWorkgroup != null) {
					//get the workgroup id
					Long tempWorkgroupId = tempWorkgroup.getId();
					
					//check if the workgroup id matches the one we are searching for
					if(workgroupId.equals(tempWorkgroupId)) {
						//the workgroup id matches so the user is in the workgroup
						result = true;
						break;
					}
				}
			}
		}
		
		return result;
	}
	
	/**
	 * Check if the workgroup is in the run
	 * @param workgroupId the workgroup id
	 * @param runId the run id
	 * @return whether the workgroup is in the run
	 */
	public static boolean isWorkgroupInRun(Long workgroupId, Long runId) {
		boolean result = false;
		
		if(workgroupId != null && runId != null) {
			try {
				//get all the workgroups in the run
				Set<Workgroup> workgroupsInRun = runService.getWorkgroups(runId);
				
				Iterator<Workgroup> workgroupsInRunIterator = workgroupsInRun.iterator();
				
				//loop through all the workgroups in the run
				while(workgroupsInRunIterator.hasNext()) {
					//get a workgroup
					Workgroup tempWorkgroup = workgroupsInRunIterator.next();
					
					//get the workgroup id
					Long tempWorkgroupId = tempWorkgroup.getId();
					
					//check if the workgroup id is the one we are looking for
					if(workgroupId.equals(tempWorkgroupId)) {
						//we have found the workgroup id that we want
						result = true;
						break;
					}
				}
			} catch (ObjectNotFoundException e) {
				e.printStackTrace();
			}
		}
		
		return result;
	}

	/**
	 * Given a <code>HttpServletRequest</code> request, makes a request to the mode master
	 * to determine if the calling servlet should run in portal mode or stand-alone. Returns
	 * true if the settings.xml specifies that it is in portal mode, false otherwise.
	 * 
	 * @param request
	 * @return
	 */
	public static boolean isPortalMode(HttpServletRequest request){
		return isPortalMode;
	}

	public static Properties getWiseProperties() {
		return wiseProperties;
	}

	public static void setWiseProperties(Properties wiseProperties) {
		SecurityUtils.wiseProperties = wiseProperties;
	}

	public static WISEWorkgroupService getWorkgroupService() {
		return workgroupService;
	}

	public static void setWorkgroupService(WISEWorkgroupService workgroupService) {
		SecurityUtils.workgroupService = workgroupService;
	}

	public static RunService getRunService() {
		return runService;
	}

	public static void setRunService(RunService runService) {
		SecurityUtils.runService = runService;
	}
}
