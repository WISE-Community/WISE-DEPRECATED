package org.wise.portal.service.session.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.project.Project;
import org.wise.portal.service.session.SessionService;

import java.io.Serializable;
import java.util.Map;
import java.util.Set;

@Service
public class SessionServiceImpl<S extends Session> implements SessionService {

  @Autowired
  private StringRedisTemplate stringRedisTemplate;

  @Autowired
  private FindByIndexNameSessionRepository<S> sessionRepository;

  public void addSignedInUser(UserDetails userDetails) {
    stringRedisTemplate.opsForSet().add("signedInUsers", userDetails.getUsername());
    if (userDetails instanceof StudentUserDetails) {
      stringRedisTemplate.opsForSet().add("signedInStudents", userDetails.getUsername());
    } else if (userDetails instanceof TeacherUserDetails) {
      stringRedisTemplate.opsForSet().add("signedInTeachers", userDetails.getUsername());
    }
    outputSignedInUsers();
    outputSignedInStudents();
    outputSignedInTeachers();
  }

  @Override
  public Set<String> getLoggedInStudents() {
    return stringRedisTemplate.opsForSet().members("signedInStudents");
  }

  @Override
  public Set<String> getLoggedInTeachers() {
    return stringRedisTemplate.opsForSet().members("signedInTeachers");
  }

  public void removeSignedInUser(UserDetails userDetails) {
    String username = userDetails.getUsername();
    Map<String, S> sessions = sessionRepository.findByPrincipalName(username);
    if (sessions.size() <= 1) {
      stringRedisTemplate.opsForSet().remove("signedInUsers", userDetails.getUsername());
      if (userDetails instanceof StudentUserDetails) {
        stringRedisTemplate.opsForSet().remove("signedInStudents", userDetails.getUsername());
      } else if (userDetails instanceof TeacherUserDetails) {
        stringRedisTemplate.opsForSet().remove("signedInTeachers", userDetails.getUsername());
      }
    }
    outputSignedInUsers();
    outputSignedInStudents();
    outputSignedInTeachers();
  }

  @Override
  public Set<String> getCurrentlyAuthoredProjects() {
    return stringRedisTemplate.opsForSet().members("currentlyAuthoredProjects");
  }

  public int getNumberSignedInUsers() {
    return stringRedisTemplate.opsForSet().members("signedInUsers").size();
  }

  public void addCurrentAuthor(Project project, UserDetails author) {
    stringRedisTemplate.opsForSet().add("currentlyAuthoredProjects", project.getId().toString());
    stringRedisTemplate.opsForSet().add("currentAuthors:" + project.getId(), author.getUsername());
    outputCurrentlyAuthoredProjects();
    outputAllCurrentAuthors();
  }

  @Override
  public void removeCurrentAuthor(UserDetails author) {
    Set<String> currentlyAuthoredProjects = stringRedisTemplate.opsForSet().members("currentlyAuthoredProjects");
    for (String projectId : currentlyAuthoredProjects) {
      removeCurrentAuthor(projectId, author);
    }
  }

  public void removeCurrentAuthor(Serializable projectId, UserDetails author) {
    stringRedisTemplate.opsForSet().remove("currentAuthors:" + projectId, author.getUsername());
    Long numCurrentAuthorsForProject = stringRedisTemplate.opsForSet().size("currentAuthors:" + projectId);
    if (numCurrentAuthorsForProject == 0) {
      stringRedisTemplate.opsForSet().remove("currentlyAuthoredProjects", projectId.toString());
    }
    outputCurrentlyAuthoredProjects();
    outputAllCurrentAuthors();
  }

  @Override
  public void removeUser(UserDetails user) {
    removeSignedInUser(user);
    if (user instanceof TeacherUserDetails) {
      removeCurrentAuthor(user);
    }
  }

  public Set<String> getCurrentAuthors(String projectId) {
    return stringRedisTemplate.opsForSet().members("currentAuthors:" + projectId);
  }

  private void outputSignedInUsers() {
    Set<String> signedInUsers = stringRedisTemplate.opsForSet().members("signedInUsers");
  }

  private void outputSignedInStudents() {
    Set<String> signedInStudents = stringRedisTemplate.opsForSet().members("signedInStudents");
  }

  private void outputSignedInTeachers() {
    Set<String> signedInTeachers = stringRedisTemplate.opsForSet().members("signedInTeachers");
  }

  private void outputCurrentlyAuthoredProjects() {
    Set<String> currentlyAuthoredProjects = stringRedisTemplate.opsForSet().members("currentlyAuthoredProjects");
  }

  private void outputAllCurrentAuthors() {
    Set<String> currentlyAuthoredProjects = stringRedisTemplate.opsForSet().members("currentlyAuthoredProjects");
    for (String currentlyAuthoredProject : currentlyAuthoredProjects) {
      outputCurrentAuthors(currentlyAuthoredProject);
    }
  }

  private void outputCurrentAuthors(String projectId) {
    Set<String> currentAuthors = stringRedisTemplate.opsForSet().members("currentAuthors:" + projectId);
  }
}
