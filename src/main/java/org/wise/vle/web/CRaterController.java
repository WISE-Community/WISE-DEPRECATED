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
package org.wise.vle.web;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.wise.vle.domain.webservice.crater.CRaterHttpClient;

import java.util.Properties;

@RestController
public class CRaterController {

  @Autowired
  private Properties appProperties;

  @RequestMapping("/c-rater/score")
  protected String scoreCRaterItem(
      @RequestParam(value = "itemId") String itemId,
      @RequestParam(value = "responseId") String responseId,
      @RequestParam(value = "studentData") String studentData) {
    String cRaterClientId = appProperties.getProperty("cRater_client_id");
    String cRaterScoringUrl = appProperties.getProperty("cRater_scoring_url");
    String cRaterPassword = appProperties.getProperty("cRater_password");
    String responseString = CRaterHttpClient.getCRaterScoringResponse(cRaterScoringUrl,
      cRaterPassword, cRaterClientId, itemId, responseId, studentData);
    JSONObject cRaterResponseJSONObj = new JSONObject();
    try {
      if (CRaterHttpClient.isSingleScore(responseString)) {
        cRaterResponseJSONObj.put("score", CRaterHttpClient.getScore(responseString));
      } else {
        cRaterResponseJSONObj.put("scores", CRaterHttpClient.getScores(responseString));
      }
      cRaterResponseJSONObj.put("cRaterResponse", responseString);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return cRaterResponseJSONObj.toString();
  }

  @RequestMapping("/c-rater/verify")
  protected String verityCRaterItem(
      @RequestParam(value = "itemId") String itemId) throws JSONException {
    String cRaterClientId = appProperties.getProperty("cRater_client_id");
    String cRaterVerificationUrl = appProperties.getProperty("cRater_verification_url");
    String cRaterPassword = appProperties.getProperty("cRater_password");
    String verificationResponse = CRaterHttpClient.getCRaterVerificationResponse(
        cRaterVerificationUrl, cRaterPassword, cRaterClientId, itemId);
    JSONObject response = new JSONObject();
    response.put("isAvailable", verificationResponse.matches("(.*)avail=\"Y\"(.*)"));
    return response.toString();
  }
}
