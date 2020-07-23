import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  currentNode = null;

  constructor() { }

  isCompleted(nodeId, componentId) {

  }

  endCurrentNodeAndSetCurrentNodeByNodeId(nextNodeId) {

  }

  getCurrentNode() {
    return this.currentNode;
  }

  getCurrentNodeId() {
    if (this.currentNode != null) {
      return this.currentNode.id;
    }
    return null;
  }

  getBranchPathTakenEventsByNodeId(currentNodeId): any[] {
    return [];
  }

  getStackHistory(): any[] {
    return [];
  }

  evaluateCriterias(criteria) {

  }

  saveVLEEvent(nodeId, componentId, componentType, category, event, eventData) {

  }
}
