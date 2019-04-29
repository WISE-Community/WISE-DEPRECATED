package org.wise.vle.domain;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WebSocketMessage {
  private String type;
  private Object content;

  public WebSocketMessage() {
  }

  public WebSocketMessage(String type, Object content) {
    this.type = type;
    this.content = content;
  }
}
