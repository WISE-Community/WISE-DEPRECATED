/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
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
package org.wise.vle.utils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Utitlity class for working with VLEData
 * @author hirokiterashima
 */
public class VLEDataUtils {

    /**
     * Returns the specified nodeVisit's node type
     * @param nodeVisitJSON
     * @return
     * @throws JSONException 
     */
	public static String getNodeType(JSONObject nodeVisitJSON) throws JSONException {
		return nodeVisitJSON.getString("nodeType");
	}
	
    /**
     * Returns the id of the nodeVisit given the nodeVisit JSON object
     * @param nodeVisitJSON
     * @return
     * @throws JSONException 
     */
	public static String getNodeId(JSONObject nodeVisitJSON) throws JSONException {
		return nodeVisitJSON.getString("nodeId");
	}

    /**
     * Returns the node visit's start time given a JSON object
     * @param nodeVisitJSON
     * @return
     * @throws JSONException 
     */
	public static String getVisitStartTime(JSONObject nodeVisitJSON) throws JSONException {
		return nodeVisitJSON.getString("visitStartTime");
	}

    /**
     * Returns the node visit's end time given the nodeVisit JSON object
     * @param nodeVisitJSON
     * @return
     * @throws JSONException 
     */
	public static String getVisitEndTime(JSONObject nodeVisitJSON) throws JSONException {
		return nodeVisitJSON.getString("visitEndTime");
	}

    /**
     * Obtain the value in the nodeStates field
     * @param nodeVisit the node visit JSONObject
     * @return the nodeStates JSONArray or null if the field does not exist or the
     * field is not a JSONArray
     */
    public static JSONArray getNodeStates(JSONObject nodeVisit) {
    	JSONArray nodeStates = null;
    	
    	if(nodeVisit != null) {
    		//try to get the nodeStates field if it exists
    		nodeStates = nodeVisit.optJSONArray("nodeStates");
    	}
    	
    	return nodeStates;
    }

    /**
     * Check if this node visit is a peer review submit
     * @param nodeVisitJSON
     * @return
     * @throws JSONException
     */
    public static boolean isSubmitForPeerReview(JSONObject nodeVisitJSON) throws JSONException {
    	//obtain the node states array from the node visit
    	JSONArray jsonArray = nodeVisitJSON.getJSONArray("nodeStates");
    	
    	//loop through all the node states
    	for(int x=0; x<jsonArray.length(); x++) {
    		
    		//get an element in the array
    		Object jsonArrayElement = jsonArray.get(x);
    		
    		//make sure the element is a JSONObject
    		if(jsonArrayElement instanceof JSONObject) {
    			//get a node state
        		JSONObject nodeState = (JSONObject) jsonArrayElement;

        		//check if it has the attribute "submitForPeerReview"
        		if(nodeState.optBoolean("submitForPeerReview")) {
        			return true;
        		}
    		}
    	}
    	
    	return false;
    }
}
