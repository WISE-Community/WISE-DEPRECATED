import { Directive, Input } from '@angular/core';

@Directive()
export abstract class ComponentGrading {
  @Input()
  nodeId: string;

  @Input()
  componentId: string;

  @Input()
  componentState: any;
}
