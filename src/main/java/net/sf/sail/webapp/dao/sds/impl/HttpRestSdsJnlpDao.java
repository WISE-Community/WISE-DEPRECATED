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

import net.sf.sail.webapp.dao.impl.AbstractDao;
import net.sf.sail.webapp.dao.sds.SdsJnlpCreateCommand;
import net.sf.sail.webapp.dao.sds.SdsJnlpDao;
import net.sf.sail.webapp.dao.sds.SdsJnlpUpdateCommand;
import net.sf.sail.webapp.domain.sds.SdsJnlp;

import org.springframework.beans.factory.annotation.Required;

/**
 * HTTP REST implementation of <code>SdsJnlpDao</code> interface supporting
 * interactions with external SDS. This implementation uses finer command
 * objects to execute.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class HttpRestSdsJnlpDao extends AbstractDao<SdsJnlp> implements
		SdsJnlpDao {

	private SdsJnlpCreateCommand createCommand;
	
	private SdsJnlpUpdateCommand updateCommand;

	/**
	 * @param createCommand
	 *            the createCommand to set
	 */
	@Required
	public void setCreateCommand(SdsJnlpCreateCommand createCommand) {
		this.createCommand = createCommand;
	}
	
	/**
	 * @param updateCommand
	 *            the updateCommand to set
	 */
	@Required
	public void setUpdateCommand(SdsJnlpUpdateCommand updateCommand) {
		this.updateCommand = updateCommand;
	}

	/**
	 * @see net.sf.sail.webapp.dao.impl.AbstractDao#save(java.lang.Object)
	 */
	public void save(SdsJnlp sdsJnlp) {
		if (sdsJnlp.getSdsObjectId() == null) {
			this.createCommand.setSdsJnlp(sdsJnlp);
			this.createCommand.execute(this.createCommand.generateRequest());
		} else {
			this.updateCommand.setSdsJnlp(sdsJnlp);
			this.updateCommand.execute(this.updateCommand.generateRequest());
		}
	}

}