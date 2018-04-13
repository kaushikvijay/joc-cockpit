import { Component, OnInit } from '@angular/core';
import {CoreService} from "../../services/core.service";

declare var EditorUi:any;
declare var Editor:any;
declare var mxUtils:any;
declare var Graph:any;
declare var mxResources:any;

@Component({
  selector: 'app-job-chain',
  templateUrl: './job-chain.component.html',
  styleUrls: ['./job-chain.component.css']
})
export class JobChainComponent implements OnInit {
  error: string;

  constructor(public  coreService: CoreService) {
  }

  ngOnInit() {
    this.init();
  }

  init() {

    //var graph = new mxGraph(document.getElementById('graph'));
    // Extends EditorUi to update I/O action states based on availability of backend
    let editorUiInit = EditorUi.prototype.init;
    EditorUi.prototype.init = function () {
      editorUiInit.apply(this, arguments);
      this.actions.get('export').setEnabled(false);
      let self =  this;
      // Updates action states which require a backend
      mxUtils.post('/open', '', mxUtils.bind(this, function (req) {
        let enabled = req.getStatus() != 404;
        self.actions.get('open').setEnabled(enabled || Graph.fileSupport);
        self.actions.get('import').setEnabled(enabled || Graph.fileSupport);
        self.actions.get('save').setEnabled(enabled);
        self.actions.get('saveAs').setEnabled(enabled);
        self.actions.get('export').setEnabled(enabled);
      }));
    };

    mxResources.loadDefaultBundle = false;
    // Fixes possible asynchronous requests
    mxUtils.getAll(['../../assets/mxgraph/resources/grapheditor.txt', '../../assets/mxgraph/styles/default.xml'], function (xhr) {
      // Adds bundle text to resources
      mxResources.parse(xhr[0].getText());
      // Configures the default graph theme
      let themes = new Object();
      themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();
      // Main
      new EditorUi(new Editor(false, themes));
    },  (err)=> {
      this.error = 'Error loading resource files. Please check browser console.'
    });
  }
}
