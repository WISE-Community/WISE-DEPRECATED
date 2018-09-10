package org.wise.portal.presentation.web.exception;

public class IncorrectPasswordException extends Exception {

  private String message;

  public IncorrectPasswordException() {
  }

  public IncorrectPasswordException(String message) {
    this.message = message;
  }

  @Override
  public String getMessage() { return this.message; }
}
