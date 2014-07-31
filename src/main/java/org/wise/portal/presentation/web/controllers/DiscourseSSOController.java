/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3.
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
package org.wise.portal.presentation.web.controllers;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Properties;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.util.http.Base64;

/**
 * Handles Single Sign-On (SSO) from Discourse, an open source discussion form
 * @author Hiroki Terashima
 * @version $Id:$
 */
@Controller
public class DiscourseSSOController {

	@Autowired
	private Properties wiseProperties;

	@RequestMapping("/sso/discourse.html")
	protected ModelAndView handleRequestInternal(
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		// make sure this WISE instance supports discourse SSO.
		String secretKey = wiseProperties.getProperty("discourse_sso_secret_key");
		String discourseURL = wiseProperties.getProperty("discourse_url");
		if (secretKey == null || secretKey.isEmpty() || discourseURL == null || discourseURL.isEmpty()) {
			return null;
		}
		String discourseSSOLoginURL = discourseURL + "/session/sso_login";

		String base64EncodedSSOParam = request.getParameter("sso");   // "sso" contains Base64-encoded query string, e.g. "nonce=ABCD"
		String base64DecodedSSOParam = new String(Base64.decode(base64EncodedSSOParam), "UTF-8");
		if (!base64DecodedSSOParam.startsWith("nonce=")) {
			return null;
		}
		String nonce = base64DecodedSSOParam.substring(6);

		// check validity of message using the agreed secret key
		String algorithm = "HmacSHA256";
		String hMACSHA256Message = hmacDigest(base64EncodedSSOParam, secretKey, algorithm);
		String sigParam = request.getParameter("sig");   // "sig" contains HMAC-signed (payload,secret key)
		if (!hMACSHA256Message.equals(sigParam)) {
			return null;  // signature is not valid. It was not signed with the agreed-upon secret key.
		}
		
		// At this point, the signature is valid. Now, we redirect back to Discourse with info that it needs about the logged-in user.

		// create a new payload with nonce, external_id=WISE_USER_ID, username=WISE_USERNAME, name=First name + Last name, email=WISE_USER_EMAIL)
		User signedInUser = ControllerUtil.getSignedInUser();
		String wiseUserId = URLEncoder.encode(signedInUser.getId().toString(), "UTF-8");
		String username = URLEncoder.encode(signedInUser.getUserDetails().getUsername(), "UTF-8");	
		String name = URLEncoder.encode(signedInUser.getUserDetails().getFirstname() + " " + signedInUser.getUserDetails().getLastname(), "UTF-8");
		String email = URLEncoder.encode(signedInUser.getUserDetails().getEmailAddress(), "UTF-8");
		String payLoadString = "nonce="+nonce+"&name="+name+"&username="+username+"&email="+email+"&external_id="+wiseUserId;
		
		String payLoadStringBase64Encoded = Base64.encodeBytes(payLoadString.getBytes()); // base64-encode the payload.
		String payLoadStringBase64EncodedURLEncoded = URLEncoder.encode(payLoadStringBase64Encoded, "UTF-8");  // url-encode it to send over http(s).
		String payLoadStringBase64EncodedHMACSHA256Signed = hmacDigest(payLoadStringBase64Encoded, secretKey, algorithm);  // sign the base64-encoded payload
		discourseSSOLoginURL += "?sso="+payLoadStringBase64EncodedURLEncoded + "&sig="+payLoadStringBase64EncodedHMACSHA256Signed;  // append params to redirect URL

		RedirectView redirectView = new RedirectView(discourseSSOLoginURL);
		return new ModelAndView(redirectView);
	}

	/**
	 * Given message, key, and algorithm, returns Hashed Message Authentication Code (HMAC) digest
	 * 
	 * @param msg
	 * @param secretKey
	 * @param algorithm
	 * @return
	 */
	public static String hmacDigest(String msg, String secretKey, String algorithm) {
		String digest = null;
		try {
			SecretKeySpec key = new SecretKeySpec((secretKey).getBytes("UTF-8"), algorithm);
			Mac mac = Mac.getInstance(algorithm);
			mac.init(key);

			byte[] bytes = mac.doFinal(msg.getBytes("ASCII"));

			StringBuffer hash = new StringBuffer();
			for (int i = 0; i < bytes.length; i++) {
				String hex = Integer.toHexString(0xFF & bytes[i]);
				if (hex.length() == 1) {
					hash.append('0');
				}
				hash.append(hex);
			}
			digest = hash.toString();
		} catch (UnsupportedEncodingException e) {
		} catch (InvalidKeyException e) {
		} catch (NoSuchAlgorithmException e) {
		}
		return digest;
	}
}
