/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package net.sf.sail.webapp.dao.sds.impl;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import net.sf.sail.webapp.domain.webservice.http.HttpRestTransport;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.springframework.beans.factory.annotation.Required;

/**
 * Abstract implementation of an SDS command using HTTP REST.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public abstract class AbstractHttpRestCommand {

    private static final String HEADER_CONTENT_TYPE = "Content-Type";

    private static final String HEADER_ACCEPT = "Accept";

    public static final Map<String, String> EMPTY_STRING_MAP = Collections
            .emptyMap();

    protected static final Map<String, String> REQUEST_HEADERS_CONTENT;
    static {
        Map<String, String> map = new HashMap<String, String>(1);
        map.put(HEADER_CONTENT_TYPE, HttpRestTransport.APPLICATION_XML);
        REQUEST_HEADERS_CONTENT = Collections.unmodifiableMap(map);
    }

    public static final Map<String, String> REQUEST_HEADERS_ACCEPT;

	protected static final Log logger = LogFactory
	            .getLog(AbstractHttpRestCommand.class);
    static {
        Map<String, String> map = new HashMap<String, String>(1);
        map.put(HEADER_ACCEPT, HttpRestTransport.APPLICATION_XML);
        REQUEST_HEADERS_ACCEPT = Collections.unmodifiableMap(map);
    }

    protected HttpRestTransport transport;

    /**
     * Sets the http REST transport mechanism for the create command.
     * 
     * @param transport
     *            the transport to set
     */
    @Required
    public void setTransport(final HttpRestTransport transport) {
        this.transport = transport;
    }

	protected Document convertXmlInputStreamToXmlDocument(InputStream inputStream) {
	    SAXBuilder builder = new SAXBuilder();
	    Document doc = null;
	    try {
	        if (logger.isDebugEnabled()) {
	            logResponse(inputStream);
	        }
	        doc = builder.build(inputStream);
	    } catch (JDOMException e) {
	        if (logger.isErrorEnabled()) {
	            logger.error(e.getMessage(), e);
	        }
	    } catch (IOException e) {
	        if (logger.isErrorEnabled()) {
	            logger.error(e.getMessage(), e);
	        }
	    } finally {
	        try {
	            inputStream.close();
	        } catch (IOException e) {
	            if (logger.isErrorEnabled()) {
	                logger.error(e.getMessage(), e);
	            }
	        }
	    }
	    return doc;
	}
	
	protected static String convertXMLInputStreamToString(InputStream stream) {
		StringBuilder xmlBuffer = new StringBuilder();
		byte[] buffer = new byte[4096];
		try {
			for (int n; (n = stream.read(buffer)) != -1;) {
				xmlBuffer.append(new String(buffer, 0, n));
			}
		} catch (IOException e) {
			//ignore and return empty string
		}
		return xmlBuffer.toString();
	}

	private void logResponse(InputStream responseStream) throws IOException {
	    byte[] responseBuffer = new byte[responseStream.available()];
	    responseStream.read(responseBuffer);
	    logger.debug(new String(responseBuffer));
	    responseStream.reset();
	}
}