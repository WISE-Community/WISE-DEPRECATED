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
package net.sf.sail.webapp.dao.sds.impl;

import java.io.Serializable;
import java.util.List;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.impl.AbstractDao;
import net.sf.sail.webapp.dao.sds.CurnitMapNotFoundException;
import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.dao.sds.SdsOfferingCreateCommand;
import net.sf.sail.webapp.dao.sds.SdsOfferingDao;
import net.sf.sail.webapp.dao.sds.SdsOfferingGetCommand;
import net.sf.sail.webapp.dao.sds.SdsOfferingListCommand;
import net.sf.sail.webapp.dao.sds.SdsOfferingUpdateCommand;
import net.sf.sail.webapp.domain.sds.SdsOffering;

import org.springframework.beans.factory.annotation.Required;

/**
 * HTTP REST implementation of <code>SdsOfferingDao</code> interface
 * supporting interactions with external SDS. This implementation uses finer
 * command objects to execute.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class HttpRestSdsOfferingDao extends AbstractDao<SdsOffering> implements
		SdsOfferingDao {

	private SdsOfferingListCommand listCommand;

	private SdsOfferingCreateCommand createCommand;

	private SdsOfferingUpdateCommand updateCommand;

	private SdsOfferingGetCommand getCommand;

	/**
	 * @param getCommand
	 *            the getCommand to set
	 */
	@Required
	public void setGetCommand(SdsOfferingGetCommand getCommand) {
		this.getCommand = getCommand;
	}

	/**
	 * @param listCommand
	 *            the listCommand to set
	 */
	@Required
	public void setListCommand(SdsOfferingListCommand listCommand) {
		this.listCommand = listCommand;
	}

	/**
	 * @param createCommand
	 *            the createCommand to set
	 */
	@Required
	public void setCreateCommand(SdsOfferingCreateCommand createCommand) {
		this.createCommand = createCommand;
	}

	/**
	 * @param updateCommand
	 *            the updateCommand to set
	 */
	@Required
	public void setUpdateCommand(SdsOfferingUpdateCommand updateCommand) {
		this.updateCommand = updateCommand;
	}

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsOfferingDao#getList()
	 */
	@SuppressWarnings("unchecked")
	public List<SdsOffering> getList() {
		return this.listCommand.execute(this.listCommand.generateRequest());
	}

	/**
	 * @see net.sf.sail.webapp.dao.impl.AbstractDao#getById(java.io.Serializable)
	 */
	@Override
	public SdsOffering getById(Serializable id) throws ObjectNotFoundException,
			HttpStatusCodeException {
		SdsOffering sdsOffering = new SdsOffering();
		// TODO: Refactor Long ids to Serializables
		sdsOffering.setSdsObjectId( Long.parseLong(id.toString()) );
		this.getCommand.setSdsOffering(sdsOffering);
		return this.getCommand.execute(this.getCommand.generateRequest());
	}

	/**
	 * @see net.sf.sail.webapp.dao.impl.AbstractDao#save(java.lang.Object)
	 */
	@Override
	public void save(SdsOffering sdsOffering) {
		if (sdsOffering.getSdsObjectId() == null) {
			this.createCommand.setSdsOffering(sdsOffering);
			this.createCommand.execute(this.createCommand.generateRequest());

			// TODO LAW I think that the retrieval of the curnitmap should be
			// moved to the createCommand.execute. Possibly for update too.

			// also, get the curnitmap from the sds and set it to
			// sdsOffering.sdsCurnitmap...this will add about
			// 20-30 more seconds for creating new SdsOfferings because
			// it takes that much time to generate curnitmaps
			try {
				this.getCommand.getSdsCurnitMap(sdsOffering);
			} catch (CurnitMapNotFoundException cmnfe) {
				sdsOffering = cmnfe.getSdsOffering();
				// TODO LAW: note that in this case curnitmap is blank and
				// curnitmap has not been retrieved....do we want to do anything
				// more?
			}
		} else {
			this.updateCommand.setSdsOffering(sdsOffering);
			this.updateCommand.execute(this.updateCommand.generateRequest());
		}
	}

}
