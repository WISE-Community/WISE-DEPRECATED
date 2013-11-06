package vle.web;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Calendar;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import utils.SecurityUtils;
import vle.VLEServlet;
import vle.domain.xmpp.ChatLog;

public class ChatLogController extends VLEServlet {

	private static final long serialVersionUID = 1L;

	/**
	 * Handle GET requests
	 * @param rquest
	 * @param response
	 */
	public void doGet(HttpServletRequest request, HttpServletResponse response) {

	}
	
	/**
	 * Handle POST requests
	 * @param request
	 * @param response
	 * @throws IOException 
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		/* make sure that this request is authenticated through the portal before proceeding */
		if (SecurityUtils.isPortalMode(request) && !SecurityUtils.isAuthenticated(request)) {
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}

		//get all the parameters
		String chatEventType = request.getParameter("chatEventType");
		String runId = request.getParameter("runId");
		String fromWorkgroupId = request.getParameter("fromWorkgroupId");
		String fromWorkgroupName = request.getParameter("fromWorkgroupName");
		String chatRoomId = request.getParameter("chatRoomId");
		String dataType = request.getParameter("dataType");
		String data = request.getParameter("data");
		Timestamp postTime = new Timestamp(Calendar.getInstance().getTimeInMillis());
		
		//create a chat log object to save in the database
		ChatLog chatLog = new ChatLog();
		chatLog.setRunId(new Long(runId));
		chatLog.setChatEventType(chatEventType);
		chatLog.setFromWorkgroupId(new Long(fromWorkgroupId));
		chatLog.setFromWorkgroupName(fromWorkgroupName);
		chatLog.setChatRoomId(chatRoomId);
		chatLog.setDataType(dataType);
		chatLog.setData(data);
		chatLog.setPostTime(postTime);
		chatLog.saveOrUpdate();
	}
}
