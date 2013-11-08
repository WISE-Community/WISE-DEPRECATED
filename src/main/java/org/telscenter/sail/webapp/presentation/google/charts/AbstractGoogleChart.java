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

import java.util.LinkedList;
import java.util.List;

/**
 * AbstractGoogleChart implements GoogleChart and provides a partial
 * implementation to be used by subclasses.
 * 
 * @author patrick lawler
 * @version $Id:$
 */
public abstract class AbstractGoogleChart implements GoogleChart{
	
	protected List<List<?>> data = new LinkedList<List<?>>();
	
	protected GoogleChartOptions options;
	
	private static final int MAX_SIZE = 1000;
	
	private static final int MAX_PIXELS = 300000;
	
	protected static final String AMP = "&";
	
	private String url = "http://chart.apis.google.com/chart?";
	
	private int width;
	
	private int height;

	/**
	 * Returns a <code>String</code> in Google Charts API format of this 
	 * chart type
	 * 
	 * @return <code>String</code>
	 */
	protected abstract String getChartType();
	
	/**
	 * Formats the data according to chart type and returns a <code>String</code>
	 * of the data in Google Charts API format
	 * 
	 * @return <code>String</code>
	 */
	protected abstract String getChartData();
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.GoogleChart#addData(java.util.List)
	 */
	@SuppressWarnings("unchecked")
	public void addData(List<?> data){
		if(data!=null && data.size() > 0){
			if(data.get(0) instanceof java.util.List){
				for(List<?> list : (List<List<?>>) data){
					addData(list);
				}
			} else {
				this.data.add(data);
			}
		}
	}
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.GoogleChart#setChartSize(int, int)
	 */
	public void setChartSize(int width, int height)throws Exception{
		if(width > MAX_SIZE || height > MAX_SIZE){
			throw new Exception("width and height cannot exceed 1000 pixels.");
		} else if((width * height) > MAX_PIXELS){
			throw new Exception("the total pixels (width*height) cannot exceed 300000");
		}
		this.width = width;
		this.height = height;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.GoogleChart#getURL()
	 */
	public String getURL(){
		return this.url + getChartType() + getChartSize() + getChartData() + getOptionsString();
	}
	
	/**
	 * Returns the <code>String</code> options that are used to generate
	 * the URL.
	 * 
	 * @return <code>String</code>
	 */
	protected String getOptionsString(){
		if(this.options==null){
			return "";
		} else {
			return this.options.getOptionString();
		}
	}
	
	/**
	 * Returns the <code>String</code> representation for chart size of 
	 * this chart int Google Chart API format
	 * 
	 * @return <code>String</code>
	 */
	protected String getChartSize(){
		return AMP + "chs=" + this.width + "x" + this.height;
	}

	/**
	 * @return the options
	 */
	public GoogleChartOptions getOptions() {
		return options;
	}

	/**
	 * @param options the options to set
	 */
	public void setOptions(GoogleChartOptions options) {
		this.options = options;
	}
	
}
