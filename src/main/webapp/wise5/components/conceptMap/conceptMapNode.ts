class ConceptMapNode {
  type: string;
  draw: any;
  id: string;
  originalId: string;
  filePath: string;
  fileName: string;
  label: any;
  showLabel: boolean;
  image: any;
  width: number;
  height: number;
  group: any;
  highlighted: boolean;
  deleteButtonColor: string;
  connector: any;
  deleteButtonGroup: any;
  border: any;
  x: number;
  y: number;
  outgoingLinks: any[];
  incomingLinks: any[];
  textGroup: any;
  deleteButtonCircle: any;
  deleteButtonX: any;
  textRect: any;
  text: any;
  controller: any;

  /**
   * The constructor for creating ConceptMapNodes
   * @param draw the svg.js draw object
   * @param filePath the path of the image file that represents the node
   * @param label the label of the node
   * @param x the x position of the node
   * @param y the y position of the node
   * @param width the the width of the node
   * @param height the height of the node
   * @param showLabel whether to show the label
   */
  constructor(draw, id, originalId, filePath, label, x, y, width, height, showLabel) {
    this.type = 'ConceptMapNode';

    // remember the svg.js draw object so we can draw onto it
    this.draw = draw;

    // set the id
    this.id = id;

    // set the original id
    this.originalId = originalId;

    // remember the file path e.g. "/wise/curriculum/108/assets/Space.png"
    this.filePath = filePath;

    if (this.filePath != null) {
      // get the file name e.g. "Space.png"
      this.fileName = this.filePath.substring(this.filePath.lastIndexOf('/') + 1);
    }

    // remember the label
    this.label = label;
    this.showLabel = showLabel;

    // create the svg image object
    this.image = this.draw.image(this.filePath, width, height);

    // remember the width
    this.width = width;

    // remember the height
    this.height = height;

    // create a group to contain all the elements of this node
    this.group = this.draw.group();

    // flag that specifies whether this node is highlighted by the student
    this.highlighted = false;

    // the color of the delete button
    this.deleteButtonColor = 'gray';

    // create the connector that students will use to create links
    this.connector = this.createConnector();

    // create the delete button
    this.deleteButtonGroup = this.createDeleteButtonGroup();

    /*
     * create the border that displays when the node is highighted or
     * moused over
     */
    this.border = this.createBorder();

    // remember the x and y coordinates
    this.x = x;
    this.y = y;

    // initialize the outgoing and incoming links arrays
    this.outgoingLinks = [];
    this.incomingLinks = [];

    // add all the elements to the group
    this.group.add(this.border);
    this.group.add(this.image);
    this.group.add(this.connector);
    this.group.add(this.deleteButtonGroup);
    if (showLabel) {
      this.textGroup = this.createTextGroup();
      this.group.add(this.textGroup);
    }

    // hide the border and delete button
    this.border.hide();
    this.deleteButtonGroup.hide();

    // set the position of the group
    this.group.x(x);
    this.group.y(y);
  }

  /**
   * Get the JSON object representation of the ConceptMapNode
   * @returns a JSON object containing the data of the ConceptMapNode
   */
  toJSONObject() {
    const jsonObject: any = {
      originalId: this.originalId,
      instanceId: this.id,
      fileName: this.fileName,
      filePath: this.filePath,
      label: this.label,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      outgoingLinks: [],
      incomingLinks: []
    };

    // loop through all the outgoing links
    for (let ol = 0; ol < this.outgoingLinks.length; ol++) {
      const outgoingLink = this.outgoingLinks[ol];
      const instanceId = outgoingLink.getId();
      const originalId = outgoingLink.getOriginalId();
      const label = outgoingLink.getLabel();

      /*
       * create an object containing the instance id, original id
       * and label of the link
       */
      const tempLinkObject = {
        originalId: originalId,
        instanceId: instanceId,
        label: label
      };

      jsonObject.outgoingLinks.push(tempLinkObject);
    }

    // loop through all the incoming links
    for (let il = 0; il < this.incomingLinks.length; il++) {
      const incomingLink = this.incomingLinks[il];
      const instanceId = incomingLink.getId();
      const originalId = incomingLink.getOriginalId();
      const label = incomingLink.getLabel();

      /*
       * create an object containing the instance id, original id
       * and label of the link
       */
      const tempLinkObject = {
        originalId: originalId,
        instanceId: instanceId,
        label: label
      };
      jsonObject.incomingLinks.push(tempLinkObject);
    }

    return jsonObject;
  }

  /**
   * Create the border that displays when the node is highlighted or
   * moused over.
   * @returns the svg rectangle that represents the border
   */
  createBorder() {
    // create the rectangle
    this.border = this.draw.rect(this.width, this.height);
    this.border.fill('none');
    this.border.stroke({ color: '#333333', opacity: 0.2, width: 2 });
    return this.border;
  }

  /**
   * Create the connector that students will use to create links from this
   * node.
   * @returns the svg circle that represents the connector
   */
  createConnector() {
    // create the circle
    const connectorRadius = 10;
    this.connector = this.draw.circle();
    this.connector.radius(connectorRadius);
    this.connector.cx(this.width / 2);
    this.connector.cy(0);
    this.connector.fill({ color: '#cccccc', opacity: 0.4 });
    this.connector.stroke({ color: '#333333', opacity: 0.2 });
    return this.connector;
  }

  /**
   * Create the delete button. The delete button is a group that contains
   * a circle and an x.
   * @returns a group that contains a circle and an x
   */
  createDeleteButtonGroup() {
    // create a group to contain the circle and x for the delete button
    this.deleteButtonGroup = this.draw.group();

    // create the delete button circle
    const deleteButtonRadius = 10;
    this.deleteButtonCircle = this.draw.circle();
    this.deleteButtonCircle.radius(deleteButtonRadius);
    this.deleteButtonCircle.cx(this.width);
    this.deleteButtonCircle.cy(0);
    this.deleteButtonCircle.fill({ opacity: 0.0 });
    this.deleteButtonCircle.stroke({ color: '#333333', opacity: 0.2, width: 2 });

    // create the x by first creating a + and then rotating it 45 degrees

    // get the top location of the +
    const topX = 0;
    const topY = 0 - deleteButtonRadius * 0.7;

    // get the bottom location of the +
    const bottomX = 0;
    const bottomY = 0 + deleteButtonRadius * 0.7;

    // get the left position of the +
    const leftX = 0 - deleteButtonRadius * 0.7;
    const leftY = 0;

    // get the right position of the +
    const rightX = 0 + deleteButtonRadius * 0.7;
    const rightY = 0;

    // draw the +
    const deleteButtonXPath =
      'M' +
      topX +
      ',' +
      topY +
      'L' +
      bottomX +
      ',' +
      bottomY +
      'M' +
      leftX +
      ',' +
      leftY +
      'L' +
      rightX +
      ',' +
      rightY;
    this.deleteButtonX = this.draw.path(deleteButtonXPath);
    this.deleteButtonX.stroke({ color: '#333333', opacity: 0.2, width: 2 });

    // rotate the + to turn it into an x
    this.deleteButtonX.transform({ rotation: 45 });

    // move the x to the upper right of the group
    this.deleteButtonX.translate(this.width, 0);

    /*
     * disable pointer events on the x so that clicks will pass through
     * and hit the circle. this way we only need to set a listener on the
     * circle for click events.
     */
    this.deleteButtonX.attr('pointer-events', 'none');

    // add the circle and the x
    this.deleteButtonGroup.add(this.deleteButtonCircle);
    this.deleteButtonGroup.add(this.deleteButtonX);

    return this.deleteButtonGroup;
  }

  /**
   * Create the text group
   * @returns the text group
   */
  createTextGroup() {
    // create the group
    this.textGroup = this.draw.group();

    // create a rectangle to surround the text
    this.textRect = this.draw.rect(100, 15);
    this.textRect.attr('fill', 'white');
    this.textRect.attr('stroke', 'black');
    this.textRect.attr('x', 0);
    this.textRect.attr('y', 10);
    this.textRect.attr('width', 100);
    this.textRect.attr('height', 20);
    this.textRect.radius(5);

    // create the text element
    this.text = this.draw.text(this.label);
    this.text.attr('x', 5);
    //this.text.attr('x', 0);
    this.text.attr('y', 9);
    this.text.font({
      family: 'Arial',
      size: 12
    });

    // prevent the text from being highlighted when the user drags the mouse
    this.text.style('user-select:none');
    this.text.node.setAttribute('user-select', 'none');
    this.text.node.setAttribute('style', 'user-select:none');

    // add the rectangle and text to the group
    this.textGroup.add(this.textRect);
    this.textGroup.add(this.text);

    // add the text group to the link group
    this.group.add(this.textGroup);

    let width = 0;

    try {
      // get the width of the bounding box of the text node
      const textBBox = this.text.node.getBBox();

      if (textBBox.width == 0) {
        width = this.calculateTextRectWidth(this.label);
      } else {
        width = textBBox.width + 10;
      }
    } catch (e) {
      /*
       * we were unable to get the bounding box (likely because
       * Firefox threw an error when trying to call getBBox())
       * so we will calculate the width based on the label text
       */
      width = this.calculateTextRectWidth(this.label);
    }

    this.textRect.attr('width', width);

    // set the position of the text group
    const x = this.getImageWidth() / 2;
    const y = this.getImageHeight();
    this.textGroup.cx(x);
    this.textGroup.cy(y);

    return this.textGroup;
  }

  /**
   * Get the id of the node
   * @returns the id of the node
   */
  getId() {
    return this.id;
  }

  /**
   * Get the original id of the node
   * @returns the original id of the node
   */
  getOriginalId() {
    return this.originalId;
  }

  /**
   * Get the group id of the node
   * @returns the group id of the node
   */
  getGroupId() {
    let groupId = null;

    if (this.group != null) {
      // get the id of the group which we will use as the id of the node
      groupId = this.group.id();
    }

    return groupId;
  }

  /**
   * Get the label
   * @returns the label of the node
   */
  getLabel() {
    return this.label;
  }

  /**
   * Set the label of the node
   * @param label the label of the node
   */
  setLabel(label) {
    // remember the label
    this.label = label;

    // set the label into the text element
    this.text.text(label);

    let width = 0;

    try {
      // get the width of the bounding box of the text node
      const textBBox = this.text.node.getBBox();

      if (textBBox.width == 0) {
        width = this.calculateTextRectWidth(this.label);
      } else {
        width = textBBox.width + 10;
      }
    } catch (e) {
      /*
       * we were unable to get the bounding box (likely because
       * Firefox threw an error when trying to call getBBox())
       * so we will calculate the width based on the label text
       */
      width = this.calculateTextRectWidth(this.label);
    }

    this.textRect.attr('width', width);

    // set the position of the text group
    const x = this.getImageWidth() / 2;
    const y = this.getImageHeight();
    this.textGroup.cx(x);
    this.textGroup.cy(y);
  }

  /**
   * Get the center x coordinate of the group
   */
  cx() {
    let val = 0;

    if (this.group != null && this.image != null) {
      // get the group
      const groupX = this.group.x();

      /*
       * get the center x coordinate of the image relative to the group.
       * this will be equal to half the width of the image.
       */
      const imageCX = this.image.cx();

      /*
       * get the x coordinate of the center of the group relative to the
       * svg parent
       */
      val = groupX + imageCX;
    }

    return val;
  }

  /**
   * Get the center y coordinate of the group
   */
  cy() {
    let val = 0;

    if (this.group != null && this.image != null) {
      // get the group
      const groupY = this.group.y();

      /*
       * get the center y coordinate of the image relative to the group.
       * this will be equal to half the height of the image.
       */
      const imageCY = this.image.cy();

      /*
       * get the y coordinate of the center of the group relative to the
       * svg parent
       */
      val = groupY + imageCY;
    }

    return val;
  }

  /**
   * Get the center x coordinate of the group
   */
  connectorCX() {
    let val = 0;

    if (this.group != null && this.image != null) {
      // get the group
      const groupX = this.group.x();

      /*
       * get the center x coordinate of the image relative to the group.
       * this will be equal to half the width of the image.
       */
      const imageCX = this.connector.cx();

      /*
       * get the x coordinate of the center of the group relative to the
       * svg parent
       */
      val = groupX + imageCX;
    }

    return val;
  }

  /**
   * Get the center y coordinate of the group
   */
  connectorCY() {
    let val = 0;

    if (this.group != null && this.image != null) {
      // get the group
      const groupY = this.group.y();

      /*
       * get the center y coordinate of the image relative to the group.
       * this will be equal to half the height of the image.
       */
      const imageCY = this.connector.cy();

      /*
       * get the y coordinate of the center of the group relative to the
       * svg parent
       */
      val = groupY + imageCY;
    }

    return val;
  }

  /**
   * Getter/setter for whether the node is highlighted
   * @parm value (optional) boolean value that sets the highlighted value
   * @returns whether the node is highlighted
   */
  isHighlighted(value) {
    if (value != null) {
      this.highlighted = value;
    }

    return this.highlighted;
  }

  /**
   * Get the group
   * @returns the group
   */
  getGroup() {
    return this.group;
  }

  /**
   * Show the delete button group
   */
  showDeleteButton() {
    this.deleteButtonGroup.show();
  }

  /**
   * Hide the delete button group
   */
  hideDeleteButton() {
    this.deleteButtonGroup.hide();
  }

  /**
   * Show the border of the node
   */
  showBorder() {
    this.border.show();
  }

  /**
   * Hide the border of the node
   */
  hideBorder() {
    this.border.hide();
  }

  /**
   * Get the connector of the node
   */
  getConnector() {
    return this.connector;
  }

  /**
   * Get the id of the connector
   */
  getConnectorId() {
    let id = null;

    if (this.connector != null) {
      id = this.connector.id();
    }

    return id;
  }

  /**
   * Get the x position of the group within the svg
   * @returns the x position of the group
   */
  getGroupX() {
    let x = 0;

    if (this.group != null) {
      /*
       * the image is located at 0, 0 within the group so we will obtain
       * the x location of the group
       */
      x = this.group.x();
    }

    return x;
  }

  /**
   * Get the y position of the group within the svg
   * @returns the y position of the group
   */
  getGroupY() {
    let y = 0;

    if (this.group != null) {
      /*
       * the image is located at 0, 0 within the group so we will obtain
       * the y location of the group
       */
      y = this.group.y();
    }

    return y;
  }

  /**
   * Get the x position of the image within the svg
   * @returns the x position of the image
   */
  getImageX() {
    // get the x position of the group
    const groupX = this.getGroupX();

    // get the x position of the image relative to the group
    const imageRelativeX = this.image.x();

    // add the values together to get the absolute x position of the image
    let imageX = groupX + imageRelativeX;

    // get the group
    const group = this.getGroup();

    // check if the group is shifted
    if (group != null) {
      // get the bounding box of the group
      const bbox = group.bbox();

      if (bbox != null) {
        // get the x position of the bounding box on the group
        const bboxX = bbox.x;

        // compensate for the shift of the group
        imageX = imageX - bboxX;
      }
    }

    return imageX;
  }

  /**
   * Get the y position of the image within the svg
   * @returns the y position of the image
   */
  getImageY() {
    // get the y position of the group
    const groupY = this.getGroupY();

    // get the y position of the image relative to the group
    const imageRelativeY = this.image.y();

    // add the values together to get the absolute y position of the image
    let imageY = groupY + imageRelativeY;

    // get the group
    const group = this.getGroup();

    // check if the group is shifted
    if (group != null) {
      // get the bounding box of the group
      const bbox = group.bbox();

      // get the y position of the bounding box on the group
      const bboxY = bbox.y;

      // compensate for the shift of the group
      imageY = imageY - bboxY;
    }

    return imageY;
  }

  /**
   * Get the width of the image
   * @returns the width of th eimage
   */
  getImageWidth() {
    let width = 0;

    if (this.image != null) {
      width = this.image.width();
    }

    return width;
  }

  /**
   * Get the height of the image
   * @returns the height of the image
   */
  getImageHeight() {
    let height = 0;

    if (this.image != null) {
      height = this.image.height();
    }

    return height;
  }

  /**
   * Set the mouseover listener for the group
   * @param nodeMouseOverFunction the function to call when the mouse is over
   * the group
   */
  setNodeMouseOver(nodeMouseOverFunction) {
    if (this.group != null) {
      this.group.mouseover(nodeMouseOverFunction);
    }
  }

  /**
   * Set the mouseout listener for the group
   * @param nodeMouseOutFunction the function to call when the mouse moves
   * out of the group
   */
  setNodeMouseOut(nodeMouseOutFunction) {
    if (this.group != null) {
      this.group.mouseout(nodeMouseOutFunction);
    }
  }

  /**
   * Set the mousedown listener for the group
   * @param nodeMouseDownFunction the function to call when the mouse is
   * down on the group
   */
  setNodeMouseDown(nodeMouseDownFunction) {
    if (this.group != null) {
      this.group.mousedown(nodeMouseDownFunction);
    }
  }

  /**
   * Set the mouseup listener for the group
   * @param nodeMouseUpFunction the function to call when the mouse is
   * released over the group
   */
  setNodeMouseUp(nodeMouseUpFunction) {
    if (this.group != null) {
      this.group.mouseup(nodeMouseUpFunction);
    }
  }

  /**
   * Set the click listener for the image
   * @param nodeMouseClickFunction the function to call when the image is
   * clicked
   */
  setNodeMouseClick(nodeMouseClickFunction) {
    if (this.group != null) {
      this.image.click(nodeMouseClickFunction);
    }
  }

  /**
   * Set the mousedown listener for the connector
   * @param connectorMouseDownFunction the function to call when the mouse
   * is down on the connector
   */
  setConnectorMouseDown(connectorMouseDownFunction) {
    if (this.connector != null) {
      this.connector.mousedown(connectorMouseDownFunction);
    }
  }

  /**
   * Set the mousedown listener for the delete button
   * @param deleteButtonMouseDownFunction the function to call when the mouse
   * is down on the delete button
   */
  setDeleteButtonMouseDown(deleteButtonMouseDownFunction) {
    if (this.deleteButtonCircle != null) {
      this.deleteButtonCircle.mousedown(deleteButtonMouseDownFunction);
    }
  }

  /**
   * Set the mouseover listener for the delete button
   * @param deleteButtonMouseOverFunction the function to call when the mouse
   * is over the delete button
   */
  setDeleteButtonMouseOver(deleteButtonMouseOverFunction) {
    if (this.deleteButtonCircle != null) {
      this.deleteButtonCircle.mouseover(deleteButtonMouseOverFunction);
    }
  }

  /**
   * Set the mouseout listener for the delete button
   * @param deleteButtonMouseOutFunction the function to call when the mouse
   * moves out of the delete button
   */
  setDeleteButtonMouseOut(deleteButtonMouseOutFunction) {
    if (this.deleteButtonCircle != null) {
      this.deleteButtonCircle.mouseout(deleteButtonMouseOutFunction);
    }
  }

  /**
   * Set the dragmove listener for the group
   * @param dragMoveFunction the function to call when the group is dragged
   */
  setDragMove(dragMoveFunction) {
    if (this.group != null) {
      // set a listener for when the node is dragged
      this.group.on('dragmove', dragMoveFunction);
    }
  }

  /**
   * Set the x position
   * @param x the x position
   */
  setX(x) {
    this.x = x;
    this.group.x(x);
  }

  /**
   * Set the y position
   * @param y the y position
   */
  setY(y) {
    this.y = y;
    this.group.y(y);
  }

  /**
   * Add an outgoing link to the node
   * @param outgoingLink a ConceptMapLink object
   */
  addOutgoingLink(outgoingLink) {
    if (outgoingLink != null) {
      this.outgoingLinks.push(outgoingLink);
    }
  }

  /**
   * Remove an outgoing link from the node
   * @param outgoingLink a ConceptMapLink object
   */
  removeOutgoingLink(outgoingLink) {
    if (outgoingLink != null) {
      // loop through all the outgoing links in this node
      for (let ol = 0; ol < this.outgoingLinks.length; ol++) {
        // get an outgoing link
        const tempOutgoingLink = this.outgoingLinks[ol];

        if (outgoingLink == tempOutgoingLink) {
          // we have found the outgoing link we want to remove
          this.outgoingLinks.splice(ol, 1);
          break;
        }
      }
    }
  }

  /**
   * Get the outgoing links
   * @return the outgoing links
   */
  getOutgoingLinks() {
    return this.outgoingLinks;
  }

  /**
   * Add an incoming link to the node
   * @param incomingLink a ConceptMapLink object
   */
  addIncomingLink(incomingLink) {
    if (incomingLink != null) {
      this.incomingLinks.push(incomingLink);
    }
  }

  /**
   * Remove an incoming link from the node
   * @param incomingLink a ConceptMapLink object
   */
  removeIncomingLink(incomingLink) {
    if (incomingLink != null) {
      // loop through the incoming links in the node
      for (let il = 0; il < this.incomingLinks.length; il++) {
        // get an incoming link
        const tempIncomingLink = this.incomingLinks[il];

        if (incomingLink == tempIncomingLink) {
          // we have found the incoming link we want to remove
          this.incomingLinks.splice(il, 1);
          break;
        }
      }
    }
  }

  /**
   * Get the incoming links
   * @return the incoming links
   */
  getIncomingLinks() {
    return this.incomingLinks;
  }

  /**
   * The function that is called when the node is moved
   * @param event
   */
  dragMove(event) {
    // get the group
    const group = this.getGroup();

    // get the x and y coordinates of the center of the image
    const cx = this.cx();
    const cy = this.cy();

    // update the local x, y values of the node for bookkeeping
    this.x = group.x();
    this.y = group.y();

    // get the outgoing links and incoming links
    const outgoingLinks = this.outgoingLinks;
    const incomingLinks = this.incomingLinks;

    if (outgoingLinks != null) {
      // loop through all the outgoing links
      for (let ol = 0; ol < outgoingLinks.length; ol++) {
        // get an outgoing link
        const outgoingLink = outgoingLinks[ol];

        // update the x, y coordinate of the tail of the link
        const x1 = cx;
        const y1 = cy;

        // calculate the nearest point to the destination node
        const nearestPoint = outgoingLink.getNearestPointToDestinationNode(x1, y1);
        const x2 = nearestPoint.x;
        const y2 = nearestPoint.y;

        // update the coordinates of the link
        outgoingLink.updateCoordinates(x1, y1, x2, y2);
      }

      // loop through all the incoming links
      for (let il = 0; il < incomingLinks.length; il++) {
        // get an incoming link
        const incomingLink = incomingLinks[il];

        // reuse the coordinates of the tail of the link
        const x1 = incomingLink.x1();
        const y1 = incomingLink.y1();

        // calculate the nearest point to the source node
        const nearestPoint = incomingLink.getNearestPointToDestinationNode(x1, y1);
        const x2 = nearestPoint.x;
        const y2 = nearestPoint.y;

        // update the coordinates of the link
        incomingLink.updateCoordinates(x1, y1, x2, y2);
      }
    }

    if (this.controller != null) {
      // handle the student data changing
      this.controller.studentDataChanged();
    }

    // move the group to the front so that it shows up above other elements
    group.front();
  }

  /**
   * Remove the node from the svg
   */
  remove() {
    // make the group not draggable
    this.group.draggable(false);

    // remove the group
    this.group.remove();

    // remove the image
    this.image.remove();

    // remove the connector
    this.connector.remove();

    // remove the delete button
    this.deleteButtonCircle.remove();
    this.deleteButtonX.remove();
    this.deleteButtonGroup.remove();

    // loop through all the outgoing links
    for (let ol = 0; ol < this.outgoingLinks.length; ol++) {
      // get an outgoing link
      const outgoingLink = this.outgoingLinks[ol];

      if (outgoingLink != null) {
        // remove the outgoing link
        outgoingLink.remove();

        /*
         * move the counter back one because calling outgoingLink.remove()
         * has removed the outgoingLink from the outgoingLinks array
         */
        ol--;
      }
    }

    // loop through all the incoming links
    for (let il = 0; il < this.incomingLinks.length; il++) {
      // get an incoming link
      const incomingLink = this.incomingLinks[il];

      if (incomingLink != null) {
        // remove the incoming link
        incomingLink.remove();

        /*
         * move the counter back one because calling incomingLink.remove()
         * has removed the incomingLink from the incomingLinks array
         */
        il--;
      }
    }
  }

  /**
   * Get the links from this node to a given destination node
   * @param destinationNode the destination node
   */
  getLinksToDestination(destinationNode) {
    const linksToDestination = [];

    // loop through all the outgoing links
    for (let ol = 0; ol < this.outgoingLinks.length; ol++) {
      // get an outgoing link
      const outgoingLink = this.outgoingLinks[ol];

      if (outgoingLink != null) {
        if (destinationNode == outgoingLink.destinationNode) {
          /*
           * the destination of the link is the destination we are
           * looking for
           */
          linksToDestination.push(outgoingLink);
        }
      }
    }

    return linksToDestination;
  }

  /**
   * Calculate the width that the text rectangle should be set to
   * @param labelText the label text that will be displayed in the rectangle
   * @return the width that the text rectangle should be set to
   */
  calculateTextRectWidth(labelText) {
    let width = 0;

    if (labelText != null) {
      width = labelText.length * 6 + 10;
    }

    return width;
  }
}

export default ConceptMapNode;
