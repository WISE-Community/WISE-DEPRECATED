/**
 * Copyright (c) 2007-2015 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.dao.authentication.impl;

import org.springframework.dao.support.DataAccessUtils;
import org.springframework.security.acls.model.ObjectIdentity;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.authentication.AclTargetObjectIdentityDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.domain.authentication.MutableAclTargetObjectIdentity;
import org.wise.portal.domain.authentication.impl.PersistentAclTargetObjectIdentity;

/**
 * This class is not being used. Tried to implement Hibernate versions of the acl
 * services and became bogged down, so went back to jdbc versions. Keeping this
 * class around in case we want to try again later.
 * 
 * @author Cynick Young
 */
@Repository
public class HibernateAclTargetObjectIdentityDao extends
        AbstractHibernateDao<MutableAclTargetObjectIdentity> implements
        AclTargetObjectIdentityDao<MutableAclTargetObjectIdentity> {

    private static final String FIND_ALL_QUERY = "from PersistentAclTargetObjectIdentity";

    // private static final MutableAclTargetObjectIdentity[] SAMPLE = new
    // MutableAclTargetObjectIdentity[0];

    private static final String[] RETRIEVE_BY_OBJECT_IDENTITY_PARAM_NAMES = new String[] {
            "classname", "id" };

    /**
     * @see org.wise.portal.dao.authentication.AclTargetObjectIdentityDao#retrieveByObjectIdentity(org.acegisecurity.acls.objectidentity.ObjectIdentity)
     */
    public MutableAclTargetObjectIdentity retrieveByObjectIdentity(
            ObjectIdentity objectIdentity) {
        return (MutableAclTargetObjectIdentity) DataAccessUtils
                .uniqueResult(this
                        .getHibernateTemplate()
                        .findByNamedParam(
                                "from PersistentAclTargetObjectIdentity as object_id where object_id.aclTargetObject.classname = :classname and object_id.aclTargetObjectId = :id",
                                RETRIEVE_BY_OBJECT_IDENTITY_PARAM_NAMES,
                                new Object[] {
                                        objectIdentity.getType(),
                                        objectIdentity.getIdentifier() }));
    }

    /**
     * @see org.wise.portal.dao.authentication.AclTargetObjectIdentityDao#findChildren(org.acegisecurity.acls.objectidentity.ObjectIdentity)
     */
    public MutableAclTargetObjectIdentity[] findChildren(
            ObjectIdentity parentIdentity) {
        throw new UnsupportedOperationException();
        // TODO CY - not really sure what the requirements are for this method
        // List<?> list = this
        // .getHibernateTemplate()
        // .findByNamedParam(
        // "from PersistentAclTargetObjectIdentity as object_identity where
        // object_identity.parent = :parent",
        // new String[] { "parent" },
        // new Object[] { parentIdentity });
        // return list.toArray(SAMPLE);
    }

    @Override
    protected Class<PersistentAclTargetObjectIdentity> getDataObjectClass() {
        return PersistentAclTargetObjectIdentity.class;
    }

    @Override
    protected String getFindAllQuery() {
        return FIND_ALL_QUERY;
    }
}