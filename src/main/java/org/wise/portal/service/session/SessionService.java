package org.wise.portal.service.session;

import java.io.Serializable;
import java.util.Set;

import org.springframework.security.core.userdetails.UserDetails;

public interface SessionService {

  int getNumberSignedInUsers();

  void addSignedInUser(UserDetails user);

  Set<String> getLoggedInStudents();

  Set<String> getLoggedInTeachers();

  void removeSignedInUser(UserDetails user);

  Set<String> getCurrentlyAuthoredProjects();

  Set<String> getCurrentAuthors(Serializable projectId);

  void addCurrentAuthor(Serializable projectdId, String authorUsername);

  void removeCurrentAuthor(UserDetails author);

  void removeCurrentAuthor(Serializable projectdId, String authorUsername);

  void removeUser(UserDetails user);
}
