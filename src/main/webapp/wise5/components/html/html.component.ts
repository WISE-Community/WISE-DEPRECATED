import * as angular from "angular";
import { Component, Input, OnInit, SecurityContext, Renderer, ElementRef, EventEmitter, Output } from "@angular/core";
import { Activity } from "../activity";
import { DomSanitizer, SafeHtml, SafeScript } from '@angular/platform-browser';


@Component({
  selector: "html-activity",
  template: `<div [innerHTML]="sanitizedHTML"></div>`
})
export class Html implements OnInit {

  @Input() component: any;
  @Output() activity: EventEmitter<string> = new EventEmitter<string>();

  sanitizedHTML: SafeHtml;
  $scope;
  $rootScope;
  nodeId;
  componentId;
  UtilService;

  constructor(private sanitizer: DomSanitizer, elementRef: ElementRef, renderer: Renderer) {
    this.sanitizer = sanitizer;
    renderer.listen(elementRef.nativeElement, 'click', (event) => {
      this.activity.emit(event);
    });
  }

  someOtherFunc() {
    /*
     * Listen for the requestImage event which is fired when something needs
     * an image representation of the student data from a specific
     * component.
     */
    this.$scope.$on("requestImage", (event, args) => {
      // get the node id and component id from the args
      let nodeId = args.nodeId;
      let componentId = args.componentId;

      // check if the image is being requested from this component
      if (this.nodeId === nodeId && this.componentId === componentId) {
        // obtain the image objects
        let imageObjects = this.getImageObjects();

        if (imageObjects != null) {
          let args = {
            nodeId: nodeId,
            componentId: componentId,
            imageObjects: imageObjects
          };

          // fire an event that contains the image objects
          this.$scope.$emit("requestImageCallback", args);
        }
      }
    });

    this.$rootScope.$broadcast("doneRenderingComponent", {
      nodeId: this.nodeId,
      componentId: this.componentId
    });
  }

  ngOnInit() {
    this.sanitizedHTML = this.sanitizer.bypassSecurityTrustHtml(this.component.html);
  }

  /**
   * Get the image object representation of the student data
   * @returns an image object
   */
  getImageObjects() {
    let imageObjects = [];

    // get the image elements in the scope
    let componentId = this.componentId;
    let imageElements = angular.element(
      document.querySelector("#" + componentId + " img")
    );

    if (imageElements != null) {
      // loop through all the image elements
      for (let i = 0; i < imageElements.length; i++) {
        let imageElement = imageElements[i];

        if (imageElement != null) {
          // create an image object
          let imageObject = this.UtilService.getImageObjectFromImageElement(
            imageElement
          );
          imageObjects.push(imageObject);
        }
      }
    }

    return imageObjects;
  }
}
