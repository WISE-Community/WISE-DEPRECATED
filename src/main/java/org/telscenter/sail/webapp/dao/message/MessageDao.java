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
package org.telscenter.sail.webapp.dao.message;

import java.util.List;

import net.sf.sail.webapp.dao.SimpleDao;
import net.sf.sail.webapp.domain.User;

import org.telscenter.sail.webapp.domain.message.Message;

/**
 * DAO for Message domain.
 * @author hirokiterashima
 * @version $Id:$
 */
public interface MessageDao<T extends Message> extends SimpleDao<Message> {

	/**
	 * Retrieves all (read and unread) messages for recipient
	 * @param recipient
	 * @return
	 */
	public List<Message> getListByRecipient(User recipient);

	/**
	 * Retrieves read or unread messages for recipient
	 * @param recipient
	 * @param isRead true iff messages to retrieve has been read. Otherwise,
	 * retrieve only unread messages.
	 * @return
	 */
	public List<T> getListByRecipient(User recipient, boolean isRead);

	/**
	 * Retrieves all messages that the specified user has sent.
	 * @param sender
	 * @return
	 */
	public List<T> getListBySender(User sender);

}
