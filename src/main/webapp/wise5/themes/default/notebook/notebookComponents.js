'use strict';

import Notebook from './notebook/notebook';
import NotebookItem from './notebookItem/notebookItem';
import NotebookNotes from './notebookNotes/notebookNotes';
import NotebookReport from './notebookReport/notebookReport';
import NotebookReportAnnotations from './notebookReportAnnotations/notebookReportAnnotations';
import NotebookLauncher from './notebookLauncher/notebookLauncher';

const NotebookComponents = angular.module('theme.notebook', []);

NotebookComponents.component('notebook', Notebook);
NotebookComponents.component('notebookItem', NotebookItem);
NotebookComponents.component('notebookNotes', NotebookNotes);
NotebookComponents.component('notebookReport', NotebookReport);
NotebookComponents.component('notebookReportAnnotations', NotebookReportAnnotations);
NotebookComponents.component('notebookLauncher', NotebookLauncher);

export default NotebookComponents;
