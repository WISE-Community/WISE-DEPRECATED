import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NodeService } from '../../../../../../wise5/services/nodeService';
import { ProjectService } from '../../../../../../wise5/services/projectService';

@Component({
  selector: 'app-choose-branch-path-dialog',
  templateUrl: './choose-branch-path-dialog.component.html',
  styleUrls: ['./choose-branch-path-dialog.component.scss']
})
export class ChooseBranchPathDialogComponent implements OnInit {
  paths: any[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.paths = data.paths;
  }

  ngOnInit(): void {}
}
