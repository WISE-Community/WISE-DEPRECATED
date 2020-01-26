package org.wise.portal.score.controller;

import org.wise.portal.score.domain.Task;
import org.wise.portal.score.domain.Timer;
import org.wise.portal.score.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/api/agent", produces = "application/json;charset=UTF-8")
public class TimerTaskController {

  @Autowired
  private TaskRepository taskRepository;
  public TimerTaskController() {
  }

  @GetMapping("/tasks")
  public List<Task> tasks() {
    Task task = Task.builder().name("activity 1").build();
    this.taskRepository.save(task);
    return this.taskRepository.findAll();
  }

  @GetMapping("/timers")
  public List<Timer> timers() {
     return null;
  }
}
