package org.wise.portal.service.session;

import org.springframework.security.core.userdetails.UserDetails;
import org.wise.portal.domain.project.Project;

import java.util.Set;

public interface SessionService {

  int getNumberSignedInUsers();

  void addSignedInUser(UserDetails userDetails);

  void removeSignedInUser(UserDetails userDetails);

  Set<String> getCurrentAuthors(String projectId);

  void addCurrentAuthor(Project project, UserDetails userDetails);

  void removeCurrentAuthor(Project project, UserDetails author);
}
