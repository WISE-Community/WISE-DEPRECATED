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
package org.telscenter.sail.webapp.service.message.impl;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.mail.IMailFacade;

import org.springframework.transaction.annotation.Transactional;
import org.telscenter.sail.webapp.dao.message.MessageDao;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;
import org.telscenter.sail.webapp.domain.message.Message;
import org.telscenter.sail.webapp.domain.message.MessageRecipient;
import org.telscenter.sail.webapp.domain.message.impl.MessageImpl;
import org.telscenter.sail.webapp.service.message.MessageService;

/**
 * @author hirokiterashima
 * @version $Id:$
 */
public class MessageServiceImpl implements MessageService {

	private MessageDao<Message> messageDao;
	
	private IMailFacade javaMail = null;
	
	private Properties emaillisteners = null;
	
	/**
	 * @see org.telscenter.sail.webapp.service.message.MessageService#markMessageRead(org.telscenter.sail.webapp.domain.message.Message)
	 */
	@Transactional()
	public boolean markMessageRead(Message message,boolean isRead, User user) {
		for(MessageRecipient mRecipient : message.getRecipients()){
			if(mRecipient.getRecipient().equals(user)){
				mRecipient.setRead(isRead);
				this.messageDao.save(message);
				return true;
			}
		}
		
		return false;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.message.MessageService#retrieveMessages()
	 */
	@Transactional()	
	public List<Message> retrieveMessages(User recipient) {
		return messageDao.getListByRecipient(recipient);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.message.MessageService#retrieveSentMessages()
	 */
	@Transactional()	
	public List<Message> retrieveSentMessages(User sender) {
		return messageDao.getListBySender(sender);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.message.MessageService#retrieveUnreadMessages()
	 */
	@Transactional()	
	public List<Message> retrieveUnreadMessages(User recipient) {
		return messageDao.getListByRecipient(recipient,false);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.message.MessageService#retrieveUnreadMessages()
	 */
	@Transactional()	
	public List<Message> retrieveReadMessages(User recipient) {
		return messageDao.getListByRecipient(recipient,true);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.message.MessageService#sendMessage(org.telscenter.sail.webapp.domain.message.Message)
	 */
	@Transactional()	
	public Message saveMessage(Message message) {
		messageDao.save(message);
		return message;
	}

	/**
	 * @param messageDao the messageDao to set
	 */
	public void setMessageDao(MessageDao<Message> messageDao) {
		this.messageDao = messageDao;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.message.MessageService#retrieveById(java.lang.Long)
	 */
	public Message retrieveById(Long id) throws ObjectNotFoundException {
		return this.messageDao.getById(id);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.message.MessageService#sendMessage(javax.servlet.http.HttpServletRequest, net.sf.sail.webapp.domain.User, net.sf.sail.webapp.domain.User, org.telscenter.sail.webapp.domain.message.Message)
	 */
	@Transactional
	public boolean sendMessage(HttpServletRequest request, User sender, Set<MessageRecipient> recipients, Message originalMessage) {
		String subject = request.getParameter("subject");
		String body = request.getParameter("body");
		Message message = new MessageImpl();
		message.setOriginalMessage(originalMessage);
		message.setDate(Calendar.getInstance().getTime());
		message.setSender(sender);
		message.setRecipients(recipients);
		message.setSubject(subject);
		message.setBody(body);
		this.saveMessage(message);
		this.emailMessage(message);
		return true;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.message.MessageService#emailMessage(org.telscenter.sail.webapp.domain.message.Message)
	 */
	public void emailMessage(Message message) {
		EmailMessageService emailMessageService =
			new EmailMessageService(message);
		Thread thread = new Thread(emailMessageService);
		thread.start();
	}
	
	class EmailMessageService implements Runnable {
		private static final int MAX_BODY_LENGTH = 50;  // maximum number of characters in the body to show in the email.
		private Message message;
		
		public EmailMessageService(Message message) {
			this.message = message;
		}

		public void run() {
			// sends email to the recipient
    		MutableUserDetails senderUserDetails = (MutableUserDetails) message.getSender().getUserDetails();
    		String senderName = senderUserDetails.getFirstname() + " " + senderUserDetails.getLastname();
    		ArrayList<String> recipients = new ArrayList<String>();
    		ArrayList<String> recipientNames = new ArrayList<String>();
    		Set<MessageRecipient> recips = message.getRecipients();
    		String[] uberAdmins = emaillisteners.getProperty("uber_admin").split(",");
    		for (int i=0; i< uberAdmins.length; i++) {
        		recipients.add(uberAdmins[i]);    			
    		}
    		
    		for(MessageRecipient recip : recips){
        		recipients.add(recip.getRecipient().getUserDetails().getEmailAddress());
        		recipientNames.add(recip.getRecipient().getUserDetails().getUsername());
    		}
    		
    		String messageBody = message.getBody();
    		if (messageBody.length() > MAX_BODY_LENGTH) {
    			// trim body if it's large, and add ...
    			messageBody = messageBody.substring(0, MAX_BODY_LENGTH) + "...";
    		}

    		String subject = senderName + " sent you a message on WISE4";	
    		String messageString = senderName + " sent you a message on WISE4:\n\n" +
    		"Subject: " + message.getSubject() + "\n" +
    		"Recipient(s):" + recipientNames.toString() + "\n" +
    		"Message: " + messageBody + "\n\n" +
    		"To reply to this message, please log into WISE.\n\n" +
    		"Thanks,\n" +
    		"WISE4 Team";
    		
    		String fromEmail = "noreply@telscenter.org";
    		
    		String[] recipientsEmailArray = new String[recipients.size()];
    		for (int i=0; i < recipients.size(); i++) {
    			recipientsEmailArray[i] = recipients.get(i);
    		}
    		//sends the email to the recipients
    		try {
    			javaMail.postMail(recipientsEmailArray, subject, messageString, fromEmail);
    		} catch (MessagingException e) {
    			// do nothing, no notification to uber_admin required.
    			e.printStackTrace();
    		}    	
		}
		
	}

	/**
	 * @param javaMail the javaMail to set
	 */
	public void setJavaMail(IMailFacade javaMail) {
		this.javaMail = javaMail;
	}

	/**
	 * @param emaillisteners the emaillisteners to set
	 */
	public void setEmaillisteners(Properties emaillisteners) {
		this.emaillisteners = emaillisteners;
	}

}
