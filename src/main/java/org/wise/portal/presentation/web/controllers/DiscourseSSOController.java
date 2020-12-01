package org.wise.portal.presentation.web.controllers;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Properties;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.util.http.Base64;
import org.wise.portal.service.user.UserService;

@Controller
public class DiscourseSSOController {

  @Autowired
  Properties appProperties;

  @Autowired
  UserService userService;

  @GetMapping("/sso/discourse")
  protected RedirectView discourseSSOLogin(@RequestParam("sso") String base64EncodedSSO,
  @RequestParam("sig") String sigParam, Authentication auth) throws Exception {
    String secretKey = appProperties.getProperty("discourse_sso_secret_key");
    String discourseURL = appProperties.getProperty("discourse_url");
    if (secretKey == null || secretKey.isEmpty() || discourseURL == null || discourseURL.isEmpty()) {
      return null;
    }
    String base64DecodedSSO = new String(Base64.decode(base64EncodedSSO), "UTF-8");
    if (!base64DecodedSSO.startsWith("nonce=")) {
      return null;
    }
    String nonce = base64DecodedSSO.substring(6);
    String algorithm = "HmacSHA256";
    String hMACSHA256Message = hmacDigest(base64EncodedSSO, secretKey, algorithm);
    if (!hMACSHA256Message.equals(sigParam)) {
      return null;
    }
    User user = userService.retrieveUserByUsername(auth.getName());
    return new RedirectView(
        generateDiscourseSSOLoginURL(secretKey, discourseURL, nonce, algorithm, user));
  }

  private String generateDiscourseSSOLoginURL(String secretKey, String discourseURL, String nonce,
      String algorithm, User user) throws UnsupportedEncodingException {
    String wiseUserId = URLEncoder.encode(user.getId().toString(), "UTF-8");
    MutableUserDetails userDetails = user.getUserDetails();
    String username = URLEncoder.encode(userDetails.getUsername(), "UTF-8");
    String name =
        URLEncoder.encode(userDetails.getFirstname() + " " + userDetails.getLastname(), "UTF-8");
    String email = URLEncoder.encode(userDetails.getEmailAddress(), "UTF-8");
    String payLoadString = "nonce=" + nonce + "&name=" + name + "&username=" + username +
        "&email=" + email + "&external_id=" + wiseUserId;
    String payLoadStringBase64Encoded = Base64.encodeBytes(payLoadString.getBytes());
    String payLoadStringBase64EncodedURLEncoded =
        URLEncoder.encode(payLoadStringBase64Encoded, "UTF-8");
    String payLoadStringBase64EncodedHMACSHA256Signed =
        hmacDigest(payLoadStringBase64Encoded, secretKey, algorithm);
    String discourseSSOLoginURL = discourseURL + "/session/sso_login" +
        "?sso=" + payLoadStringBase64EncodedURLEncoded +
        "&sig=" + payLoadStringBase64EncodedHMACSHA256Signed;
    return discourseSSOLoginURL;
  }

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
