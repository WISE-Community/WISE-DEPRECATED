/**
 * 
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
        		if(nodeState.has("submitForPeerReview")) {
        			return true;
        		}
    		}
    	}
    	
    	return false;
    }
    
    public static String getDuplicateId(JSONObject nodeVisitJSON){
    	try{
    		String duplicateId = null;
    		if(nodeVisitJSON.has("duplicateId")) {
    			nodeVisitJSON.getString("duplicateId");
    		}
    		return duplicateId;
    	} catch (JSONException e){
    		e.printStackTrace();
    		return null;
    	}
    }
}
