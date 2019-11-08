/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.dao.work.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.wise.portal.dao.work.EventDao;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.junit.AbstractTransactionalDbTests;
import org.wise.vle.domain.work.Event;

/**
 * @author Geoffrey Kwan
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateEventDaoTest extends AbstractTransactionalDbTests {
  
  private Group period1, period2;
  private User teacher1, student1, student2;
  private Run run;
  private Workgroup workgroup1, workgroup2;
  private List<JSONObject> components;
  private Event event1;
  
  @Autowired
  private EventDao<Event> eventDao;

  @Before
  public void setUp() throws Exception {
    super.setUp();
    period1 = createPeriod("Period 1");
    period2 = createPeriod("Period 2");
    teacher1 = createTeacherUser("Mrs", "Puff", "MrsPuff", "Mrs. Puff", "boat", "Bikini Bottom",
        "Water State", "Pacific Ocean", "mrspuff@bikinibottom.com", "Boating School",
        Schoollevel.COLLEGE, "1234567890");
    student1 = createStudentUser("Spongebob", "Squarepants", "SpongebobS0101", "burger", 1, 1,
        Gender.MALE);
    student2 = createStudentUser("Patrick", "Star", "PatrickS0101", "rock", 1, 1, Gender.MALE);
    Long id = getNextAvailableProjectId();
    String projectName = "How to be a Fry Cook";
    Date startTime = Calendar.getInstance().getTime();
    String runCode = "Panda123";
    run = createProjectAndRun(id, projectName, teacher1, startTime, runCode);
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    workgroup1 = createWorkgroup(members1, run, period1);
    Set<User> members2 = new HashSet<User>();
    members2.add(student2);
    workgroup2 = createWorkgroup(members2, run, period2);
    JSONObject component = new JSONObject();
    component.put("nodeId", "node2");
    component.put("componentId", "12345abcde");
    components = new ArrayList<JSONObject>();
    components.add(component);
    event1 = createEvent(run, period1, workgroup1, "node1", null, null, "VLE", "Navigation",
        "nodeEntered", "event1", null);
    createEvent(run, period1, workgroup1, "node2", "12345abcde", "MultipleChoice",
        "Component", "StudentInteraction", "buttonClicked", "event2", components);
    createEvent(run, period2, workgroup2, "node1", null, null, "VLE", "Navigation",
        "nodeEntered", "event3", null);
    createEvent(run, period2, workgroup2, "node2", "12345abcde", "MultipleChoice",
        "Component", "StudentInteraction", "buttonClicked", "event4", components);
    toilet.flush();
  }

  private Event createEvent(Run run, Group period, Workgroup workgroup, String nodeId,
      String componentId, String componentType, String context, String category, String eventType,
      String data, List<JSONObject> components) {
    Event event = new Event();
    event.setRun(run);
    event.setPeriod(period);
    event.setWorkgroup(workgroup);
    event.setNodeId(nodeId);
    event.setComponentId(componentId);
    event.setComponentType(componentType);
    event.setContext(context);
    event.setCategory(category);
    event.setEvent(eventType);
    event.setData(data);
    Long milliseconds = System.currentTimeMillis();
    event.setClientSaveTime(new Timestamp(milliseconds));
    event.setServerSaveTime(new Timestamp(milliseconds));
    eventDao.save(event);
    return event;
  }

  @Test
  public void getEventsByParam_ByNonExistingId_ShouldReturnNoEvents() {
    Integer id = 100;
    Run run = null;
    Group period = null;
    Workgroup workgroup = null;
    String nodeId = null;
    String componentId = null;
    String componentType = null;
    String context = null;
    String category = null;
    String event = null;
    List<JSONObject> components = null;
    List<Event> events = eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId,
        componentType, context, category, event, components);
    assertEquals(0, events.size());
  }

  @Test
  public void getEventsByParam_ByExistingId_ShouldReturnEvents() {
    Integer id = event1.getId();
    Run run = null;
    Group period = null;
    Workgroup workgroup = null;
    String nodeId = null;
    String componentId = null;
    String componentType = null;
    String context = null;
    String category = null;
    String eventType = null;
    List<JSONObject> components = null;
    List<Event> events = eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId,
        componentType, context, category, eventType, components);
    assertEquals(1, events.size());
    assertEquals("event1", events.get(0).getData());
  }

  @Test
  public void getEventsByParam_ByExistingRun_ShouldReturnEvents() {
    Integer id = null;
    Run run = this.run;
    Group period = null;
    Workgroup workgroup = null;
    String nodeId = null;
    String componentId = null;
    String componentType = null;
    String context = null;
    String category = null;
    String eventType = null;
    List<JSONObject> components = null;
    List<Event> events = eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId,
        componentType, context, category, eventType, components);
    assertEquals(4, events.size());
    assertEquals("event1", events.get(0).getData());
    assertEquals("event2", events.get(1).getData());
    assertEquals("event3", events.get(2).getData());
    assertEquals("event4", events.get(3).getData());

  }

  @Test
  public void getEventsByParam_ByExistingPeriod_ShouldReturnEvents() {
    Integer id = null;
    Run run = this.run;
    Group period = period1;
    Workgroup workgroup = null;
    String nodeId = null;
    String componentId = null;
    String componentType = null;
    String context = null;
    String category = null;
    String eventType = null;
    List<JSONObject> components = null;
    List<Event> events = eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId,
        componentType, context, category, eventType, components);
    assertEquals(2, events.size());
    assertEquals("event1", events.get(0).getData());
    assertEquals("event2", events.get(1).getData());
  }

  @Test
  public void getEventsByParam_ByExistingWorkgroup_ShouldReturnEvents() {
    Integer id = null;
    Run run = this.run;
    Group period = null;
    Workgroup workgroup = workgroup1;
    String nodeId = null;
    String componentId = null;
    String componentType = null;
    String context = null;
    String category = null;
    String eventType = null;
    List<JSONObject> components = null;
    List<Event> events = eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId,
        componentType, context, category, eventType, components);
    assertEquals(2, events.size());
    assertEquals("event1", events.get(0).getData());
    assertEquals("event2", events.get(1).getData());
  }

  @Test
  public void getEventsByParam_ByExistingNodeId_ShouldReturnEvents() {
    Integer id = null;
    Run run = this.run;
    Group period = null;
    Workgroup workgroup = null;
    String nodeId = "node1";
    String componentId = null;
    String componentType = null;
    String context = null;
    String category = null;
    String eventType = null;
    List<JSONObject> components = null;
    List<Event> events = eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId,
        componentType, context, category, eventType, components);
    assertEquals(2, events.size());
    assertEquals("event1", events.get(0).getData());
    assertEquals("event3", events.get(1).getData());
  }

  @Test
  public void getEventsByParam_ByExistingComponentId_ShouldReturnEvents() {
    Integer id = null;
    Run run = this.run;
    Group period = null;
    Workgroup workgroup = null;
    String nodeId = null;
    String componentId = "12345abcde";
    String componentType = null;
    String context = null;
    String category = null;
    String eventType = null;
    List<JSONObject> components = null;
    List<Event> events = eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId,
        componentType, context, category, eventType, components);
    assertEquals(2, events.size());
    assertEquals("event2", events.get(0).getData());
    assertEquals("event4", events.get(1).getData());
  }

  @Test
  public void getEventsByParam_ByExistingComponentType_ShouldReturnEvents() {
    Integer id = null;
    Run run = this.run;
    Group period = null;
    Workgroup workgroup = null;
    String nodeId = null;
    String componentId = null;
    String componentType = "MultipleChoice";
    String context = null;
    String category = null;
    String eventType = null;
    List<JSONObject> components = null;
    List<Event> events = eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId,
        componentType, context, category, eventType, components);
    assertEquals(2, events.size());
    assertEquals("event2", events.get(0).getData());
    assertEquals("event4", events.get(1).getData());
  }

  @Test
  public void getEventsByParam_ByExistingContext_ShouldReturnEvents() {
    Integer id = null;
    Run run = this.run;
    Group period = null;
    Workgroup workgroup = null;
    String nodeId = null;
    String componentId = null;
    String componentType = null;
    String context = "Component";
    String category = null;
    String eventType = null;
    List<JSONObject> components = null;
    List<Event> events = eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId,
        componentType, context, category, eventType, components);
    assertEquals(2, events.size());
    assertEquals("event2", events.get(0).getData());
    assertEquals("event4", events.get(1).getData());
  }

  @Test
  public void getEventsByParam_ByExistingCategory_ShouldReturnEvents() {
    Integer id = null;
    Run run = this.run;
    Group period = null;
    Workgroup workgroup = null;
    String nodeId = null;
    String componentId = null;
    String componentType = null;
    String context = null;
    String category = "Navigation";
    String eventType = null;
    List<JSONObject> components = null;
    List<Event> events = eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId,
        componentType, context, category, eventType, components);
    assertEquals(2, events.size());
    assertEquals("event1", events.get(0).getData());
    assertEquals("event3", events.get(1).getData());
  }

  @Test
  public void getEventsByParam_ByExistingEventType_ShouldReturnEvents() {
    Integer id = null;
    Run run = this.run;
    Group period = null;
    Workgroup workgroup = null;
    String nodeId = null;
    String componentId = null;
    String componentType = null;
    String context = null;
    String category = null;
    String eventType = "buttonClicked";
    List<JSONObject> components = null;
    List<Event> events = eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId,
        componentType, context, category, eventType, components);
    assertEquals(2, events.size());
    assertEquals("event2", events.get(0).getData());
    assertEquals("event4", events.get(1).getData());
  }

  @Test
  public void getEventsByParam_ByExistingComponents_ShouldReturnEvents() {
    Integer id = null;
    Run run = this.run;
    Group period = null;
    Workgroup workgroup = null;
    String nodeId = null;
    String componentId = null;
    String componentType = null;
    String context = null;
    String category = null;
    String eventType = null;
    List<JSONObject> components = this.components;
    List<Event> events = eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId,
        componentType, context, category, eventType, components);
    assertEquals(2, events.size());
    assertEquals("event2", events.get(0).getData());
    assertEquals("event4", events.get(1).getData());
  }
}