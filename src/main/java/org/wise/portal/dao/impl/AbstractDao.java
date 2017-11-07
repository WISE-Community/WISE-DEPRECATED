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
package org.wise.portal.dao.impl;

import java.io.Serializable;
import java.util.List;

import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.SimpleDao;

/**
 * @author Cynick Young
 */
public abstract class AbstractDao<T> implements SimpleDao<T> {

  /**
   * @see org.wise.portal.dao.SimpleDao#delete(java.lang.Object)
   */
  public void delete(T object) {
    // default behaviour for subclasses that do not override this method
    throw new UnsupportedOperationException();
  }

  /**
   * @see org.wise.portal.dao.SimpleDao#save(java.lang.Object)
   */
  public void save(T object) {
    // default behaviour for subclasses that do not override this method
    throw new UnsupportedOperationException();
  }

  /**
   * @see org.wise.portal.dao.SimpleDao#getList()
   */
  public List<T> getList() {
    // default behaviour for subclasses that do not override this method
    throw new UnsupportedOperationException();
  }

  /**
   * @see org.wise.portal.dao.SimpleDao#getById(java.lang.Integer)
   */
  public T getById(Serializable id) throws ObjectNotFoundException {
    // default behaviour for subclasses that do not override this method
    throw new UnsupportedOperationException();
  }
}
