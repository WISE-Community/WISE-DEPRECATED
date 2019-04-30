package org.wise.portal.service.session.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.service.session.SessionService;

import java.util.Map;
import java.util.Set;

@Service
public class SessionServiceImpl<S extends Session> implements SessionService {

  @Autowired
  private StringRedisTemplate stringRedisTemplate;

  @Autowired
  private FindByIndexNameSessionRepository<S> sessionRepository;

  public void addSignedInUser(UserDetails userDetails) {
    System.out.println("addSignedInUser");
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

  public void removeSignedInUser(UserDetails userDetails) {
    System.out.println("removeSignedInUser");
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

  public int getNumberSignedInUsers() {
    return stringRedisTemplate.opsForSet().members("signedInUsers").size();
  }

  void outputSignedInUsers() {
    Set<String> signedInUsers = stringRedisTemplate.opsForSet().members("signedInUsers");
    System.out.println("signedInUsers=" + signedInUsers);
  }

  void outputSignedInStudents() {
    Set<String> signedInStudents = stringRedisTemplate.opsForSet().members("signedInStudents");
    System.out.println("signedInStudents=" + signedInStudents);
  }

  void outputSignedInTeachers() {
    Set<String> signedInTeachers = stringRedisTemplate.opsForSet().members("signedInTeachers");
    System.out.println("signedInTeachers=" + signedInTeachers);
  }

}
