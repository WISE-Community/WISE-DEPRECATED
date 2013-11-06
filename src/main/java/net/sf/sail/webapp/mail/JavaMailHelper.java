/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
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
package net.sf.sail.webapp.mail;

import java.util.Properties;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;

/**
 * Helps easily construct an email message using the JavaMail Framework
 * 
 * @author Anthony Perritano
 * 
 * @version $Id$
 */
public class JavaMailHelper implements IMailFacade {

	private Properties properties;

	private JavaMailSenderImpl sender;

	/**
	 * @see net.sf.sail.webapp.mail.IMailFacade#postMail(java.lang.String[],
	 *      java.lang.String, java.lang.String, java.lang.String)
	 */
	public void postMail(String[] recipients, String subject, String message,
			String from) throws MessagingException {

		postMail(recipients, subject, message, from, null);
	}
	
	public void postMail(String[] recipients, String subject, String message,
			String from, String[] cc) throws MessagingException {
		sender.setUsername((String) properties.getProperty("mail.user"));
		sender.setPassword((String) properties.getProperty("mail.password"));
		sender.setHost((String) properties.getProperty("mail.smtp.host"));
		String portString = (String) properties.getProperty("mail.smtp.port");
		sender.setPort(Integer.valueOf(portString));
		sender.setProtocol((String) properties.getProperty("mail.transport.protocol"));
		sender.setJavaMailProperties(properties);
		MimeMessage mimeMessage = sender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
		helper.setFrom(from);
		helper.setText(message);
		helper.setSubject(subject);
		
		if(cc != null) {
			helper.setCc(cc);
		}
		
		for (String receiver : recipients) {
			if (receiver != null) {
				helper.setTo(receiver);
				sender.send(mimeMessage);
			}
		}
	}

	/**
	 * Sets the email server properties (generally from a properties file).
	 * 
	 * @param properties
	 */
	@Required
	public void setProperties(Properties properties) {
		this.properties = properties;
	}

	/**
	 * @param sender
	 *            the sender to set
	 */
	@Required
	public void setSender(JavaMailSenderImpl sender) {
		this.sender = sender;
	}

}
