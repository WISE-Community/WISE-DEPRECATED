package org.wise.portal.presentation.web.error;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.wise.portal.presentation.web.exception.InvalidNameException;

@ControllerAdvice
public class CustomGlobalExceptionHandler extends ResponseEntityExceptionHandler {

  @ExceptionHandler(InvalidNameException.class)
  public ResponseEntity<Object> handleInvalidNameException(InvalidNameException exception,
      WebRequest request) {
    Map<String, Object> body = new HashMap<>();
    body.put("messageCode", exception.getMessageCode());
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    return new ResponseEntity<>(body, headers, HttpStatus.BAD_REQUEST);
  }
}
