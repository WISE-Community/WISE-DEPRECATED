package org.wise.portal.presentation.web.response;

import java.util.List;

public class SharedOwner {

  public Long id;

  public String username;

  public String firstName;

  public String lastName;

  public List<Integer> permissions;

  public SharedOwner(Long id, String username, String firstName, String lastName, List<Integer> permissions) {
    this.id = id;
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.permissions = permissions;
  }
}
