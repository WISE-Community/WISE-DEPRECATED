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
package org.telscenter.sail.webapp.domain.message;

import java.util.Date;
import java.util.Set;

import net.sf.sail.webapp.domain.User;

/**
 * A Message from one user to another. Contains:
 * 
 * id
 * originalMessage; used to denote if this message is a reply to a previous message
 * dateSent
 * fromUser
 * toUserId
 * subject 
 * body   
 * 
 * @author hirokiterashima
 * @version $Id:$
 */
public interface Message {
	
	/**
	 * @return the object id
	 */
	public Long getId();
	
	/**
	 * @param id - the id to set
	 */
	public void setId(Long id);
	
	
	/**
	 * @return the original message id
	 */
	public Message getOriginalMessage();
	
	/**
	 * @param id - the original message to set
	 */
	public void setOriginalMessage(Message message);

	/**
	 * @return the Date the Message was sent
	 */
	public Date getDate();
	
	/**
	 * @param date - the Date of the Message to set
	 */
	public void setDate(Date date);
	
	/**
	 * @return User - the Sender of the Message
	 */
	public User getSender();
	
	/**
	 * @param User - the Sender of the Message
	 */
	public void setSender(User sender);
	
	/**
	 * @return MessageRecipient - the Recipient of the Message
	 */
	public Set<MessageRecipient> getRecipients();
	
	/**
	 * @param MessageRecipient - the Recipient of the Message
	 */
	public void setRecipients(Set<MessageRecipient> recipient);
	
	/**
	 * @return String - the Subject of the Message
	 */
	public String getSubject();
	
	/**
	 * @param String - the Subject of the Message
	 */
	public void setSubject(String subject);
	
	/**
	 * @return String - the Body of the Message
	 */
	public String getBody();
	
	/**
	 * @param String - the Body of the Message
	 */
	public void setBody(String body);
}
