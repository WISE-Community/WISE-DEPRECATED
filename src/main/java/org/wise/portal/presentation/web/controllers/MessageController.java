/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.message.Message;
import org.wise.portal.domain.message.MessageRecipient;
import org.wise.portal.domain.message.impl.MessageRecipientImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.message.MessageService;
import org.wise.portal.service.user.UserService;

/**
 * @author hirokiterashima
 * @version $Id:$
 */
@Controller
@RequestMapping("/message/message.html")
public class MessageController {

	@Autowired
	private MessageService messageService;
	
	@Autowired
	private UserService userService;

	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		User user = ControllerUtil.getSignedInUser();  // logged-in user
		String action = request.getParameter("action");
		boolean successful = false;
		if (action.equals("index")) {
			List<Message> readMessages = messageService.retrieveReadMessages(user);
			List<Message> unreadMessages = messageService.retrieveUnreadMessages(user);			
			List<Message> sentMessages = messageService.retrieveSentMessages(user);
			ModelAndView mav = new ModelAndView("/teacher/message/index");
			mav.addObject("readMessages", readMessages);
			mav.addObject("unreadMessages", unreadMessages);
			mav.addObject("sentMessages", sentMessages);
			return mav;
		} 

		String failureMessage = "";
		Message message = null;
		String messageIdStr = request.getParameter("messageId");
		if (messageIdStr != null) {
			Long messageId = Long.valueOf(messageIdStr);
			message = messageService.retrieveById(messageId);
		}

		if (action.equals("archive")) {
			successful = this.messageService.markMessageRead(message,true,user);
		} else if (action.equals("unarchive")) {
			successful = this.messageService.markMessageRead(message,false,user);
		} else if (action.equals("compose") || action.equals("reply")){
			Set<MessageRecipient> messageRecipients = new HashSet<MessageRecipient>();
			String[] recipientUsernames = request.getParameter("recipient").split(",");
			
			for(String recipientUsername : recipientUsernames){
				User recipient = this.userService.retrieveUserByUsername(recipientUsername.trim());
				//TODO - What to do if one of the recipients does not exist
				if(recipient != null){
					MessageRecipient messageRecipient = new MessageRecipientImpl();
					messageRecipient.setRecipient(recipient);
					messageRecipients.add(messageRecipient);
				}
			}
			
			if (messageRecipients.size()<1) {  //no recipients found
				successful = false;
				failureMessage = "no recipients found";
			} else {
				// we can try sending message
				try {
					Message originalMessage = null;
					String originalMessageId = request.getParameter("originalMessageId");
					if (originalMessageId != null) {
						originalMessage = messageService.retrieveById(new Long(originalMessageId));
					}
					
					successful = this.messageService.sendMessage(request, user, messageRecipients, originalMessage);
				} catch (ObjectNotFoundException e) {
					e.printStackTrace();
					successful = false;
					failureMessage = "original message not found";
				}
			}
		} else {
			successful = false;
		}
		
		if (successful) {
			response.getWriter().print("success");
		} else {
			response.getWriter().print(failureMessage);
		}
		return null;
	}
}
