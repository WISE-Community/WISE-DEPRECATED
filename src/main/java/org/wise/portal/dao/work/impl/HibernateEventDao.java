/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.dao.work.impl;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.hibernate.Session;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.work.EventDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.vle.domain.work.Event;

/**
 * @author Hiroki Terashima
 */
@Repository
public class HibernateEventDao extends AbstractHibernateDao<Event>
    implements EventDao<Event> {

  @PersistenceContext
  private EntityManager entityManager;

  private CriteriaBuilder getCriteriaBuilder() {
    Session session = this.getHibernateTemplate().getSessionFactory()
        .getCurrentSession();
    return session.getCriteriaBuilder();
  }

  @Override
  protected String getFindAllQuery() {
    return null;
  }

  @Override
  protected Class<? extends Event> getDataObjectClass() {
    return Event.class;
  }

  @Override
  @SuppressWarnings("unchecked")
  public List<Event> getEventsByParams(Integer id, Run run, Group period,
      Workgroup workgroup, String nodeId, String componentId,
      String componentType, String context, String category, String event,
      List<JSONObject> components) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<Event> cq = cb.createQuery(Event.class);
    Root<Event> eventRoot = cq.from(Event.class);
    List<Predicate> predicates = getEventsByParamsPredicates(cb, eventRoot, id,
        run, period, workgroup, nodeId, componentId, componentType, context,
        category, event, components);
    cq.select(eventRoot)
        .where(predicates.toArray(new Predicate[predicates.size()]))
        .orderBy(cb.asc(eventRoot.get("serverSaveTime")));
    TypedQuery<Event> query = entityManager.createQuery(cq);
    return (List<Event>) (Object) query.getResultList();
  }

  @SuppressWarnings("unchecked")
  public List<Event> getEvents(Run run) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<Event> cq = cb.createQuery(Event.class);
    Root<Event> eventRoot = cq.from(Event.class);
    cq.select(eventRoot).where(cb.equal(eventRoot.get("run"), run));
    TypedQuery<Event> query = entityManager.createQuery(cq);
    return (List<Event>) (Object) query.getResultList();
  }

  @Override
  public List<Event> getStudentEvents(Run run) {
    List<Event> studentEvents = new ArrayList<Event>();
    List<Event> events = getEvents(run);
    for (Event event : events) {
      if (isStudentEvent(event)) {
        studentEvents.add(event);
      }
    }
    return studentEvents;
  }

  @Override
  public List<Event> getTeacherEvents(Run run) {
    List<Event> teacherEvents = new ArrayList<Event>();
    List<Event> events = getEvents(run);
    for (Event event : events) {
      if (isTeacherEvent(event)) {
        teacherEvents.add(event);
      }
    }
    return teacherEvents;
  }

  boolean isStudentEvent(Event event) {
    return isStudentUser(event) || isStudentWorkgroup(event);
  }

  boolean isStudentUser(Event event) {
    User user = event.getUser();
    return user != null && user.isStudent();
  }

  boolean isStudentWorkgroup(Event event) {
    Workgroup workgroup = event.getWorkgroup();
    return workgroup != null && workgroup.isStudentWorkgroup();
  }

  boolean isTeacherEvent(Event event) {
    User user = event.getUser();
    return user != null && user.isTeacher();
  }

  private List<Predicate> getEventsByParamsPredicates(CriteriaBuilder cb,
      Root<Event> eventRoot, Integer id, Run run, Group period,
      Workgroup workgroup, String nodeId, String componentId,
      String componentType, String context, String category, String event,
      List<JSONObject> components) {
    List<Predicate> predicates = new ArrayList<>();
    if (id != null) {
      predicates.add(cb.equal(eventRoot.get("id"), id));
    }
    if (run != null) {
      predicates.add(cb.equal(eventRoot.get("run"), run));
    }
    if (period != null) {
      predicates.add(cb.equal(eventRoot.get("period"), period));
    }
    if (workgroup != null) {
      predicates.add(cb.equal(eventRoot.get("workgroup"), workgroup));
    }
    if (nodeId != null) {
      predicates.add(cb.equal(eventRoot.get("nodeId"), nodeId));
    }
    if (componentId != null) {
      predicates.add(cb.equal(eventRoot.get("componentId"), componentId));
    }
    if (componentType != null) {
      predicates.add(cb.equal(eventRoot.get("componentType"), componentType));
    }
    if (context != null) {
      predicates.add(cb.equal(eventRoot.get("context"), context));
    }
    if (category != null) {
      predicates.add(cb.equal(eventRoot.get("category"), category));
    }
    if (event != null) {
      predicates.add(cb.equal(eventRoot.get("event"), event));
    }
    if (components != null) {
      List<Predicate> componentsPredicates = new ArrayList<>();
      for (int c = 0; c < components.size(); c++) {
        JSONObject component = components.get(c);
        try {
          Predicate nodeIdPredicate = null;
          Predicate componentIdPredicate = null;
          if (component.has("nodeId")) {
            nodeIdPredicate = cb.equal(eventRoot.get("nodeId"),
                component.getString("nodeId"));
          } else {
            nodeIdPredicate = cb.isNull(eventRoot.get("nodeId"));
          }
          if (component.has("componentId")) {
            componentIdPredicate = cb.equal(eventRoot.get("componentId"),
                component.getString("componentId"));
          } else {
            componentIdPredicate = cb.isNull(eventRoot.get("componentId"));
          }
          componentsPredicates
              .add(cb.and(nodeIdPredicate, componentIdPredicate));
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
      predicates.add(cb.or(componentsPredicates
          .toArray(new Predicate[componentsPredicates.size()])));
    }
    return predicates;
  }
}
