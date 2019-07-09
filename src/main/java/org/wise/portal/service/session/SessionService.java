package org.wise.portal.service.session;

import org.springframework.security.core.userdetails.UserDetails;
import org.wise.portal.domain.project.Project;

import java.io.Serializable;
import java.util.Set;

public interface SessionService {

  int getNumberSignedInUsers();

  void addSignedInUser(UserDetails user);

  Set<String> getLoggedInStudents();

  Set<String> getLoggedInTeachers();

  void removeSignedInUser(UserDetails user);

  Set<String> getCurrentlyAuthoredProjects();

  Set<String> getCurrentAuthors(String projectId);

  void addCurrentAuthor(Project project, UserDetails author);

  void removeCurrentAuthor(UserDetails author);

  void removeCurrentAuthor(Serializable id, UserDetails author);

  void removeUser(UserDetails user);
}
