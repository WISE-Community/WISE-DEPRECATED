/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.vle.domain.project;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Vector;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.vle.domain.node.Node;
import org.wise.vle.utils.FileManager;

/**
 * Project Domain Object to encapsulate WISE LD Project
 * @author Geoffrey Kwan
 * @author Hiroki Terashima
 */
public class Project {

  private JSONObject projectJSON;

  private HashMap<String, String> nodeIdToNodeTitles = new HashMap<String, String>();

  private HashMap<String, JSONObject> nodeIdToNode = new HashMap<String, JSONObject>();

  private HashMap<String, String> nodeIdToNodeTitlesWithPosition = new HashMap<String, String>();

  private List<String> nodeIdList = new Vector<String>();

  public Project(File projectFile) {
    try {
      projectJSON = new JSONObject(FileManager.getFileText(projectFile));
      makeNodeIdToNodeTitleAndNodeMap(projectJSON);

      /*
       * create the list of node ids in the order they appear in the project.
       * this also creates the map of node ides to node titles with positions
       */
      makeNodeIdList(projectJSON);
    } catch (IOException e) {
      e.printStackTrace();
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Create a map of node id to node titles by looping through the array
   * of nodes in the project file and creating an entry in the map
   * for each node
   * @param project the project JSON object
   * @return a map of node id to node titles
   */
  private void makeNodeIdToNodeTitleAndNodeMap(JSONObject project) {
    nodeIdToNodeTitles = new HashMap<String, String>();
    nodeIdToNode = new HashMap<String, JSONObject>();

    try {
      JSONArray nodesJSONArray = project.getJSONArray("nodes");
      for (int x = 0; x < nodesJSONArray.length(); x++) {
        JSONObject node = nodesJSONArray.getJSONObject(x);
        if (node != null) {
          String nodeId = node.getString("identifier");
          String title = node.getString("title");
          if (nodeId != null && title != null) {
            nodeIdToNodeTitles.put(nodeId, title);
          }
          if (nodeId != null) {
            nodeIdToNode.put(nodeId, node);
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Make the list of node ids
   * Note: makeNodeIdToNodeTitlesMap() must be called before this function
   *
   * @param project the project JSON object
   */
  private void makeNodeIdList(JSONObject project) {
    nodeIdList = new Vector<String>();
    try {
      JSONArray sequences = project.getJSONArray("sequences");
      String startPoint = project.getString("startPoint");
      traverseNodeIdsToMakeNodeIdList(sequences, startPoint, "", 1, startPoint);
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Traverses the sequences in the project file to create a list of nodes in
   * the order that they appear in the project and at the same time determining
   * the position of each node (e.g. 1.1, 1.2, 2.1, 2.2, etc.)
   *
   * @param sequences the JSONArray of sequences
   * @param identifier the id of the sequence or node we are currently on
   * @param positionSoFar the position we have traversed down to so far
   * e.g. if we are on Activity 2
   * positionSoFar will be "2."
   * @param nodePosition the position within the current sequence
   * e.g. if we are on Activity 2, Step 3
   * @param startPoint the id of the start point sequence of the project
   * nodePosition will be 3
   */
  private void traverseNodeIdsToMakeNodeIdList(JSONArray sequences, String identifier,
      String positionSoFar, int nodePosition, String startPoint) {
    try {
      JSONObject projectSequence = getProjectSequence(sequences, identifier);
      if (projectSequence == null) {
        boolean exportStep = true;
        if (exportStep) {
          nodeIdList.add(identifier);
          String nodeTitle = nodeIdToNodeTitles.get(identifier);
          String nodeTitleWithPosition = positionSoFar + nodePosition + " " + nodeTitle;
          nodeIdToNodeTitlesWithPosition.put(identifier, nodeTitleWithPosition);
        }
      } else {
        JSONArray refs = projectSequence.getJSONArray("refs");

        if (!identifier.equals(startPoint)) {
          /*
           * only do this for sequences that are not the startsequence otherwise
           * all the positions would start with "1."
           * so instead of Activity 2, Step 5 being 1.2.5 we really just want 2.5
           */
          positionSoFar = positionSoFar + nodePosition + ".";
        }

        for (int x = 0; x < refs.length(); x++) {
          String refIdentifier = refs.getString(x);
          traverseNodeIdsToMakeNodeIdList(sequences, refIdentifier, positionSoFar, x + 1, startPoint);
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Retrieves the JSONObject for a sequence with the given sequenceId
   * @param sequences a JSONArray of sequence JSONObjects
   * @param sequenceId the identifier of the sequence we want
   * @return the sequence JSONObject or null if we did not find it
   */
  private JSONObject getProjectSequence(JSONArray sequences, String sequenceId) {
    for (int x = 0; x < sequences.length(); x++) {
      try {
        JSONObject sequence = sequences.getJSONObject(x);
        if (sequence != null) {
          if (sequence.getString("identifier").equals(sequenceId)) {
            return sequence;
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return null;
  }

  /**
   * Returns true iff the specified node is marked as aggregatable.
   * That is, the node is tag mapped and that tag is associated with
   * a tag map function "showAggregateWork".
   *
   * Ex:
   * nodeToCheck.tags = ["tag1","tag2"]
   * AnotherNodeInTheProject.tagMaps = [{"tag":"tag1","functionName":"showAggregateWork"}]
   *
   * @param nodeToCheck
   * @return true iff specified node is marked as aggregatable.
   */
  public boolean isNodeAggregatable(Node nodeToCheck) {
    try {
      String nodeId = nodeToCheck.getNodeId();
      JSONObject nodeJSONObject = nodeIdToNode.get(nodeId);
      if (nodeJSONObject != null) {
        JSONArray nodeTagsJSONArray = nodeJSONObject.getJSONArray("tags");
        for (int i = 0; i < nodeTagsJSONArray.length(); i++) {
          String nodeTagName = (String) nodeTagsJSONArray.get(i);
          String tagMapFunctionName = "showAggregateWork";
          List<JSONObject> nodesThatHaveTagMapsByTagNameAndTagFunctionName = getNodesThatHaveTagMapsByTagNameAndTagFunctionName(nodeTagName, tagMapFunctionName);
          if (nodesThatHaveTagMapsByTagNameAndTagFunctionName.size() > 0) {
            return true;
          }

          tagMapFunctionName = "showAggregateWorkTable";
          nodesThatHaveTagMapsByTagNameAndTagFunctionName = getNodesThatHaveTagMapsByTagNameAndTagFunctionName(nodeTagName, tagMapFunctionName);
          if (nodesThatHaveTagMapsByTagNameAndTagFunctionName.size() > 0) {
            return true;
          }
        }
      }
    } catch (JSONException jsonException) {
      return false;
    }
    return false;
  }

  /**
   * Returns a list of nodes that has a TagMap function whose
   * tagName is the specified tagMapTagName and whose
   * functionName is the specified tagMapFunctionName
   * @return List of Nodes
   */
  public List<JSONObject> getNodesThatHaveTagMapsByTagNameAndTagFunctionName(String tagMapTagName, String tagMapFunctionName) {
    List<JSONObject> nodesThatHaveTagMapsByTagNameAndTagFunctionName = new ArrayList<JSONObject>();
    try {
      JSONArray nodesJSONArray = projectJSON.getJSONArray("nodes");
      for (int i = 0; i < nodesJSONArray.length(); i++) {
        JSONObject nodeJSONObject = (JSONObject) nodesJSONArray.get(i);
        if (nodeJSONObject.has("tagMaps")) {
          JSONArray nodeTagMapsJSONArray = (JSONArray) nodeJSONObject.get("tagMaps");
          for (int j = 0; j < nodeTagMapsJSONArray.length(); j++) {
            JSONObject nodeTagMapJSONObject = (JSONObject) nodeTagMapsJSONArray.get(j);
            if (nodeTagMapJSONObject.getString("tagName").equals(tagMapTagName)
              && nodeTagMapJSONObject.getString("functionName").equals(tagMapFunctionName)) {
              nodesThatHaveTagMapsByTagNameAndTagFunctionName.add(nodeJSONObject);
            }
          }
        }
      }
    } catch (JSONException e) {
      // do nothing...
    }
    return nodesThatHaveTagMapsByTagNameAndTagFunctionName;
  }

  /**
   * Get the node for the given node id
   * @param nodeId the node id
   * @return the node object from the project file
   */
  public JSONObject getNodeByNodeId(String nodeId) {
    JSONObject node = null;
    if (nodeId != null) {
      node = nodeIdToNode.get(nodeId);
    }
    return node;
  }
}
