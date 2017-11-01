/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
package org.wise.portal.dao.crater.impl;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.crater.CRaterRequestDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.vle.domain.cRater.CRaterRequest;
import org.wise.vle.domain.work.StepWork;

@Repository
public class HibernateCRaterRequestDao extends AbstractHibernateDao<CRaterRequest>
    implements CRaterRequestDao<CRaterRequest> {

  @Override
  protected String getFindAllQuery() {
    return null;
  }

  @Override
  protected Class<? extends CRaterRequest> getDataObjectClass() {
    return null;
  }

  public CRaterRequest getCRaterRequestById(Long id) {
    CRaterRequest cRaterRequest = null;

    try {
      cRaterRequest = getById(id);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }

    return cRaterRequest;
  }

  @Transactional
  public void saveCRaterRequest(CRaterRequest cRaterRequest) {
    save(cRaterRequest);
  }

  /**
   * Returns a CRaterRequest for the specified StepWork and NodeStateId.
   * @param stepWork
   * @param nodeStateId
   * @return
   */
  @Transactional(readOnly=true)
  public CRaterRequest getCRaterRequestByStepWorkIdNodeStateId(StepWork stepWork, Long nodeStateId) {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

    CRaterRequest result =
      (CRaterRequest) session.createCriteria(CRaterRequest.class)
        .add( Restrictions.eq("stepWork", stepWork))
        .add( Restrictions.eq("nodeStateId", nodeStateId))
        .uniqueResult();
    return result;
  }

  /**
   * Returns a list of CRaterRequests that have not been completed.
   * @return
   */
  @SuppressWarnings("unchecked")
  @Transactional(readOnly=true)
  public List<CRaterRequest> getIncompleteCRaterRequests() {

    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    List<CRaterRequest> result = (List<CRaterRequest>) session.createCriteria(CRaterRequest.class)
      .add(Restrictions.isNull("timeCompleted")).list();
    return result;
  }
}
