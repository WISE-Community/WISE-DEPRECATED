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
package org.telscenter.sail.webapp.presentation.google.charts;

import java.util.Map;

/**
 * A LineChart is a chart type of a GoogleChart.
 * 
 * Data can be added as for all other GoogleChart types. For a XYLineChart,
 * the first dataset specifies the values for the x-axis, the second dataset
 * specifies values for the y-axis. For additional lines, continue alternating
 * datasets for x-axis,y-axis. For ease of adding data, this implementation
 * includes the ability to addData as a Map<?,?> where the first parameter is
 * the value along the x-axis and the second parameter is the value along
 * the y-axis.
 * 
 * @author patrick lawler
 * @version $Id:$
 */
public interface LineChart extends GoogleChart{
	
	/**
	 * Sets whether this Line Chart is an XYLineChart where alternating
	 * data sets represent x-axis and y-axis data respectively; multiple lines
	 * are specified by adding two datasets for each line or whether
	 * this Line Chart is a SequentialLineChart where all values of a data
	 * set are equally spaced along the x-axis; each dataset addes specifies
	 * a line. This chart defaults to type XYLineChart.
	 * 
	 * @param <code>boolean</code> v
	 */
	public void setXYType(boolean v);
	
	/**
	 * Only to be used to add data if this chart has been set as an XYLineChart
	 * type. Alternative way to add datasets using a Map. The first parameter 
	 * specifies the x-axis values and the second parameter specifies the y-axis
	 * values
	 * 
	 * @param <code>Map<?,?></code> data
	 */
	public void addXYData(Map<?,?> data);
}
