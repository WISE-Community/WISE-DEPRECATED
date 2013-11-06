/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
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
package net.sf.sail.webapp.service.offering;

import java.util.List;
import java.util.Set;

import org.telscenter.pas.emf.pas.ECurnitmap;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.impl.OfferingParameters;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public interface OfferingService {

	/**
	 * Gets a list of offerings.
	 * 
	 * @return an offerings <code>List</code>.
	 */
	// @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
	public List<Offering> getOfferingList();

	// TODO LAW this is wrong but is just to remind me to put appropriate
	// security check here
	// @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
	/**
	 * Given an offering id, obtains the offering
	 * 
	 * @param id The id of the offering to be retrieved.
	 * @return The offering.
	 * @throws ObjectNotFoundException if an offering with the given id is not found.
	 */
	public Offering getOffering(Long id) throws ObjectNotFoundException;

	/**
	 * Creates a new <code>SdsOffering</code> on the SDS as well as an
	 * <code>Offering</code> object in the local data store. A side effect is
	 * that the offering id is set to the value that the SDS assigns to the new
	 * offering.
	 * 
	 * @param offeringParameters
	 *            The <code>OfferingParameters</code> that encapsulate
	 *            information needed to create an offering.
	 * @return the offering created.
	 * @throws ObjectNotFoundException
	 *             If the curnit specified to create this offering does not
	 *             exist in the data store.
	 */
	public Offering createOffering(OfferingParameters offeringParameters)
	    throws ObjectNotFoundException;
	
	/**
	 * Returns a set of <code>Workgroup</code> that belong in the the <code>Offering</code>
	 * with the provided offeringId.
	 * 
	 * @param offeringId key to the <code>Offering</code> to look up
	 * @return a Set of Workgroups that belong in the <code>Offering</code>
	 * 
	 * @throws ObjectNotFoundException if an offering with the given id is not found.
	 */
	public Set<Workgroup> getWorkgroupsForOffering(Long offeringId) 
	    throws ObjectNotFoundException;

	/**
	 * Updates the curnitmap of the offering identified by the offeringId
	 * 
	 * @param offeringId key to the <code>Offering</code> to look up
	 * @param eCurnitmap new curnitmap to associate this offering with
	 * @throws ObjectNotFoundException if an offering with the given id is not found.
	 */
	public void updateCurnitmapForOffering(Long offeringId, ECurnitmap eCurnitmap)
	    throws ObjectNotFoundException;
}