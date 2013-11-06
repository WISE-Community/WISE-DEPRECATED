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

import java.util.List;
import java.util.Map;

/**
 * GoogleChart is intended to be used to provide the most basic 
 * requirements necessary to generate a URL that can be used to
 * create graphs via Google. Three parameters are required in the
 * URL to do this; chart type, chart size and data. Chart type will
 * be taken care of by implementing subclasses of the chart type.
 * Each chart type has optional parameters which will need to
 * be handled by implementing classes.
 *  
 * @author patrick lawler
 * @version $Id:$
 */
public interface GoogleChart {

	/**
	 * Data sets need to be added in an ordered <code>List<?></code>.
	 * The first point in the data set = index 0, the second point =
	 * index 1 and so on. Ordering is important in that many of the 
	 * optional parameters rely on the order. To add multiple data sets,
	 * either call this function multiple times or call this function 
	 * with a <code>List<List<?>></code> of ordered data sets. 
	 * 
	 * @param <code>List<?></code> data
	 */
	public void addData(List<?> data);
		
	/**
	 * Google charts can be up to a MAX total pixels of 300000. Width and
	 * height have a MAX limit of 1000 each. 
	 * 
	 * @param <code>int</code> width
	 * @param <code>int</code> height
	 * @throws <code>Exception<code> when MAX limits exceeded
	 */
	public void setChartSize(int width, int height) throws Exception;
	
	/**
	 * Sets the options for this chart type
	 * 
	 * @param <code>GoogleChartOptions</code> options
	 */
	public void setOptions(GoogleChartOptions options);
	
	/**
	 * Returns the options for this chart type
	 * 
	 * @return <code>GoogleChartOptions</code>
	 */
	public GoogleChartOptions getOptions();
	
	/**
	 * Returns the string generated from the data and options that can be
	 * used to generate a chart via Google.
	 * 
	 * @return <code>String</code>
	 */
	public String getURL();
}
