/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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
package net.sf.sail.webapp.domain.impl;

import org.telscenter.sail.webapp.domain.Run;

import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.OfferingVisitor;

/**
 * @author hirokiterashima
 * @version $Id:$
 */
public class OfferingNameVisitor implements OfferingVisitor {

	/**
	 * @see net.sf.sail.webapp.domain.OfferingVisitor#visit(net.sf.sail.webapp.domain.Offering)
	 */
	public Object visit(Offering offering) {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * @see net.sf.sail.webapp.domain.OfferingVisitor#visit(org.telscenter.sail.webapp.domain.Run)
	 */
	public Object visit(Run run) {
		return run.getName();
	}

}
