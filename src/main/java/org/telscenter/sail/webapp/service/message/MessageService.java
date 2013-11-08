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
package org.telscenter.sail.webapp.service.message;

import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;

import org.telscenter.sail.webapp.domain.message.Message;
import org.telscenter.sail.webapp.domain.message.MessageRecipient;

/**
 * A service for <code>Message</code> objects
 * @author hirokiterashima
 * @version $Id:$
 */
public interface MessageService {

	/**
	 * Stores the message in the data store.
	 * 
	 * @param message Message with date and id omitted.
	 * @return message with date and id filled in.
	 */
	public Message saveMessage(Message message);
	
	/**
	 * Returns true if the given <code>User</code> is a recipient
	 * of the message and the update operation succeeds, returns
	 * false otherwise.
	 * 
	 * @param message
	 */
	public boolean markMessageRead(Message message,boolean isRead, User user);
	
	/**
	 * Retrieves all messages that the logged in user
	 * has received.
	 * @return
	 */
	public List<Message> retrieveMessages(User loggedInUser);

	/**
	 * Retrieves all messages that the logged in user
	 * has received and has not read.
	 * @return
	 */
	public List<Message> retrieveUnreadMessages(User loggedInUser);

	/**
	 * Retrieves all messages that the logged in user
	 * has received and has read.
	 * @return
	 */
	public List<Message> retrieveReadMessages(User loggedInUser);

	/**
	 * Retrieves messages that the logged in user
	 * has sent.
	 * @return
	 */
	public List<Message> retrieveSentMessages(User loggedInUser);
	
	/**
	 * Retrieves a Message given its id.
	 * @param id
	 * @return
	 * @throws ObjectNotFoundException
	 */
	public Message retrieveById(Long id) throws ObjectNotFoundException;
	
	/**
	 * Handles composing a message from the specified user to another.
	 * all of the parameters needed to compose a request are in the request object.
	 * Sends an email to the recipient
	 * @param request
	 * @param user
	 * @param originalMessage if not null, this is a reply
	 * @return true iff message was successfully composed and sent.
	 */
	public boolean sendMessage(HttpServletRequest request, User sender, Set<MessageRecipient> recipients, Message originalMessage);
	
	/**
	 * Given a <code>Message</code>, emails that message.
	 * 
	 * @param message
	 */
	public void emailMessage(Message message);
}
