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
package net.sf.sail.webapp.service.curnit;

import java.util.List;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.impl.CurnitParameters;

/**
 * A service for working with Curnits.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public interface CurnitService {

	/**
	 * Gets a <code>List</code> of curnits.
	 * 
	 * @return a <code>List</code> of curnits.
	 */
	public List<? extends Curnit> getCurnitList();

	/**
	 * Registers a new <code>SdsCurnit</code> on the SDS and creates a
	 * <code>Curnit</code> object in the local data store. A side effect is
	 * that the sdsObjectId is set to the value that the SDS assigns to the new
	 * curnit.
	 * 
	 * @param <code>curnitParameters</code>
	 *            The curnit parameters (name and url)
	 * @return the curnit
	 */
	public Curnit createCurnit(CurnitParameters curnitParameters);
	
	/**
	 * Updates the specified curnit
	 * 
	 * @param curnit the <code>Curnit</code> to update
	 */
	public void updateCurnit(Curnit curnit);
	
	/**
	 * Gets a curnit with the given curnitId.
	 * 
	 * @param curnitId
	 *            The Id of the curnit
	 * @return <code>Curnit</code> with the specified curnitId
	 * @throws ObjectNotFoundException when the specified curnit is
	 *         not found
	 */
	public Curnit getById(Long curnitId) throws ObjectNotFoundException;
	
	/**
	 * Changes the name of the given curnit.
	 * 
	 * @param curnit an existing <code>Curnit</code> that should
	 *               have its name changed
	 * @param newName <code>String</code> name of the new curnit
	 */
	public void changeCurnitName(Curnit curnit, String newName);
	
	/**
	 * Returns the latest <code>Long</code> id of a curnit found in
	 * the data store.
	 * 
	 * @return <code>Long</code>
	 */
	public Long getLatestId();

}