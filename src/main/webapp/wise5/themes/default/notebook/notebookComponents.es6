'use strict';

import Notebook from './notebook/notebook';
import NotebookItem from './notebookItem/notebookItem';
import NotebookNotes from './notebookNotes/notebookNotes';
import NotebookReport from './notebookReport/notebookReport';
import NotebookLauncher from './notebookLauncher/notebookLauncher';

let NotebookComponents = angular.module('theme.notebook', []);

NotebookComponents.component('notebook', Notebook);
NotebookComponents.component('notebookItem', NotebookItem);
NotebookComponents.component('notebookNotes', NotebookNotes);
NotebookComponents.component('notebookReport', NotebookReport);
NotebookComponents.component('notebookLauncher', NotebookLauncher);

export default NotebookComponents;
