package org.telscenter.sail.webapp.presentation.web.controllers.run;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;
import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;
import org.telscenter.sail.webapp.presentation.util.json.JSONArray;
import org.telscenter.sail.webapp.presentation.util.json.JSONException;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.offering.RunService;

public class RunUtil {

	/**
	 * Get the signed in user info in a JSONObject
	 * @param run
	 * @param workgroupService
	 * @return a JSONObject containing the user info for the signed in user
	 */
	public static JSONObject getMyUserInfo(Run run, WorkgroupService workgroupService) {
		JSONObject myUserInfoJSONObject = new JSONObject();

		//get the singed in user
		User signedInUser = ControllerUtil.getSignedInUser();

		//get the workgroup
		List<Workgroup> workgroupListByOfferingAndUser = workgroupService.getWorkgroupListByOfferingAndUser(run, signedInUser);
		if (workgroupListByOfferingAndUser.size()==0 && signedInUser.isAdmin()) {
			// an admin user is trying to run or view grades for a run
			
		} else {
			Workgroup workgroup = workgroupListByOfferingAndUser.get(0);

			//get the workgroup id
			Long workgroupId = workgroup.getId();

			//get name of the users in the workgroup
			String userNamesFromWorkgroup = getUserNamesFromWorkgroup(workgroup);

			try {
				//put all the username and workgroup id into the JSONObject
				myUserInfoJSONObject.put("userName", userNamesFromWorkgroup);
				myUserInfoJSONObject.put("workgroupId", workgroupId);
			} catch (JSONException e) {
				e.printStackTrace();
			}

			//get the period the user is in
			Group periodGroup = ((WISEWorkgroup) workgroup).getPeriod();

			//check if the workgroup has a period (teacher's do not have a period)
			if(periodGroup != null) {
				//get the period name and id
				String periodName = periodGroup.getName();
				String periodId = periodGroup.getId().toString();

				try {
					//put the period name and id into the JSONObject
					myUserInfoJSONObject.put("periodName", periodName);
					myUserInfoJSONObject.put("periodId", periodId);
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
		}

		return myUserInfoJSONObject;
	}
	
	
	/**
	 * Get the classmate user info in a JSONArray
	 * @param run
	 * @param workgroupService
	 * @return a JSONArray containing classmate info
	 */
	public static JSONArray getClassmateUserInfos(Run run, WorkgroupService workgroupService, RunService runService) {
		JSONArray classmateUserInfosJSONArray = new JSONArray();
		
		//get the workgroups in the run
		Set<Workgroup> workgroups = null;
		try {
			workgroups = runService.getWorkgroups(run.getId());
		} catch (ObjectNotFoundException e1) {
			e1.printStackTrace();
		}
		
		if(workgroups != null) {
			//loop through all the workgroups in the run and add all the classmate workgroups
			for(Workgroup workgroup : workgroups) {
				try {
					JSONObject classmateJSONObject = new JSONObject();
					
					if(!((WISEWorkgroup) workgroup).isTeacherWorkgroup()) {
						//the workgroup is a student workgroup
						classmateJSONObject.put("workgroupId", ((WISEWorkgroup) workgroup).getId());
						
						//get the members of the workgroup
						Set<User> members = ((WISEWorkgroup) workgroup).getMembers();
						
						//array list to hold all the wise ids for this workgroup
						ArrayList<Long> wiseIdsArrayList = new ArrayList<Long>();
						
						//loop through all the members in the workgroup to retrieve their wise ids
						Iterator<User> membersIter = members.iterator();
						while(membersIter.hasNext()) {
							User user = membersIter.next();
							Long wiseId = user.getId();
							wiseIdsArrayList.add(wiseId);
						}
						
						//sort the wise ids numerically
						Collections.sort(wiseIdsArrayList);
						
						JSONArray wiseIdsJSONArray = new JSONArray();
						
						//put the wise ids into the JSONArray
						for(int x=0; x<wiseIdsArrayList.size(); x++) {
							Long wiseId = wiseIdsArrayList.get(x);
							wiseIdsJSONArray.put(wiseId);							
						}
						
						//put the wise ids array into the classmate object
						classmateJSONObject.put("wiseIds", wiseIdsJSONArray);
						
						if(((WISEWorkgroup) workgroup).getPeriod() != null) {
							classmateJSONObject.put("periodId", ((WISEWorkgroup) workgroup).getPeriod().getId());
							classmateJSONObject.put("periodName", ((WISEWorkgroup) workgroup).getPeriod().getName());
						} else {
							classmateJSONObject.put("periodId", JSONObject.NULL);
						}

						//get the student user ids as a string delimited by ':'
						String userIdsFromWorkgroup = getUserIdsFromWorkgroup(workgroup);
						
						//put the student user ids string into the json object
						classmateJSONObject.put("userIds", userIdsFromWorkgroup);
						
						//add the student to the list of classmates array
						classmateUserInfosJSONArray.put(classmateJSONObject);	
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}			
		}
		
		return classmateUserInfosJSONArray;
	}
	
	/**
	 * Get the teacher user info in a JSONObject
	 * @param run the run object
	 * @param workgroupService
	 * @return a JSONObject containing the teacher user info such as workgroup id
	 * and name
	 */
	public static JSONObject getTeacherUserInfo(Run run, WorkgroupService workgroupService) {
		//the JSONObject that will hold the owner teacher user info
		JSONObject teacherUserInfo = new JSONObject();
		
		if(run != null) {
			//get the owners of the run (there should only be one)
			Iterator<User> ownersIterator = run.getOwners().iterator();
			
			//loop through the owners (there should only be one)
			while(ownersIterator.hasNext()) {
				//get an owner
				User owner = ownersIterator.next();
				
				//get the workgroups
				List<Workgroup> teacherWorkgroups = workgroupService.getWorkgroupListByOfferingAndUser(run, owner);
				
				//there should only be one workgroup for the owner
				Workgroup teacherWorkgroup = teacherWorkgroups.get(0);
				
				try {
					//set the values into the owner JSONObject
					teacherUserInfo.put("workgroupId", teacherWorkgroup.getId());
					teacherUserInfo.put("userName", teacherWorkgroup.generateWorkgroupName());
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}			
		}
		
		return teacherUserInfo;
	}
	
	/**
	 * Get an array of shared teacher user infos in a JSONArray
	 * @param run the run object
	 * @param workgroupService
	 * @return a JSONArray containing shared teacher user infos
	 */
	public static JSONArray getSharedTeacherUserInfos(Run run, WorkgroupService workgroupService) {

		//the JSONArray that will hold the shared teacher user infos
		JSONArray sharedTeacherUserInfos = new JSONArray();
		
		if(run != null) {
			//get the shared owners
			Iterator<User> sharedOwnersIterator = run.getSharedowners().iterator();
			
			//loop through the shared owners
			while(sharedOwnersIterator.hasNext()) {
				//get a shared owner
				User sharedOwner = sharedOwnersIterator.next();
				
				//get the workgroups
				List<Workgroup> sharedTeacherWorkgroups = workgroupService.getWorkgroupListByOfferingAndUser(run, sharedOwner);
				
				//there should only be one workgroup for the shared owner
				if (sharedTeacherWorkgroups.size() > 0) {
					Workgroup sharedTeacherWorkgroup = sharedTeacherWorkgroups.get(0);
				
					//make a JSONObject for this shared owner
					JSONObject sharedTeacherUserInfo = new JSONObject();
				
					try {
						//set the values into the shared owner JSONObject
						sharedTeacherUserInfo.put("workgroupId", sharedTeacherWorkgroup.getId());
						sharedTeacherUserInfo.put("userName", sharedTeacherWorkgroup.generateWorkgroupName());
					} catch (JSONException e) {
						e.printStackTrace();
					}
				
					//add the shared owner to the array
					sharedTeacherUserInfos.put(sharedTeacherUserInfo);
				}
			}
		}

		return sharedTeacherUserInfos;
	}
	
	/**
	 * Get the run info for the run and put it into a JSON object
	 * @param run the run to obtain info for
	 * @return a JSONObject that contains the run info
	 */
	public static JSONObject getRunInfo(Run run) {
		JSONObject runInfo = new JSONObject();
		
		try {
			Long runId = run.getId();
			runInfo.put("runId", runId);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		try {
			//get the date the run was created
			Date startTime = run.getStarttime();
			
			if(startTime != null) {
				runInfo.put("startTime", startTime.getTime());	
			} else {
				runInfo.put("startTime", JSONObject.NULL);
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		try {
			//get the date the run was archived or null if never archived
			Date endTime = run.getEndtime();
			
			if(endTime != null) {
				runInfo.put("endTime", endTime.getTime());
			} else {
				runInfo.put("endTime", JSONObject.NULL);
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return runInfo;
	}
	
	/**
	 * Obtain the first name, last name, and login for the user
	 * @param user the User we want to obtain the first, last, login for
	 * @return the first, last and login in this format below
	 * Jennifer Chiu (JenniferC829)
	 */
	public static String getFirstNameLastNameLogin(User user) {
		String firstName = "";
		String lastName = "";
		String userName = "";
		
		//get the user details, we need to cast to our own MutableUserDetails class
		MutableUserDetails userDetails = (org.telscenter.sail.webapp.domain.authentication.MutableUserDetails) user.getUserDetails();

		//get the first name, last name, and login
		if(userDetails != null) {
			userName = userDetails.getUsername();
			firstName = userDetails.getFirstname();
			lastName = userDetails.getLastname();
		}
		
		//append the user's name and login so it looks like Jennifer Chiu (JenniferC829)
		return firstName + " " + lastName + " (" + userName + ")";
	}
	
	/**
	 * Obtain the user names for this workgroup
	 * @param workgroup a Workgroup that we want the names from
	 * @return a string of user names delimited by :
	 * e.g.
	 * "Jennifer Chiu (JenniferC829):helen zhang (helenz1115a)"
	 */
	public static String getUserNamesFromWorkgroup(Workgroup workgroup) {
		//the string buffer to maintain the user names for the logged in user
		StringBuffer userNames = new StringBuffer();
		Set<User> members = workgroup.getMembers();
		Iterator<User> iterator = members.iterator();
		while(iterator.hasNext()) {
			//get a user
			User user = iterator.next();

			//get the first name last name and login as a string like Geoffrey Kwan (GeoffreyKwan)
			String firstNameLastNameLogin = getFirstNameLastNameLogin(user);
			
			//separate the names with a :
			if(userNames.length() != 0) {
				userNames.append(":");
			}
			
			//add the first name last name and login for this user
			userNames.append(firstNameLastNameLogin);
		}
		
		//return the : delimited user names that are in this workgroup
		return userNames.toString();
	}
	
	/**
	 * Get the wise ids as a string delimited by ':'
	 * @param workgroup the workgroup id to obtain wise ids for
	 * @return a string containing the wise ids delimited by ':'
	 */
	public static String getUserIdsFromWorkgroup(Workgroup workgroup) {
		//the string buffer to maintain the user names
		StringBuffer userIds = new StringBuffer();
		
		//get the members of the group in an iterator
		Set<User> members = workgroup.getMembers();
		Iterator<User> iterator = members.iterator();
		
		//loop through each member
		while(iterator.hasNext()) {
			//get a member
			User user = iterator.next();

			//get the wise student id
			Long userId = user.getId();
			
			//separate the names with a :
			if(userIds.length() != 0) {
				userIds.append(":");
			}
			
			//add the wise student id for this user
			userIds.append(userId);
		}
		
		//return the : delimited user names that are in this workgroup
		return userIds.toString();
	}
}
