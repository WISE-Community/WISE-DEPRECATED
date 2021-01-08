class ConceptMapLink {
  type: string;
  id: string;
  originalId: string;
  head: any;
  path: any;
  color: string;
  highlighted: boolean;
  group: any;
  draw: any;
  textPercentageLocationOnLink: number;
  sourceNode: any;
  destinationNode: any;
  curvature: number;
  startCurveUp: boolean;
  endCurveUp: boolean;
  curvedLink: boolean;
  label: string;
  deleteButtonGroup: any;
  textGroup: any;
  deleteButton: any;
  deleteButtonX: any;
  text: any;
  textRect: any;
  invisibleCircle: any;

  /**
   * The constructor to create a ConceptMapLink object
   * @param draw the svg.js draw object
   * @param id the instance id of the link
   * @param originalId the original authored id of the link
   * @param sourceNode the source ConceptMapNode
   * @param destinationNode the destination ConceptMapNode
   * @param label the text label
   * @param color the color of the link
   * @param curvature the curvature of the link
   * @param startCurveUp whether the start of the link curves up
   * @param endCurveUp whether the end of the link curves up
   */
  constructor(
    draw,
    id,
    originalId,
    sourceNode,
    destinationNode,
    label,
    color,
    curvature,
    startCurveUp,
    endCurveUp
  ) {
    this.type = 'ConceptMapLink';

    // remember the svg.js draw object
    this.draw = draw;

    // set the id
    this.id = id;

    // set the original id
    this.originalId = originalId;

    // the arrow head of the link
    this.head = null;

    // the line of the link
    this.path = null;

    // set the color of the link
    this.color = color;

    if (this.color == null) {
      // if no color is specified, use a default color
      this.color = 'blue';
    }

    // whether the link is highlighted
    this.highlighted = false;

    // create a group to contain the path and head
    this.group = this.draw.group();

    // where to place the text of the link along the line
    this.textPercentageLocationOnLink = 0.6;

    // remember the source node
    this.sourceNode = sourceNode;

    /*
     * used to remember the destination node later after the destination
     * node has been chosen
     */
    this.destinationNode = destinationNode;

    // remember the curvature
    this.curvature = curvature;

    if (this.curvature == null) {
      this.curvature = 0.5;
    }

    // set whether the link curves up or down
    this.startCurveUp = startCurveUp;
    this.endCurveUp = endCurveUp;

    if (this.startCurveUp == null || this.endCurveUp == null) {
      /*
       * start and end curve up have not been specified so we will set
       * it at random
       */

      // choose a random integer 0 or 1
      const randInt = Math.floor(Math.random() * 2);

      if (randInt == 0) {
        // set the link to curve down
        this.startCurveUp = false;
        this.endCurveUp = false;
      } else {
        // set the link to curve up
        this.startCurveUp = true;
        this.endCurveUp = true;
      }
    }

    // create a curved link
    this.curvedLink = true;

    // initialize the coordinates of both ends of the link
    const x1 = this.sourceNode.cx();
    const y1 = this.sourceNode.cy();
    let x2 = x1;
    let y2 = y1;

    if (this.destinationNode != null) {
      /*
       * get the nearest point from the center of the source node to the
       * destination node along the perimeter of the destination node
       * image
       */
      const nearestPoint: any = this.getNearestPointToDestinationNode(x1, y1);
      x2 = nearestPoint.x;
      y2 = nearestPoint.y;

      // connect the link to the nodes
      this.connectLinkToNodes();
    }

    if (this.curvedLink) {
      // create a curved link

      // calculate the curved line in svg
      const arrowPathArraysObject = this.calculateCurvedLine(x1, y1, x2, y2);

      // get the line
      const tail = arrowPathArraysObject[0];

      // get the arrow head
      const head = arrowPathArraysObject[1];

      // draw the head and tail
      this.head = this.draw.path(head.toString());
      this.path = this.draw.path(tail.toString());
    } else {
      // create a straight line
      this.path = this.draw.path('M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2);
    }

    // set the style of the link
    this.path.attr('stroke', this.color);
    this.path.attr('stroke-width', 3);
    this.path.attr('fill', 'transparent');
    this.head.attr('stroke', this.color);
    this.head.attr('fill', this.color);
    this.head.attr('pointer-events', 'none');

    /*
     * remember the x and y coordinates of the source and destination
     * so that we can look them up easily later
     */
    this.path.attr('x1', x1);
    this.path.attr('y1', y1);
    this.path.attr('x2', x2);
    this.path.attr('y2', y2);

    // add the tail and head to the group
    this.group.add(this.path);
    this.group.add(this.head);

    // create the text group for the link
    this.createTextGroup();

    // text that describes the type of link chosen by the student
    this.setLabel(label);

    if (this.label == null || this.label == '') {
      // there is no label so we will hide the text group
      this.hideTextGroup();
    } else {
      // there is a label so we will show the text group
      this.showTextGroup();
    }

    // create the delete button group
    this.createDeleteButtonGroup();
  }

  /**
   * Get the JSON object representation of the ConceptMapLink
   * @returns a JSON object containing the data of the ConceptMapLink
   */
  toJSONObject() {
    return {
      originalId: this.originalId,
      instanceId: this.id,
      color: this.color,
      label: this.label,
      curvature: this.curvature,
      startCurveUp: this.startCurveUp,
      endCurveUp: this.endCurveUp,
      sourceNodeOriginalId: this.sourceNode.getOriginalId(),
      sourceNodeInstanceId: this.sourceNode.getId(),
      sourceNodeLabel: this.sourceNode.getLabel(),
      destinationNodeOriginalId: this.destinationNode.getOriginalId(),
      destinationNodeInstanceId: this.destinationNode.getId(),
      destinationNodeLabel: this.destinationNode.getLabel()
    };
  }

  /**
   * Get the id of the link
   * @returns the id of the link
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
   * Get the id of the group
   * @returns the id of the group
   */
  getGroupId() {
    return this.group.id();
  }

  /**
   * Get the x1 value
   * @returns the x coordinate of the source of the link
   */
  x1() {
    return this.path.attr('x1');
  }

  /**
   * Get the y1 value
   * @returns the y coordinate of the source of the link
   */
  y1() {
    return this.path.attr('y1');
  }

  /**
   * Get the x2 value
   * @returns the x coordinate of the destination of the link
   */
  x2() {
    return this.path.attr('x2');
  }

  /**
   * Get the y2 value
   * @returns the y coordinate of the destination of the link
   */
  y2() {
    return this.path.attr('y2');
  }

  /**
   * Set the original id
   * @param originalId the original id
   */
  setOriginalId(originalId) {
    this.originalId = originalId;
  }

  /**
   * Get the label
   * @returns the label
   */
  getLabel() {
    return this.label;
  }

  /**
   * Getter/setter for the highlighted value
   * @param value (optional) the highlighted value
   * @returns whether the link is highlighted
   */
  isHighlighted(value) {
    if (value != null) {
      this.highlighted = value;
    }

    return this.highlighted;
  }

  /**
   * Update the coordinates of the link
   * @param x1 (optional) the x position of the source
   * @param y1 (optional) the y position of the source
   * @param x2 (optional) the x position of the destination
   * @param y2 (optional) the y position of the destination
   * @param isDragging whether the link is currently being dragged
   */
  updateCoordinates(x1, y1, x2, y2, isDragging) {
    const array = this.path.array();

    if (this.curvedLink) {
      // draw a curved link

      if (x1 == null) {
        /*
         * the x1 parameter was not provided so we will reuse the
         * existing value
         */
        x1 = this.path.attr('x1');
      }

      if (y1 == null) {
        /*
         * the y1 parameter was not provided so we will reuse the
         * existing value
         */
        y1 = this.path.attr('y1');
      }

      if (x2 == null) {
        /*
         * the x2 parameter was not provided so we will reuse the
         * existing value
         */
        x2 = this.path.attr('x2');
      }

      if (y2 == null) {
        /*
         * the y2 parameter was not provided so we will reuse the
         * existing value
         */
        y2 = this.path.attr('y2');
      }

      // calculate the line
      const arrowPathArraysObject = this.calculateCurvedLine(x1, y1, x2, y2, isDragging);

      // get the svg tail
      const tail = arrowPathArraysObject[0];

      // get the svg head
      const head = arrowPathArraysObject[1];

      // re-plot the head and path
      this.head.plot(head.toString());
      this.path.plot(tail.toString());
    } else {
      // draw a straight line

      if (x1 == null) {
        /*
         * the x1 parameter was not provided so we will reuse the
         * existing value
         */
        x1 = this.path.attr('x1');
      }

      if (y1 == null) {
        /*
         * the y1 parameter was not provided so we will reuse the
         * existing value
         */
        y1 = this.path.attr('y1');
      }

      if (x2 == null) {
        /*
         * the x2 parameter was not provided so we will reuse the
         * existing value
         */
        x2 = this.path.attr('x2');
      }

      if (y2 == null) {
        /*
         * the y2 parameter was not provided so we will reuse the
         * existing value
         */
        y2 = this.path.attr('y2');
      }

      // re-plot the line
      this.path.plot('M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2);
    }

    // update the coordinate values
    this.path.attr('x1', x1);
    this.path.attr('y1', y1);
    this.path.attr('x2', x2);
    this.path.attr('y2', y2);

    if (this.deleteButtonGroup != null) {
      // update the location of the delete button
      const deleteButtonLocation = this.getDeleteButtonLocation();
      this.deleteButtonGroup.x(deleteButtonLocation.x);
      this.deleteButtonGroup.y(deleteButtonLocation.y);
    }

    if (this.textGroup != null) {
      // update the location of the text group

      // get the length of the line
      const totalLength = this.path.node.getTotalLength();

      // get the coordinate of a point somewhere in the middel of the line
      const midPoint = this.path.node.getPointAtLength(
        totalLength * this.textPercentageLocationOnLink
      );

      this.textGroup.cx(midPoint.x);
      this.textGroup.cy(midPoint.y);
    }
  }

  /**
   * Calculate the curved line
   * @param x1 the x coordinate of the source
   * @param y1 the y coordinate of the source
   * @param x2 the x coordinate of the destination
   * @param y2 the y coordinate of the destination
   * @param isDragging whether the line is currently being dragged
   * @returns an array that contains the svg objects for the arrow head and line
   */
  calculateCurvedLine(x1, y1, x2, y2, isDragging = false) {
    const startx = x1;
    const starty = y1;
    const endx = x2;
    const endy = y2;
    let startCurveUp = true;
    let endCurveUp = true;
    const len = 15;
    const angle = 45;
    let curvature = 0.5;
    const nodeRadius = 10;

    // set the amount of curvature of the line
    curvature = this.curvature;

    // whether the link should curve up or down
    startCurveUp = this.startCurveUp;
    endCurveUp = this.endCurveUp;

    // calculate the svg objects for the arrow head and line
    const arrowPathArraysObject = this.arrowPathArrays(
      startx,
      starty,
      endx,
      endy,
      startCurveUp,
      endCurveUp,
      len,
      angle,
      curvature,
      nodeRadius
    );

    return arrowPathArraysObject;
  }

  /**
   * Set the destination node
   * @param destinationNode the destination ConceptMapNode object
   */
  setDestination(destinationNode) {
    if (destinationNode != null) {
      // get x and y of the tail
      const x1 = this.path.attr('x1');
      const y1 = this.path.attr('y1');

      // remember the destination node
      this.destinationNode = destinationNode;

      /*
       * check if there are any links with that have the same source,
       * destination, and direction. if there is a link that has the
       * same source, destination, and direction, we will try to use
       * a different direction that hasn't already been used. if all
       * directions have already been used, we will use the original
       * direction the user specified. there are three link directions,
       * up, straight, and down.
       *    ___
       * up  /   \
       *  o  o
       *
       * straight o------o
       *
       *    o   o
       * down \__/
       */

      let directionAlreadyUsed = false;
      let direction = '';

      if (this.curvature == 0) {
        // the user has created the curve to be straight
        direction = 'straight';
      } else if (this.startCurveUp && this.endCurveUp) {
        // the user has created the curve that starts by pointing up
        direction = 'up';
      } else if (!this.startCurveUp && !this.endCurveUp) {
        // the user has created the curve that starts by pointing down
        direction = 'down';
      }

      // get all the links that have the same source and destination
      const parallelLinks = this.sourceNode.getLinksToDestination(destinationNode);

      const usedDirections = [];

      // loop through all the links that have the same source and destination
      for (let p = 0; p < parallelLinks.length; p++) {
        const parallelLink = parallelLinks[p];

        if (parallelLink != null) {
          const curvature = parallelLink.curvature;
          const startCurveUp = parallelLink.startCurveUp;
          const endCurveUp = parallelLink.endCurveUp;

          let tempDirection = '';

          if (curvature == 0) {
            // the other link is straight
            tempDirection = 'straight';
          } else if (startCurveUp && endCurveUp) {
            // the other link points up
            tempDirection = 'up';
          } else if (!startCurveUp && !endCurveUp) {
            // the other link points down
            tempDirection = 'down';
          }

          if (direction == tempDirection) {
            /*
             * the direction is the same as the direction the user
             * has specified
             */
            directionAlreadyUsed = true;
          }

          // keep track of the directions that were used
          usedDirections.push(tempDirection);
        }
      }

      if (directionAlreadyUsed) {
        /*
         * the direction the user specified is already used so we will
         * try to find a direction that hasn't been used
         */

        if (usedDirections.indexOf('up') == -1) {
          /*
           * we have not used the up direction yet so we will make
           * the link point up
           */
          this.curvature = 0.5;
          this.startCurveUp = true;
          this.endCurveUp = true;
        } else if (usedDirections.indexOf('straight') == -1) {
          /*
           * we have not used the straight direction yet so we will
           * make the link point straight
           */
          this.curvature = 0.0;
          this.startCurveUp = true;
          this.endCurveUp = true;
        } else if (usedDirections.indexOf('down') == -1) {
          /*
           * we have not used the down direction yet so we will make
           * the link point down
           */
          this.curvature = 0.5;
          this.startCurveUp = false;
          this.endCurveUp = false;
        }
      }

      /*
       * get the nearest point from the center of the source node to the
       * destination node along the perimeter of the destination node
       * image
       */
      const nearestPoint: any = this.getNearestPointToDestinationNode(x1, y1);
      const x2 = nearestPoint.x;
      const y2 = nearestPoint.y;

      // update the coordinates of the link
      const isDragging = false;
      this.updateCoordinates(x1, y1, x2, y2, isDragging);

      // connect the link to the nodes
      this.connectLinkToNodes();

      // hide the delete button
      this.hideDeleteButton();
    }
  }

  /**
   * Get the nearest point to the destination node from a given x, y point
   * @param x the x value of the source point
   * @param y the y value of the source point
   * @returns an object containing an x and y field
   */
  getNearestPointToDestinationNode(x, y) {
    // get the coordinates of the upper left corner of the image
    const rectMinX = this.destinationNode.getImageX();
    let rectMinY = this.destinationNode.getImageY();

    /*
     * add padding of 25 pixels to resolve the problem of the arrow head
     * being placed behind the destination image
     */
    rectMinY = rectMinY - 25;

    // get the width and height of the image
    const width = this.destinationNode.getImageWidth();
    let height = this.destinationNode.getImageHeight();

    // compensate for the 25 pixel padding that we added above
    height = height + 25;

    /*
    var destinationNodeGroup = this.destinationNode.getGroup();
    var destinationNodeGroupBBox = destinationNodeGroup.bbox();

    rectMinX = this.destinationNode.getGroupX();
    rectMinY = this.destinationNode.getGroupY();

    width = destinationNodeGroupBBox.width;
    height = destinationNodeGroupBBox.height;
    */

    if (x == null && y == null) {
      // get the coordinates of the source if x and y were not provided
      x = this.path.attr('x1');
      y = this.path.attr('y1');
    }

    /*
     * find the nearest point from the source to anywhere along the
     * rectangular perimeter of the destination image
     */
    const point = this.getNearestPointInPerimeter(rectMinX, rectMinY, width, height, x, y);

    return point;
  }

  /**
   * Get the nearest point on a rectangle from a source point
   * @param l the upper left x value of the rectangle
   * @param t the upper left y value of the rectangle
   * @param w the width of the rectangle
   * @param h the height of the rectangle
   * @param x the source point x value
   * @param y the source point y value
   * @returns the point on the rectangle that is closest to the
   */
  getNearestPointInPerimeter(l, t, w, h, x, y) {
    const r = l + w;
    const b = t + h;

    x = this.clamp(x, l, r);
    y = this.clamp(y, t, b);

    const dl = Math.abs(x - l);
    const dr = Math.abs(x - r);
    const dt = Math.abs(y - t);
    const db = Math.abs(y - b);

    const m = Math.min(dl, dr, dt, db);

    const point: any = {};

    if (m == dt) {
      point.x = x;
      point.y = t;
    } else if (m == db) {
      point.x = x;
      point.y = b;
    } else if (m == dl) {
      point.x = l;
      point.y = y;
    } else {
      point.x = r;
      point.y = y;
    }

    return point;
  }

  /**
   * Helper function for getNearestPointInPerimeter
   */
  clamp(x, lower, upper) {
    return Math.max(lower, Math.min(upper, x));
  }

  /**
   * Set the color of the link
   * @param color the color
   */
  setColor(color) {
    if (color != null) {
      // set the color styling
      this.color = color;
      this.path.attr('stroke', this.color);
      this.head.attr('stroke', this.color);
      this.head.attr('fill', this.color);
      this.deleteButton.attr('stroke', this.color);
      this.deleteButtonX.attr('stroke', this.color);
    }
  }

  /**
   * Set the label
   * @param label the text label
   */
  setLabel(label) {
    if (label != null) {
      // remember the label
      this.label = label;

      // set the text into the text element
      this.text.text(label);

      // show the text group now that it has a label
      this.showTextGroup();

      // reset the width to adjust to the new text length
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

      // recalculate the position of the svg text object
      const totalLength = this.path.node.getTotalLength();
      const midPoint = this.path.node.getPointAtLength(
        totalLength * this.textPercentageLocationOnLink
      );
      this.textGroup.cx(midPoint.x);
      this.textGroup.cy(midPoint.y);
    }
  }

  /**
   * Connect a link the its source and destination nodes
   */
  connectLinkToNodes() {
    if (this.sourceNode != null && this.destinationNode != null) {
      // add the link to the outgoing links of its source node
      this.sourceNode.addOutgoingLink(this);

      // add the link to the incoming links of its destination node
      this.destinationNode.addIncomingLink(this);
    }
  }

  /**
   * Create the delete button for the link
   */
  createDeleteButtonGroup() {
    // create a group to contain the elements of the delete button
    this.deleteButtonGroup = this.draw.group();

    /*
     * create an invisible circle that is placed behind the delete button
     * and has a larger radius than the delete button. this is used for
     * mouse over purposes so that we can keep the delete button visible
     * when the mouse is around the area of the delete button
     */
    const invisibleCircleRadius = 30;
    this.invisibleCircle = this.draw.circle();
    this.invisibleCircle.radius(invisibleCircleRadius);
    this.invisibleCircle.fill({ opacity: 0.0 });

    // create the delete button circle
    const deleteButtonRadius = 10;
    this.deleteButton = this.draw.circle();
    this.deleteButton.radius(deleteButtonRadius);
    this.deleteButton.fill({ opacity: 0.0 });
    this.deleteButton.stroke({ color: this.color, opacity: 1.0, width: 2 });

    /*
     * create the x part of the delete button by creating a + and then
     * rotating it 45 degrees
     */

    // get the coordinate of the center of the delete button
    const deleteButtonMidpointX = this.deleteButton.cx();
    const deleteButtonMidpointY = this.deleteButton.cy();

    // get the coordinates of the top of the +
    const topX = deleteButtonMidpointX;
    const topY = deleteButtonMidpointY - deleteButtonRadius * 0.7;

    // get the coordinates of the bottom of the +
    const bottomX = deleteButtonMidpointX;
    const bottomY = deleteButtonMidpointY + deleteButtonRadius * 0.7;

    // get the coordinates of the left of the +
    const leftX = deleteButtonMidpointX - deleteButtonRadius * 0.7;
    const leftY = deleteButtonMidpointY;

    // get the coordinates of the right of the +
    const rightX = deleteButtonMidpointX + deleteButtonRadius * 0.7;
    const rightY = deleteButtonMidpointY;

    // create the path for the +
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

    // draw the path
    this.deleteButtonX = this.draw.path(deleteButtonXPath);
    this.deleteButtonX.stroke({ color: this.color, opacity: 1.0, width: 2 });

    /// rotate the + to create the x
    this.deleteButtonX.rotate(45);

    /*
     * disable pointer events on the x so that we only need to set a
     * mouse listener on the circle
     */
    this.deleteButtonX.attr('pointer-events', 'none');

    // add the invisible circle, regular circle, and x to the group
    this.deleteButtonGroup.add(this.invisibleCircle);
    this.deleteButtonGroup.add(this.deleteButton);
    this.deleteButtonGroup.add(this.deleteButtonX);

    // set the location of the delete button group
    const location: any = this.getDeleteButtonLocation();
    const x = location.x;
    const y = location.y;
    this.deleteButtonGroup.x(x);
    this.deleteButtonGroup.y(y);

    // set the listener for when the mouse is over the group
    this.deleteButtonGroup.mouseover((event) => {
      this.deleteButtonGroupMouseOver(event);
    });

    // set the listener for when the mouse moves out of the group
    this.deleteButtonGroup.mouseout((event) => {
      this.deleteButtonGroupMouseOut(event);
    });

    // add the delete button group to the link group
    this.group.add(this.deleteButtonGroup);

    /*
     * hide the delete button. we only need to show the delete button
     * when the link is active.
     */
    this.deleteButtonGroup.hide();
  }

  /**
   * Called when the mouse is over the delete button group
   * @param event the mouseover event
   */
  deleteButtonGroupMouseOver(event) {
    // show the delete button
    this.showDeleteButton();
  }

  /**
   * Called when the mouse leaves the delete button group
   * @param event the mouseout event
   */
  deleteButtonGroupMouseOut(event) {
    if (!this.highlighted) {
      // the link is not highlighted so we will hide the delete button
      this.hideDeleteButton();
    }
  }

  /**
   * Called when the delete button is clicked
   * @param deleteButtonClickedFunction the function to call when the delete
   * button is clicked
   */
  setDeleteButtonClicked(deleteButtonClickedFunction) {
    // listen for the click event on the delete button to call the function
    this.deleteButton.click(deleteButtonClickedFunction);
  }

  /**
   * Called when the mouse is clicked down on the group
   * @param linkMouseDownFunction the function to call when the mouse is
   * clicked down on the group
   */
  setLinkMouseDown(linkMouseDownFunction) {
    if (this.group != null) {
      /*
       * listen for the mousedown event on the group to call
       * the function
       */
      this.group.mousedown(linkMouseDownFunction);
    }
  }

  /**
   * Called when the mouse is clicked down on the link text group
   * @param linkTextMouseDownFunction the function to call when the mouse is
   * clicked down on the link text group
   */
  setLinkTextMouseDown(linkTextMouseDownFunction) {
    if (this.textGroup != null) {
      /*
       * listen for the mousedown event on the link text group to call
       * the function
       */
      this.textGroup.mousedown(linkTextMouseDownFunction);
    }
  }

  /**
   * Called when the mouse is over the group
   * @param linkMouseOverFunction the function to call when the mouse is over
   * the group
   */
  setLinkMouseOver(linkMouseOverFunction) {
    if (this.group != null) {
      // listen for the mouseover event on the group to call the function
      this.group.mouseover(linkMouseOverFunction);
    }
  }

  /**
   * Called when the mouse leaves the group
   * @param linkMouseOutFunction the function to call when the mouse leaves
   * the group
   */
  setLinkMouseOut(linkMouseOutFunction) {
    if (this.group != null) {
      // listen for the mouseout event on the group to call the function
      this.group.mouseout(linkMouseOutFunction);
    }
  }

  /**
   * Calculate the location of the delete button for the link
   *
   * Note: This function and the associated functions that are called by this
   * function are taken from the Concord MySystem github project.
   * https://github.com/concord-consortium/mysystem_sc
   * The code is found in the _setRemoveButtonLocation function in the link.js file.
   * mysystem_sc/apps/my_system/views/link.js
   */
  getDeleteButtonLocation() {
    //var line = raphaelObject.items[2];

    const line = this.path.node;
    const distanceAlongLine = 35;
    const distanceAlongNormal = 18;
    let len, p1, p2, scale, dx, dy, x, y, occluded;

    /*
    var link = this.get('content');
    if (!link.isComplete()) return;
    if (line.attr('path').length < 1) return;   // this can happen after our content is destroyed
    */

    len = line.getTotalLength();
    p2 = line.getPointAtLength(len);

    if (len > 50) {
      p1 = line.getPointAtLength(len - distanceAlongLine);

      dx = p2.x - p1.x;
      dy = p2.y - p1.y;
      scale = (distanceAlongNormal / distanceAlongLine) * (dx > 0 ? 1 : -1);

      x = p1.x + scale * dy;
      y = p1.y - scale * dx;
      //occluded = NO;
    } else {
      x = 0;
      y = 0;
      //occluded = YES;
    }

    /*
    this.set('removeButtonX', x);
    this.set('removeButtonY', y);
    this.set('isRemoveButtonOccluded', occluded);
    */

    const location: any = {};
    location.x = x;
    location.y = y;

    return location;
  }

  /**
   * Show the delete button
   */
  showDeleteButton() {
    if (this.deleteButtonGroup != null) {
      this.deleteButtonGroup.show();
    }
  }

  /**
   * Hide the delete button
   */
  hideDeleteButton() {
    if (this.deleteButtonGroup != null) {
      this.deleteButtonGroup.hide();
    }
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

    let label = '';

    // create the text element
    this.text = this.draw.text(label);
    this.text.attr('x', 5);
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

    // set the location of the text to be somewhere along the line of the link
    const totalLength = this.path.node.getTotalLength();
    const midPoint = this.path.node.getPointAtLength(
      totalLength * this.textPercentageLocationOnLink
    );
    this.textGroup.cx(midPoint.x);
    this.textGroup.cy(midPoint.y);

    // hide the text group until the student has chosen a link type
    this.textGroup.hide();

    /*
     * set the link group id into the text group so we can look it up
     * later when the mouse is clicked down on the text group
     */
    this.textGroup.node.linkGroupId = this.group.id();

    return this.textGroup;
  }

  /**
   * Move the text group to the front so that it won't be blocked behind
   * another element when the student tries to click on the text group.
   */
  moveTextGroupToFront() {
    this.textGroup.front();
  }

  /**
   * Show the text group
   */
  showTextGroup() {
    if (this.textGroup != null) {
      this.textGroup.show();
    }
  }

  /**
   * Hide the text group
   */
  hideTextGroup() {
    if (this.textGroup != null) {
      this.textGroup.hide();
    }
  }

  /**
   * Remove all the references to the link and also remove all the elements
   * from the svg
   */
  remove() {
    if (this.sourceNode != null) {
      // remove the link from the source node's outgoing links
      this.sourceNode.removeOutgoingLink(this);
    }

    if (this.destinationNode != null) {
      // remove the link from the destination node's incoming links
      this.destinationNode.removeIncomingLink(this);
    }

    if (this.path != null) {
      // remove the line
      this.path.remove();
    }

    if (this.head != null) {
      // remove the arrow head
      this.head.remove();
    }

    if (this.deleteButtonGroup != null) {
      // remove the delete button group
      this.deleteButtonGroup.remove();
    }

    if (this.textGroup != null) {
      // remove the text group
      this.textGroup.remove();
    }

    if (this.group != null) {
      // remove the link group
      this.group.remove();
    }
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

  /**

  Returns an array representation of the path elements for an arrow

  First we calculate a simple curve for the tail.

  Then we pick a point on that curve to use as the base-center of the arrow head,
  then calculate the position of that triangle based on the angle between that
  point and the tip.

  @params startx {Number} X-coordinate of the start point
  @params starty {Number} Y-coordinate of the start point
  @params endx {Number} X-coordinate of the end point
  @params endy {Number} Y-coordinate of the end point
  @params len {Number} Length of the "tip" of the arrowhead
  @params angle {Number} Angle in degrees
    between the line and each wing of the arrowhead.
    Should be less than 90.

  Note: This function and the associated functions that are called by this
  function are taken from the Concord MySystem github project.
  https://github.com/concord-consortium/mysystem_sc
  The code is found in the arrow_drawing.js file.
  mysystem_sc/apps/my_system/mixins/arrow_drawing.js

  **/
  arrowPathArrays(
    startx,
    starty,
    endx,
    endy,
    startCurveUp,
    endCurveUp,
    len,
    angle,
    curvature,
    nodeRadius
  ) {
    if (startx === endx && starty === endy) {
      return [[''], ['']];
    }

    const start = this.coord(startx, starty);
    const pathData = [];
    const arrowHeadData = [];
    let tip = this.coord(endx, endy);

    // calculate control points c2 and c3
    const curveDistance = (tip.x - start.x) * curvature;
    let startYCurveDistance =
      curveDistance === 0 ? 1 : Math.max(Math.min(curveDistance, 100), -100);
    let endYCurveDistance = startYCurveDistance;
    const startUp = startCurveUp ? 1 : -1;
    const endUp = endCurveUp ? 1 : -1;
    startYCurveDistance =
      startYCurveDistance * startUp > 0 ? startYCurveDistance : startYCurveDistance * -1;
    endYCurveDistance = endYCurveDistance * endUp > 0 ? endYCurveDistance : endYCurveDistance * -1;
    const c2 = this.coord(start.x + curveDistance / 2, start.y - startYCurveDistance),
      c3 = this.coord(tip.x - curveDistance / 2, tip.y - endYCurveDistance),
      cDistance = Math.sqrt(Math.pow(curveDistance / 2, 2) + Math.pow(startYCurveDistance, 2)),
      perimX = (nodeRadius * (curveDistance / 2)) / cDistance,
      perimYstart = (nodeRadius * startYCurveDistance) / cDistance,
      perimYend = (nodeRadius * endYCurveDistance) / cDistance;

    // update tip
    tip = this.coord(tip.x - perimX, tip.y - perimYend);

    // draw arrow path

    pathData.push('M', start.x + perimX, start.y - perimYstart); // move to start of line
    pathData.push('C', c2.x, c2.y, c3.x, c3.y, tip.x, tip.y); // curve line to the tip

    // draw arrow head
    const percLengthOfHead = len / this.getLengthOfCubicBezier(start, c2, c3, tip),
      centerBaseOfHead = this.getPointOnCubicBezier(percLengthOfHead, start, c2, c3, tip),
      theta = Math.atan2(tip.y - centerBaseOfHead.y, tip.x - centerBaseOfHead.x),
      baseAngleA = theta + (angle * Math.PI) / 180,
      baseAngleB = theta - (angle * Math.PI) / 180,
      baseA = this.coord(tip.x - len * Math.cos(baseAngleA), tip.y - len * Math.sin(baseAngleA)),
      baseB = this.coord(tip.x - len * Math.cos(baseAngleB), tip.y - len * Math.sin(baseAngleB));

    arrowHeadData.push('M', tip.x, tip.y);
    arrowHeadData.push('L', baseA.x, baseA.y); // line to baseA
    arrowHeadData.push('L', baseB.x, baseB.y); // line to baseB
    arrowHeadData.push('L', tip.x, tip.y); // line back to the tip

    return [pathData, arrowHeadData];
  }

  /**
   * Note: This function is from
   * https://github.com/concord-consortium/mysystem_sc
   * The code is found in the arrow_drawing.js file.
   * mysystem_sc/apps/my_system/mixins/arrow_drawing.js
   */
  coord(x = null, y = null) {
    if (!x) x = 0;
    if (!y) y = 0;
    /*
     *   Limit precision of decimals for SVG rendering.
     *   otherwise we get really long SVG strings,
     *   and webkit error messsages like of this sort:
     *   "Error: Problem parsing d='<svg string with long dec>'"
     */
    x = Math.round(x * 1000) / 1000;
    y = Math.round(y * 1000) / 1000;
    return { x: x, y: y };
  }

  /**
   * Note: This function is from
   * https://github.com/concord-consortium/mysystem_sc
   * The code is found in the arrow_drawing.js file.
   * mysystem_sc/apps/my_system/mixins/arrow_drawing.js
   */
  getLengthOfCubicBezier(C1, C2, C3, C4) {
    const precision = 10;
    let length = 0;
    let t;
    let currentPoint;
    let previousPoint;

    for (let i = 0; i < precision; i++) {
      t = i / precision;
      currentPoint = this.getPointOnCubicBezier(t, C1, C2, C3, C4);
      if (i > 0) {
        const xDif = currentPoint.x - previousPoint.x,
          yDif = currentPoint.y - previousPoint.y;
        length += Math.sqrt(xDif * xDif + yDif * yDif);
      }
      previousPoint = currentPoint;
    }
    return length;
  }

  /**
   * Note: This function is from
   * https://github.com/concord-consortium/mysystem_sc
   * The code is found in the arrow_drawing.js file.
   * mysystem_sc/apps/my_system/mixins/arrow_drawing.js
   */
  getPointOnCubicBezier(percent, C1, C2, C3, C4) {
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;
    const pos = this.coord();
    pos.x =
      C1.x * this.B1(percent) +
      C2.x * this.B2(percent) +
      C3.x * this.B3(percent) +
      C4.x * this.B4(percent);
    pos.y =
      C1.y * this.B1(percent) +
      C2.y * this.B2(percent) +
      C3.y * this.B3(percent) +
      C4.y * this.B4(percent);
    return pos;
  }

  /**
   * Note: These functions are from
   * https://github.com/concord-consortium/mysystem_sc
   * The code is found in the arrow_drawing.js file.
   * mysystem_sc/apps/my_system/mixins/arrow_drawing.js
   */
  B1(t) {
    return t * t * t;
  }
  B2(t) {
    return 3 * t * t * (1 - t);
  }
  B3(t) {
    return 3 * t * (1 - t) * (1 - t);
  }
  B4(t) {
    return (1 - t) * (1 - t) * (1 - t);
  }
}

export default ConceptMapLink;
