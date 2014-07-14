package org.wise.portal.presentation.web.controllers.teacher.management;

import java.text.DateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.workgroup.WISEWorkgroupService;

@Controller
public class ListStudentNamesController {

	@Autowired
	private RunService runService;

	@Autowired
	private WISEWorkgroupService wiseWorkgroupService;
	
	@RequestMapping("/teacher/management/studentlistexcel.html")
	protected ModelAndView handleRequestInternal(
			@RequestParam("runId") String runIdStr,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
		//get the run
		Long runId = Long.valueOf(runIdStr);
		Run run = runService.retrieveById(runId);
		
		//get the project
		Project project = run.getProject();
		
		String teacherUserName = "";
		
		//get all the owners of the project
		Iterator<User> ownersIterator = run.getOwners().iterator();
		
		//loop through the owners (there should only be one)
		while(ownersIterator.hasNext()) {
			//get an owner
			User owner = ownersIterator.next();
			
			//get the workgroups
			List<Workgroup> teacherWorkgroups = wiseWorkgroupService.getWorkgroupListByOfferingAndUser(run, owner);
			
			//there should only be one workgroup for the owner
			Workgroup teacherWorkgroup = teacherWorkgroups.get(0);
			
			//get the teacher user name
			teacherUserName = teacherWorkgroup.generateWorkgroupName();
			
			break;
		}
		
		//get the meta data for the project
		Long projectId = (Long) project.getId();
		Long parentProjectId = project.getParentProjectId();
		String parentProjectIdStr = "N/A";
		if (parentProjectId != null) {
			parentProjectIdStr = parentProjectId.toString();
		}
		String projectName = project.getName();
		String runName = run.getName();
		Date startTime = run.getStarttime();
		Date endTime = run.getEndtime();

		int rowCounter = 0;
		short columnCounter = 0;
		
		//the max number of columns used
		int maxColumn = 0;
		
		//make the workbook
		HSSFWorkbook wb = new HSSFWorkbook();
		
		//make the sheet
		HSSFSheet mainSheet = wb.createSheet();
		
		//add the meta data header row
		columnCounter = 0;
		HSSFRow metaDataHeaderRow = mainSheet.createRow(rowCounter++);
		metaDataHeaderRow.createCell(columnCounter++).setCellValue("Teacher Login");
		metaDataHeaderRow.createCell(columnCounter++).setCellValue("Project Id");
		metaDataHeaderRow.createCell(columnCounter++).setCellValue("Parent Project Id");
		metaDataHeaderRow.createCell(columnCounter++).setCellValue("Project Name");
		metaDataHeaderRow.createCell(columnCounter++).setCellValue("Run Id");
		metaDataHeaderRow.createCell(columnCounter++).setCellValue("Run Name");
		metaDataHeaderRow.createCell(columnCounter++).setCellValue("Start Date");
		metaDataHeaderRow.createCell(columnCounter++).setCellValue("End Date");
		
		//update the maxColumn count if necessary
		if(columnCounter > maxColumn) {
			maxColumn = columnCounter;
		}
		
		//make the meta data row
		columnCounter = 0;
		HSSFRow metaDataRow = mainSheet.createRow(rowCounter++);
		metaDataRow.createCell(columnCounter++).setCellValue(teacherUserName);
		metaDataRow.createCell(columnCounter++).setCellValue(projectId);
		metaDataRow.createCell(columnCounter++).setCellValue(parentProjectIdStr);
		metaDataRow.createCell(columnCounter++).setCellValue(projectName);
		metaDataRow.createCell(columnCounter++).setCellValue(runId);
		metaDataRow.createCell(columnCounter++).setCellValue(runName);
		metaDataRow.createCell(columnCounter++).setCellValue(timestampToFormattedString(startTime));
		metaDataRow.createCell(columnCounter++).setCellValue(timestampToFormattedString(endTime));
		
		//update the maxColumn count if necessary
		if(columnCounter > maxColumn) {
			maxColumn = columnCounter;
		}
		
		//move the counter to create a blank row
		rowCounter++;
		
		//create the header row for the student names
		columnCounter = 0;
		HSSFRow studentHeaderRow = mainSheet.createRow(rowCounter++);
		studentHeaderRow.createCell(columnCounter++).setCellValue("Period");
		studentHeaderRow.createCell(columnCounter++).setCellValue("Workgroup Id");
		studentHeaderRow.createCell(columnCounter++).setCellValue("Wise Id");
		studentHeaderRow.createCell(columnCounter++).setCellValue("Student Username");
		studentHeaderRow.createCell(columnCounter++).setCellValue("Student Name");
		
		//get all the periods
		Set<Group> periods = run.getPeriods();
		Iterator<Group> periodsIterator = periods.iterator();
		
		//loop through all the periods
		while(periodsIterator.hasNext()) {
			Group group = periodsIterator.next();
			
			//get the name of the period
			String periodName = group.getName();
			
			//get all the students in the period
			Set<User> periodMembers = group.getMembers();
			Iterator<User> periodMembersIterator = periodMembers.iterator();
			
			//loop through all the students in the period
			while(periodMembersIterator.hasNext()) {
				//get a student
				User user = periodMembersIterator.next();
				
				//get the workgroup the student is in
				List<Workgroup> workgroupListByOfferingAndUser = wiseWorkgroupService.getWorkgroupListByOfferingAndUser(run, user);
				//get the workgroup id and wise id
				Long workgroupId = null;
				if (workgroupListByOfferingAndUser.size() > 0) {
					Workgroup workgroup = workgroupListByOfferingAndUser.get(0);
					workgroupId = workgroup.getId();
				}
				
				Long wiseId = user.getId();
				
				//get the user details
				MutableUserDetails userDetails = (MutableUserDetails) user.getUserDetails();
				
				String userName = "";
				String firstName = "";
				String lastName = "";
				String fullName = "";
				
				if(userDetails != null) {
					//get the student username
					userName = userDetails.getUsername();
					
					//get the student name
					firstName = userDetails.getFirstname();
					lastName = userDetails.getLastname();
					fullName = firstName + " " + lastName;					
				}
				
				//make a row for this student
				columnCounter = 0;
				HSSFRow studentDataRow = mainSheet.createRow(rowCounter++);
				
				if(periodName != null && !periodName.equals("")) {
					try {
						//try to convert the value to a number and then set the value into the cell
						studentDataRow.createCell(columnCounter).setCellValue(Long.parseLong(periodName));
					} catch(NumberFormatException e) {
						e.printStackTrace();
						//set the string value into the cell
						studentDataRow.createCell(columnCounter).setCellValue(periodName);
					}
				}
				
				columnCounter++;
				
				//insert the other values for this student
				if (workgroupId == null) {
					studentDataRow.createCell(columnCounter++).setCellValue("N/A");
				} else {
					studentDataRow.createCell(columnCounter++).setCellValue(workgroupId);					
				}
				studentDataRow.createCell(columnCounter++).setCellValue(wiseId);
				studentDataRow.createCell(columnCounter++).setCellValue(userName);
				studentDataRow.createCell(columnCounter++).setCellValue(fullName);
				
				//update the max column count if necessary
		        if(columnCounter > maxColumn) {
					maxColumn = columnCounter;
				}
			}
		}
		
		/*
		 * set the content type to an excel xls so the user is prompted to save
		 * the file as an excel xls
		 */
		response.setContentType("application/vnd.ms-excel");
		
		//set the content type and file name to save it as
		response.setHeader("Content-Disposition", "attachment; filename=\"" + projectName + "-" + runId + "-student-names.xls\"");
		
		//get the response output stream
		ServletOutputStream outputStream = response.getOutputStream();
		
		if(wb != null) {
			//write the excel xls to the output stream
			wb.write(outputStream);
		}
		
		return null;
	}

	/**
	 * Get the timestamp as a string
	 * @param timestamp the timestamp object
	 * @return the timstamp as a string
	 * e.g.
	 * Mar 9, 2011 8:50:47 PM
	 */
	private String timestampToFormattedString(Date date) {
		String timestampString = "";
		
		if(date != null) {
			//get the object to format timestamps
			DateFormat dateTimeInstance = DateFormat.getDateTimeInstance();
			
			//get the timestamp for the annotation
			long time = date.getTime();
			Date timestampDate = new Date(time);
			timestampString = dateTimeInstance.format(timestampDate);			
		}
		
		return timestampString;
	}
}
