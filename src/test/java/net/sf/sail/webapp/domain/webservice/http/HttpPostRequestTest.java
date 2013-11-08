/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
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
package net.sf.sail.webapp.domain.webservice.http;

import java.util.HashMap;
import java.util.Map;

import junit.framework.TestCase;
import net.sf.sail.webapp.domain.webservice.BadHeaderException;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class HttpPostRequestTest extends TestCase {

  private static final Map<String, String> requestHeaders = new HashMap<String, String>();

  private static final Map<String, String> requestParameters = new HashMap<String, String>();

  private static final String bodyData = "";

  private static final String url = "";

  private static final int expectedResponseStatusCode = 0;

  /**
   * @see junit.framework.TestCase#setUp()
   */
  protected void setUp() throws Exception {
    super.setUp();
  }

  /**
   * @see junit.framework.TestCase#tearDown()
   */
  protected void tearDown() throws Exception {
    super.tearDown();
  }

  /**
   * Test method for
   * {@link net.sf.sail.webapp.domain.webservice.http.HttpPostRequest#HttpPostRequest(java.util.Map, java.util.Map, java.lang.String, java.lang.String, int)}.
   */
  public void testHttpPostRequest() {
    requestHeaders.put("legal-field-name", "legal field content");
    assertNotNull(new HttpPostRequest(requestHeaders, requestParameters,
        bodyData, url, expectedResponseStatusCode));

    requestHeaders.clear();
    requestHeaders.put("", "field content");
    try {
      new HttpPostRequest(requestHeaders, requestParameters, bodyData, url,
          expectedResponseStatusCode);
      fail("Expected BadRequestException");
    }
    catch (BadHeaderException e) {
    }

    requestHeaders.clear();
    requestHeaders.put(
        "\u0001illegal\u0001-field\u0001-name\u0001-with-\u0001",
        "field content");
    try {
      new HttpPostRequest(requestHeaders, requestParameters, bodyData, url,
          expectedResponseStatusCode);
      fail("Expected BadRequestException");
    }
    catch (BadHeaderException e) {
    }

    requestHeaders.clear();
    requestHeaders.put("illegal-field-name-with\ttab", "field content");
    try {
      new HttpPostRequest(requestHeaders, requestParameters, bodyData, url,
          expectedResponseStatusCode);
      fail("Expected BadRequestException");
    }
    catch (BadHeaderException e) {
    }

    requestHeaders.clear();
    requestHeaders.put("illegal field name with spaces", "field content");
    try {
      new HttpPostRequest(requestHeaders, requestParameters, bodyData, url,
          expectedResponseStatusCode);
      fail("Expected BadRequestException");
    }
    catch (BadHeaderException e) {
    }

    requestHeaders.clear();
    requestHeaders.put("(illegal)-<field>-[name]-{with}-?", "field content");
    try {
      new HttpPostRequest(requestHeaders, requestParameters, bodyData, url,
          expectedResponseStatusCode);
      fail("Expected BadRequestException");
    }
    catch (BadHeaderException e) {
    }

    requestHeaders.clear();
    requestHeaders.put("legal-field-name",
        "\u0001 illegal \u0001 field \u0001 content \u0001 with \u0001");
    try {
      new HttpPostRequest(requestHeaders, requestParameters, bodyData, url,
          expectedResponseStatusCode);
      fail("Expected BadRequestException");
    }
    catch (BadHeaderException e) {
    }
  }
}