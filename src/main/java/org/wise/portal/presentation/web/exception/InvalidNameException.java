package org.wise.portal.presentation.web.exception;

public class InvalidNameException extends Exception {

  private static final long serialVersionUID = 1L;
  private String messageCode;

  public InvalidNameException(String messageCode) {
    super(messageCode);
    this.messageCode = messageCode;
  }

  public String getMessageCode() {
    return this.messageCode;
  }
}
