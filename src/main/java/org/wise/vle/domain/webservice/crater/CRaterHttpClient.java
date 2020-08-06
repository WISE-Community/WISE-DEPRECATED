/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.vle.domain.webservice.crater;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 * Controller for using the CRater scoring servlet via HTTP
 * 
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
public class CRaterHttpClient {

  /**
   * Handles POSTing a CRater Request to the CRater Servlet and returns the CRater response string.
   * 
   * @param cRaterUrl
   *                    the CRater url
   * @param bodyData
   *                    the xml body data to be sent to the CRater server
   * @return the response from the CRater server
   */
  public static String post(String cRaterUrl, String cRaterPassword, String bodyData) {
    String responseString = null;
    if (cRaterUrl != null) {
      HttpClient client = HttpClientBuilder.create().build();
      HttpPost post = new HttpPost(cRaterUrl);
      try {
        String authHeader = "Basic " + javax.xml.bind.DatatypeConverter
            .printBase64Binary(("extsyscrtr02dev:" + cRaterPassword).getBytes());
        post.setHeader(HttpHeaders.AUTHORIZATION, authHeader);
        post.setEntity(new StringEntity(bodyData, ContentType.TEXT_XML));
        HttpResponse response = client.execute(post);
        if (response.getStatusLine().getStatusCode() != HttpStatus.SC_OK) {
          System.err.println("Method failed: " + response.getStatusLine());
        }
        responseString = IOUtils.toString(response.getEntity().getContent());
      } catch (IOException e) {
        System.err.println("Fatal transport error: " + e.getMessage());
        e.printStackTrace();
      } finally {
        post.releaseConnection();
      }
    }
    return responseString;
  }

  /**
   * Sends student work to the CRater server and receives the score as the response
   * 
   * @param cRaterUrl
   *                         the CRater scoring url
   * @param cRaterPassword
   *                         the CRater authorization password
   * @param cRaterClientId
   *                         the client id e.g. WISETEST
   * @param itemId
   *                         the item id e.g. Photo_Sun
   * @param responseId
   *                         the node state timestamp
   * @param studentData
   *                         the student work
   * @return responseBody as a String, or null if there was an error during the request to CRater.
   */
  public static String getCRaterScoringResponse(String cRaterUrl, String cRaterPassword,
      String cRaterClientId, String itemId, String responseId, String studentData) {
    String responseString = null;
    String bodyData = "<crater-request includeRNS='N'><client id='" + cRaterClientId
        + "'/><items><item id='" + itemId + "'>" + "<responses><response id='" + responseId
        + "'><![CDATA[" + studentData
        + "]]></response></responses></item></items></crater-request>";

    responseString = post(cRaterUrl, cRaterPassword, bodyData);
    return responseString;
  }

  /**
   * Makes a request to the CRater server for the scoring rubric for a specific item id.
   * 
   * @param cRaterUrl
   *                         the CRater verification url
   * @param cRaterPassword
   *                         the CRater authorization password
   * @param cRaterClientId
   *                         the client id e.g. WISETEST
   * @param itemId
   *                         the item id e.g. Photo_Sun
   * @return the scoring rubric for the item id
   */
  public static String getCRaterVerificationResponse(String cRaterUrl, String cRaterPassword,
      String cRaterClientId, String itemId) {
    String responseString = null;
    String bodyData = "<crater-verify><client id='" + cRaterClientId + "'/><items><item id='"
        + itemId + "'/></items></crater-verify>";
    responseString = post(cRaterUrl, cRaterPassword, bodyData);
    return responseString;
  }

  /**
   * @param cRaterResponseXML
   *                            Response XML from CRater with one score. Example: <crater-results>
   *                            <tracking id="1013701"/> <client id="WISETEST"/> <items>
   *                            <item id="Photo_Sun"> <responses>
   *                            <response id="testID" score="4" concepts="1,2,3,4,5"/> </responses>
   *                            </item> </items>
   *
   * @return An integer.
   */
  public static int getScore(String cRaterResponseXML) {
    Node response = getResponseNode(cRaterResponseXML);
    String score = response.getAttributes().getNamedItem("score").getNodeValue();
    return Integer.valueOf(score);
  }

  public static Node getResponseNode(String cRaterResponseXML) {
    Document doc = getXMLDocument(cRaterResponseXML);
    NodeList responseList = doc.getElementsByTagName("response");
    return responseList.item(0);
  }

  /**
   * @param cRaterResponseXML
   *                            Response XML from CRater with multiple scores. Example:
   *                            <crater-results> <tracking id="1367459" /> <client id="WISETEST" />
   *                            <items> <item id="STRIDES_EX1"> <responses>
   *                            <response id="1547591618656" score="" realNumberScore=""
   *                            confidenceMeasure="0.99"> <scores>
   *                            <score id="science" score="0" realNumberScore="0.2919" />
   *                            <score id="engineering" score="0" realNumberScore="0.2075" />
   *                            <score id="ki" score="0" realNumberScore="0.2075" /> </scores>
   *                            <advisorylist> <advisorycode>0</advisorycode> </advisorylist>
   *                            </response> </responses> </item> </items> </crater-results>
   * @return A JSONArray of objects.
   */
  public static JSONArray getScores(String cRaterResponseXML) throws JSONException {
    JSONArray scoresJSON = new JSONArray();
    NodeList scoreNodes = getScoreNodes(cRaterResponseXML);
    for (int s = 0; s < scoreNodes.getLength(); s++) {
      Node scoreNode = scoreNodes.item(s);
      JSONObject scoreJSON = convertScoreNodeToJSON(scoreNode);
      scoresJSON.put(scoreJSON);
    }
    return scoresJSON;
  }

  public static NodeList getScoreNodes(String cRaterResponseXML) {
    Document doc = getXMLDocument(cRaterResponseXML);
    return doc.getElementsByTagName("score");
  }

  public static JSONObject convertScoreNodeToJSON(Node scoreNode) throws JSONException {
    NamedNodeMap attributes = scoreNode.getAttributes();
    String id = attributes.getNamedItem("id").getNodeValue();
    String score = attributes.getNamedItem("score").getNodeValue();
    String realNumberScore = attributes.getNamedItem("realNumberScore").getNodeValue();
    JSONObject scoreJSON = new JSONObject();
    scoreJSON.put("id", id);
    scoreJSON.put("score", Integer.parseInt(score));
    scoreJSON.put("realNumberScore", Float.parseFloat(realNumberScore));
    return scoreJSON;
  }

  public static Document getXMLDocument(String cRaterResponseXML) {
    try {
      DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
      DocumentBuilder db = dbf.newDocumentBuilder();
      return db.parse(new ByteArrayInputStream(cRaterResponseXML.getBytes()));
    } catch (ParserConfigurationException e) {
      e.printStackTrace();
    } catch (SAXException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    return null;
  }

  public static boolean isSingleScore(String cRaterResponseXML) {
    Node response = getResponseNode(cRaterResponseXML);
    String score = response.getAttributes().getNamedItem("score").getNodeValue();
    return !"".equals(score);
  }

  /**
   * Gets and Returns the Concepts from the CRater response XML string, or "" if it does not exist.
   * 
   * @param cRaterResponseXML
   *                            response XML from the CRater. Looks like this: <crater-results>
   *                            <tracking id="1013701"/> <client id="WISETEST"/> <items>
   *                            <item id="Photo_Sun"> <responses>
   *                            <response id="testID" score="4" concepts="1,2,3,4,5"/> </responses>
   *                            </item> </items>
   *
   * @return String concepts returned from the CRater. In the case above, this method will return
   *         "1,2,3,4,5".
   */
  public static String getConcepts(String cRaterResponseXML) {
    try {
      DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
      DocumentBuilder db;
      db = dbf.newDocumentBuilder();
      Document doc = db.parse(new ByteArrayInputStream(cRaterResponseXML.getBytes()));
      NodeList responseList = doc.getElementsByTagName("response");
      Node response = responseList.item(0);
      if (response.getAttributes().getNamedItem("concepts") != null) {
        return response.getAttributes().getNamedItem("concepts").getNodeValue();
      } else {
        return "";
      }
    } catch (ParserConfigurationException e) {
      e.printStackTrace();
    } catch (SAXException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    return "";
  }
}
