import { Component, OnInit } from '@angular/core';
import {
  bounceIn,
  flipInX,
  flipInY,
  jackInTheBox,
  rotateIn,
  zoomIn
} from "../animations";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    bounceIn,
    flipInX,
    flipInY,
    jackInTheBox,
    rotateIn,
    zoomIn
  ]
})
export class HomeComponent implements OnInit {

  loaded = false;

  constructor() { }

  ngOnInit() {
  }
}
