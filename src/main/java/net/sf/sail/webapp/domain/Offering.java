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
package net.sf.sail.webapp.domain;

import net.sf.sail.webapp.domain.sds.SdsOffering;

/**
 * Offering domain object interface
 * 
 * @author Hiroki Terashima
 * @version $Id: User.java 231 2007-03-26 07:03:00Z hiroki $
 */
public interface Offering extends Persistable {

    public Long getId();
    /**
     * Sets the SdsOffering object.
     * 
     * @param sdsOffering
     *            the sdsOffering to set
     */
    public void setSdsOffering(SdsOffering sdsOffering);

    /**
     * Gets the SdsOffering object.
     * 
     * @return SdsOffering
     */
    public SdsOffering getSdsOffering();
    
    /**
     * Visitor pattern, accepts OfferingVisitors
     * @param visitor
     * @return
     */
    Object accept(OfferingVisitor visitor);
}