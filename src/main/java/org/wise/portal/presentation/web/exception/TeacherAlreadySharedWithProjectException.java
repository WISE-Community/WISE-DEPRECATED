package org.wise.portal.presentation.web.exception;

public class TeacherAlreadySharedWithProjectException extends Exception {
  private static final long serialVersionUID = 1L;

  private String message;

  public TeacherAlreadySharedWithProjectException(String message){
    this.message = message;
  }

  @Override
  public String getMessage(){
    return this.message;
  }
}
