/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.telscenter.sail.webapp.domain.owned.impl;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.premadecomment.impl.PremadeCommentImpl;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.OfferingImpl;

/**
 * @author patrick lawler
 *
 */
@Entity
@Table(name = OwnedImpl.DATA_STORE_NAME)
@Inheritance(strategy = InheritanceType.JOINED)
public class OwnedImpl {

    @Transient
    public static final String DATA_STORE_NAME = "owned";
    
    @Transient
    public static final String COLUMN_NAME_LABEL = "label";
    
    @Transient
    public static final String COLUMN_NAME_OWNER = "owner";
    
    @Transient
    public static final String COLUMN_NAME_RUN = "run";

    @Column(name = OwnedImpl.COLUMN_NAME_LABEL, nullable=false)
    private String label;
    
    @Lob
    @Column(name = OwnedImpl.COLUMN_NAME_OWNER, nullable = true, length=2147483647)
    private User owner = null;

    @Lob
    @Column(name = OwnedImpl.COLUMN_NAME_RUN, nullable = true, length=2147483647)
    private Run run = null;
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;
    
	/**
	 * @return the id
	 */
	public Long getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	public void setId(Long id) {
		this.id = id;
	}

	/**
	 * @return the label
	 */
	public String getLabel() {
		return label;
	}

	/**
	 * @param label the label to set
	 */
	public void setLabel(String label) {
		this.label = label;
	}

	/**
	 * @return the owner
	 */
	public User getOwner() {
		return owner;
	}

	/**
	 * @param owner the owner to set
	 */
	public void setOwner(User owner) {
		this.owner = owner;
	}

	/**
	 * @return the run
	 */
	public Run getRun() {
		return run;
	}

	/**
	 * @param run the run to set
	 */
	public void setRun(Run run) {
		this.run = run;
	}

}
