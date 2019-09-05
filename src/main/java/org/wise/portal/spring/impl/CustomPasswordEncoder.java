package org.wise.portal.spring.impl;

import org.springframework.security.crypto.password.MessageDigestPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class CustomPasswordEncoder implements PasswordEncoder {

  private String salt;

  public CustomPasswordEncoder(String salt) {
    this.salt = salt;
  }

  @Override
  public String encode(CharSequence charSequence) {
    return null;
  }

  @Override
  public boolean matches(CharSequence plainTextPassword, String encodedPassword) {
    String plainTextPasswordWithSalt = plainTextPassword.toString().concat("{" + salt + "}");
    MessageDigestPasswordEncoder md5Encoder = new MessageDigestPasswordEncoder("MD5");
    return md5Encoder.matches(plainTextPasswordWithSalt, encodedPassword);
  }
}
