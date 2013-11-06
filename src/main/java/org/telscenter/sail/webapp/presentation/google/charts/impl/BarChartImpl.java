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
package org.telscenter.sail.webapp.presentation.google.charts.impl;

import java.util.List;

import org.telscenter.sail.webapp.presentation.google.charts.AbstractGoogleChart;
import org.telscenter.sail.webapp.presentation.google.charts.BarChart;

/**
 * BarChartImpl initializes with the defaults: orientation = vertical and
 * grouping is set to false.
 * 
 * @author patrick lawler
 * @version $Id:$
 */
public class BarChartImpl extends AbstractGoogleChart implements BarChart{
	
	private String orientation = "v";
	
	private boolean grouped = false;

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.AbstractGoogleChart#getChartData()
	 */
	@Override
	protected String getChartData() {
		String dataString = AMP + "chd=t:";
		
		if(this.data.size() < 1){
			return "";
		}
		
		for(List<?> list : this.data){
			for(int x = 0; x < list.size(); x++){
				dataString = dataString + list.get(x) + ",";
			}
			dataString = dataString.substring(0, dataString.length()-1) + "|";
		}
		return dataString.substring(0, dataString.length()-1);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.AbstractGoogleChart#getChartType()
	 */
	@Override
	protected String getChartType() {
		String type = "cht=b" + this.orientation;
		if(this.grouped){
			type = type + "g";
		} else {
			type = type + "s";
		}
		return type;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.BarChart#setGrouped(boolean)
	 */
	public void setGrouped(boolean grouped) {
		this.grouped = grouped;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.BarChart#setOrientation(java.lang.String)
	 */
	public void setOrientation(String orientation)throws Exception {
		if(orientation.equals("h") || orientation.equals("v")){
			this.orientation = orientation;
		} else {
			throw new Exception("orientation can only be v (vertical) or h (horizontal)");
		}
	}
	
}
