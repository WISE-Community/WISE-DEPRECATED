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
package net.sf.sail.webapp.domain.impl;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.CurnitVisitor;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
@Entity
@Table(name = CurnitImpl.DATA_STORE_NAME)
@Inheritance(strategy = InheritanceType.JOINED)
public class CurnitImpl implements Curnit {

    @Transient
    private static final long serialVersionUID = 1L;

    @Transient
    public static final String DATA_STORE_NAME = "curnits";

    @Transient
	private static final String COLUMN_NAME_NAME = "name";
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
	private Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    @Column(name = COLUMN_NAME_NAME)
	private String name;

    /**
     * @see net.sf.sail.webapp.domain.Curnit#getId()
     */
    public Long getId() {
        return this.id;
    }

    @SuppressWarnings("unused")
    private void setId(Long id) {
        this.id = id;
    }

    public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@SuppressWarnings("unused")
    private Integer getVersion() {
        return this.version;
    }

    @SuppressWarnings("unused")
    private void setVersion(Integer version) {
        this.version = version;
    }

    /**
     * @see net.sf.sail.webapp.domain.Curnit#accept(net.sf.sail.webapp.domain.CurnitVisitor)
     */
	public Object accept(CurnitVisitor visitor) {
		return visitor.visit(this);
	}
}