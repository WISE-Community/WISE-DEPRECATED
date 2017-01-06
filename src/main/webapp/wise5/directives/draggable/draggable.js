'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Make the element draggable
 */
var DraggableController = function () {
    function DraggableController($document, $element) {
        var _this = this;

        _classCallCheck(this, DraggableController);

        this.$document = $document;
        this.$element = $element;

        /*
         * used to remember the start x and y coordinate of the top left corner
         * of the element
         */
        this.startX = 0;
        this.startY = 0;

        // set the attributes into the element so we can access them later
        //this.attributes = attr;

        $element.bind('mousedown', function (event) {

            // Prevent default dragging of selected content
            event.preventDefault();

            var leftString = null;
            var topString = null;
            var left = null;
            var top = null;

            if (_this.$element != null && _this.$element.length > 0) {
                /*
                 * get the pixel location of the top left corner relative to its
                 * parent container
                 */
                leftString = _this.$element[0].style.left;
                topString = _this.$element[0].style.top;

                if (leftString != null) {
                    // get the integer value of the left
                    left = parseInt(leftString.replace('px', ''));
                }

                if (topString != null) {
                    // get the integer value of the top
                    top = parseInt(topString.replace('px', ''));
                }

                /*
                 * get the position of the mouse and subtract the distance from
                 * the upper left corner of the parent container to the upper
                 * left corner of the element.
                 * this will be equal to the sum of two values.
                 * the first value is the x and y difference between the upper
                 * left corner of the browser screen to the upper left corner
                 * of the parent container.
                 * the second value is the x and y difference between the upper
                 * left corner of the element to the mouse position.
                 * we will use the sum of these two values later to calculate
                 * where to place the element when it is being dragged.
                 */
                _this.startX = event.pageX - left;
                _this.startY = event.pageY - top;

                // add mouse listeners to handle moving the element
                _this.$document.on('mousemove', $.proxy(_this.mousemove, _this));
                _this.$document.on('mouseup', $.proxy(_this.mouseup, _this));
            }
        });
    }

    _createClass(DraggableController, [{
        key: 'mousemove',
        value: function mousemove(event) {

            var linkTypeChooserWidth = null;
            var linkTypeChooserHeight = null;

            // get the width and height of the element we are dragging
            var linkTypeChooserWidthString = angular.element(this.$element[0]).css('width');
            var linkTypeChooserHeightString = angular.element(this.$element[0]).css('height');

            if (linkTypeChooserWidthString != null && linkTypeChooserHeightString != null) {
                // get the integer values of the width and height
                linkTypeChooserWidth = parseInt(linkTypeChooserWidthString.replace('px', ''));
                linkTypeChooserHeight = parseInt(linkTypeChooserHeightString.replace('px', ''));
            }

            /*
             * get the width and height of the container that we want to restrict
             * the element within. the user will not be able to drag the element
             * outside of these boundaries.
             */
            var overlayWidth = this.$element.scope().$eval(this.$element[0].attributes['container-width'].value);
            var overlayHeight = this.$element.scope().$eval(this.$element[0].attributes['container-height'].value);

            /*
             * calculate the x and y position of where the element should be
             * placed. we will calculate the position by taking the mouse
             * position and subtracting the value we previously calculated
             * in the mousedown event. performing the subtraction will give
             * us the x and y difference between the upper left corner of the
             * parent container and the upper left corner of the element.
             */
            var x = event.pageX - this.startX;
            var y = event.pageY - this.startY;

            var top = 0;

            if (x < 0) {
                /*
                 * the x position that we have calculated for the left
                 * side of the element is past the left side of the parent
                 * container so we will set the x position to 0 so that the
                 * element is up against the left side of the parent container
                 */
                x = 0;
            } else if (x + linkTypeChooserWidth > overlayWidth) {
                /*
                 * the x position that we have calculated for the right
                 * side of the element is past the right side of the parent
                 * container so we will set the x position so that the element
                 * is up against the right side of the parent container
                 */
                x = overlayWidth - linkTypeChooserWidth;
            }

            if (y < top) {
                /*
                 * the y position that we have calculated for the top
                 * side of the element is past the top side of the parent
                 * container so we will set the y position to 0 so that the
                 * element is up against the top side of the parent container
                 */
                y = top;
            } else if (y + linkTypeChooserHeight > overlayHeight + top) {
                /*
                 * the y position that we have calculated for the bottom
                 * side of the element is past the bottom side of the parent
                 * container so we will set the y position so that the element
                 * is up against the bottom side of the parent container
                 */
                y = overlayHeight + top - linkTypeChooserHeight;
            }

            // move the element to the new position
            this.$element.css({
                top: y + 'px',
                left: x + 'px'
            });
        }
    }, {
        key: 'mouseup',
        value: function mouseup() {
            // remove the mousemove listener
            this.$document.off('mousemove', this.mousemove);

            // remove the mouseup listener
            this.$document.off('mouseup', this.mouseup);
        }
    }]);

    return DraggableController;
}();

DraggableController.$inject = ['$document', '$element'];

var Draggable = {
    bindings: {},
    controller: DraggableController
};

exports.default = Draggable;
//# sourceMappingURL=draggable.js.map