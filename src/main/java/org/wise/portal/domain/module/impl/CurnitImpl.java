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
package org.wise.portal.domain.module.impl;

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

import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.CurnitVisitor;

/**
 * @author Cynick Young
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
     * @see org.wise.portal.domain.module.Curnit#getId()
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
     * @see org.wise.portal.domain.module.Curnit#accept(org.wise.portal.domain.module.CurnitVisitor)
     */
	public Object accept(CurnitVisitor visitor) {
		return visitor.visit(this);
	}
}