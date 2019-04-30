package org.wise.portal.service.session;

import org.springframework.security.core.userdetails.UserDetails;

public interface SessionService {
  void addSignedInUser(UserDetails userDetails);
  void removeSignedInUser(UserDetails userDetails);
  int getNumberSignedInUsers();
}
