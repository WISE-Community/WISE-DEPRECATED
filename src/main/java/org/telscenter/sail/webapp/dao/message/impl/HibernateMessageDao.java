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
package org.telscenter.sail.webapp.dao.message.impl;

import java.util.List;

import org.telscenter.sail.webapp.dao.message.MessageDao;
import org.telscenter.sail.webapp.domain.message.Message;
import org.telscenter.sail.webapp.domain.message.impl.MessageImpl;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;
import net.sf.sail.webapp.domain.User;

/**
 * @author hirokiterashima
 * @version $Id:$
 */
public class HibernateMessageDao 
	extends AbstractHibernateDao<Message> implements MessageDao<Message>{

	private static final String FIND_ALL_QUERY = "from MessageImpl";
	
	@Override
	protected Class<MessageImpl> getDataObjectClass() {
		return MessageImpl.class;
	}

	@Override
	protected String getFindAllQuery() {
		return FIND_ALL_QUERY;
	}

	@SuppressWarnings("unchecked")
	public List<Message> getListByRecipient(User recipient) {
		String q = "select message from MessageImpl message inner join message.recipients mrecipient " +
				"inner join mrecipient.recipient user where user.id='" + recipient.getId() + "'";
		return this.getHibernateTemplate().find(q);
	}

	@SuppressWarnings("unchecked")
	public List<Message> getListByRecipient(User recipient, boolean isRead) {
		String q = "select message from MessageImpl message inner join message.recipients mrecipient " +
				"inner join mrecipient.recipient user where user.id='" + recipient.getId() + "' and " +
				"mrecipient.isRead=" + isRead;
		return this.getHibernateTemplate().find(q);
	}

	public List<Message> getListBySender(User sender) {
		return this.retrieveByField("sender", "=", sender);
	}
	
	@SuppressWarnings("unchecked")
    public List<Message> retrieveByField(String field, String type, Object term){
    	return this.getHibernateTemplate().findByNamedParam(
    			"select message from MessageImpl message where message." + field + " " + type + " :term", "term", term);
    }

}
