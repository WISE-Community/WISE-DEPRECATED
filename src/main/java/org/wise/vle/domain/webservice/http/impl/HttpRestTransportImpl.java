/**
 * Copyright (c) 2006-2017 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.vle.domain.webservice.http.impl;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.wise.vle.domain.webservice.HttpStatusCodeException;
import org.wise.vle.domain.webservice.http.AbstractHttpRequest;
import org.wise.vle.domain.webservice.http.HttpGetRequest;
import org.wise.vle.domain.webservice.http.HttpPostRequest;
import org.wise.vle.domain.webservice.http.HttpPutRequest;
import org.wise.vle.domain.webservice.http.HttpRestTransport;

/**
 * Thread-safe Http transport implementation which uses the Jakarta Commons
 * HttpClient package. See http://jakarta.apache.org/commons/httpclient/
 *
 * @author Cynick Young
 */
public class HttpRestTransportImpl implements HttpRestTransport {

  private Log logger;

  private String baseUrl;

  private HttpClient client;

  /**
   * Constructs a newly allocated HttpRestTransportImpl object.
   */
  public HttpRestTransportImpl() {
    // Must manually release the connection by calling releaseConnection()
    // on the method, otherwise there will be a resource leak. Refer to
    // http://jakarta.apache.org/commons/httpclient/threading.html
    client = HttpClientBuilder.create().build();
    logger = LogFactory.getLog(getClass());
  }

  public String getBaseUrl() {
    return baseUrl;
  }

  public void setBaseUrl(String baseUrl) {
    this.baseUrl = baseUrl;
  }

  public InputStream get(final HttpGetRequest httpGetRequestData) throws HttpStatusCodeException {
    Map<String, String> requestParameters = httpGetRequestData.getRequestParameters();
    StringBuffer buffer = new StringBuffer(baseUrl);
    buffer.append(httpGetRequestData.getRelativeUrl());
    if (requestParameters != null && !requestParameters.isEmpty()) {
      buffer.append('?');
      Set<String> keys = requestParameters.keySet();
      for (String key : keys) {
        buffer.append(key).append('=').append(
          requestParameters.get(key)).append('&');
      }
      buffer.deleteCharAt(buffer.length() - 1);
    }

    HttpGet request = new HttpGet(buffer.toString());

    setHeaders(httpGetRequestData, request);
    try {
      logRequest(request, "");
      HttpResponse response = client.execute(request);
      httpGetRequestData.isValidResponseStatus(response);
      return response.getEntity().getContent();
    } catch (HttpStatusCodeException hsce) {
      logAndThrowRuntimeException(hsce);
    } catch (IOException ioe) {
      logAndThrowRuntimeException(ioe);
    } finally {
      request.releaseConnection();
    }
    return null;
  }

  public HttpResponse post(final HttpPostRequest httpPostRequestData)
      throws HttpStatusCodeException {
    HttpResponse response = null;
    HttpClient client = HttpClientBuilder.create().build();
    HttpPost post = new HttpPost(baseUrl + httpPostRequestData.getRelativeUrl());
    setHeaders(httpPostRequestData, post);
    List<NameValuePair> urlParameters = new ArrayList<NameValuePair>();
    final Map<String, String> requestParameters = httpPostRequestData.getRequestParameters();
    if (requestParameters != null && !requestParameters.isEmpty()) {
      final Set<String> keys = requestParameters.keySet();
      for (Iterator<String> i = keys.iterator(); i.hasNext();) {
        String key = i.next();
        urlParameters.add(new BasicNameValuePair(key, requestParameters.get(key)));
      }
    }

    try {
      post.setEntity(new UrlEncodedFormEntity(urlParameters));
      final String bodyData = httpPostRequestData.getBodyData();
      if (bodyData != null) {
        post.setEntity(new StringEntity(bodyData));
      }
      logRequest(post, bodyData);
      response = client.execute(post);
      httpPostRequestData.isValidResponseStatus(response);
    } catch (IOException e) {
      logAndThrowRuntimeException(e);
    } finally {
      post.releaseConnection();
    }
    return response;
  }

  public HttpResponse put(final HttpPutRequest httpPutRequestData) throws HttpStatusCodeException {
    HttpResponse response = null;
    HttpClient client = HttpClientBuilder.create().build();
    HttpPut put = new HttpPut(baseUrl + httpPutRequestData.getRelativeUrl());
    setHeaders(httpPutRequestData, put);
    final String bodyData = httpPutRequestData.getBodyData();

    final Map<String, String> responseHeaders = new HashMap<String, String>();
    try {
      logRequest(put, bodyData);
      response = client.execute(put);
      httpPutRequestData.isValidResponseStatus(response);
    } catch (IOException e) {
      logAndThrowRuntimeException(e);
    } finally {
      put.releaseConnection();
    }

    return response;
  }

  private void logRequest(HttpRequestBase request, String bodyData) {
    if (logger.isInfoEnabled()) {
      logger.info(request.getMethod() + ": " + request.getURI());
      if (bodyData != "")
        logger.info(request.getMethod() + ": " + bodyData);
    }
  }

  private void logAndThrowRuntimeException(Exception e) throws RuntimeException {
    if (logger.isErrorEnabled()) {
      logger.error(e.getMessage(), e);
    }
    throw new RuntimeException(e);
  }

  private void setHeaders(final AbstractHttpRequest httpRequestData, HttpRequestBase request) {
    final Map<String, String> requestHeaders = httpRequestData.getRequestHeaders();
    if (requestHeaders != null && !requestHeaders.isEmpty()) {
      Set<String> keys = requestHeaders.keySet();
      for (String key : keys) {
        request.addHeader(key, requestHeaders.get(key));
      }
    }
  }
}
