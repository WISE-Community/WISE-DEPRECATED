package org.wise.portal.spring.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.MessageDigestPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Properties;

public class CustomPasswordEncoder implements PasswordEncoder {

  private String salt = "secret";

  @Override
  public String encode(CharSequence charSequence) {
    return null;
  }

  @Override
  public boolean matches(CharSequence charSequence, String encodedPassword) {
    String salted = charSequence.toString().concat("{" + salt + "}");
    MessageDigestPasswordEncoder md5Encoder = new MessageDigestPasswordEncoder("MD5");
    return md5Encoder.matches(salted, encodedPassword);
  }
}
