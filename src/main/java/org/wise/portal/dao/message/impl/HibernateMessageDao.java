/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
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
package org.wise.portal.dao.message.impl;

import java.util.List;

import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.message.MessageDao;
import org.wise.portal.domain.message.Message;
import org.wise.portal.domain.message.impl.MessageImpl;
import org.wise.portal.domain.user.User;

/**
 * @author hirokiterashima
 * @version $Id:$
 */
@Repository
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
		return (List<Message>) this.getHibernateTemplate().find(q);
	}

	@SuppressWarnings("unchecked")
	public List<Message> getListByRecipient(User recipient, boolean isRead) {
		String q = "select message from MessageImpl message inner join message.recipients mrecipient " +
				"inner join mrecipient.recipient user where user.id='" + recipient.getId() + "' and " +
				"mrecipient.isRead=" + isRead;
		return (List<Message>) this.getHibernateTemplate().find(q);
	}

	public List<Message> getListBySender(User sender) {
		return this.retrieveByField("sender", "=", sender);
	}
	
	@SuppressWarnings("unchecked")
    public List<Message> retrieveByField(String field, String type, Object term){
    	return (List<Message>) this.getHibernateTemplate().findByNamedParam(
    			"select message from MessageImpl message where message." + field + " " + type + " :term", "term", term);
    }

}
