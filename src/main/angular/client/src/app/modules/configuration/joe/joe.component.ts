import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {saveAs} from 'file-saver';
import * as _ from 'underscore';

declare const mxEditor;
declare const mxUtils;
declare const mxEvent;
declare const mxClient;
declare const mxObjectCodec;
declare const mxEdgeHandler;
declare const mxCodec;
declare const mxAutoSaveManager;
declare const mxGraphHandler;
declare const mxCellAttributeChange;
declare const mxGraph;
declare const mxForm;
declare const mxHierarchicalLayout;
declare const mxImageExport;
declare const mxXmlCanvas2D;
declare const mxOutline;
declare const mxDragSource;
declare const mxConstants;
declare const mxRectangle;
declare const mxPoint;
declare const mxUndoManager;
declare const mxEventObject;

declare const X2JS;
declare const $;

const x2js = new X2JS();

@Component({
  selector: 'app-joe',
  templateUrl: './joe.component.html',
  styleUrls: ['./joe.component.scss']
})
export class JoeComponent implements OnInit, OnDestroy {
  schedulerIds: any = {};
  preferences: any = {};
  tree: any = [];
  isLoading = true;
  pageView: any = 'grid';
  editor: any;
  dummyXml: any;
  workFlowJson: any = {};
  object: any = {checkbox: false, workflows: []};
  isPropertyHide = false;
  options: any = {};
  selectedPath: string;
  isWorkflowReload = true;
  configXml = './assets/mxgraph/config/diagrameditor.xml';
  count = 11;

  // Declare Map object to store fork and join Ids
  nodeMap = new Map();
  @ViewChild('treeCtrl') treeCtrl;

  constructor(private authService: AuthService, public coreService: CoreService, public translate: TranslateService, public toasterService: ToasterService) {
  }

  static getDummyNodes(): any {
    return [
      {
        '_id': '3',
        '_title': 'Start',
        'mxCell': {
          '_parent': '1',
          '_vertex': '1',
          '_style': 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;',
          'mxGeometry': {
            '_as': 'geometry',
            '_width': '75',
            '_height': '75'
          }
        }
      }, {
        '_id': '5',
        '_title': 'End',
        'mxCell': {
          '_parent': '1',
          '_vertex': '1',
          '_style': 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;',
          'mxGeometry': {
            '_as': 'geometry',
            '_width': '75',
            '_height': '75'
          }
        }
      }
    ];
  }

  /**
   * Function to add Start and End nodes
   *
   * @param json
   * @param mxJson
   */
  static connectWithDummyNodes(json, mxJson) {
    if (json.instructions && json.instructions.length > 0) {
      if (mxJson.Connection) {
        if (!_.isArray(mxJson.Connection)) {
          const _tempConn = _.clone(mxJson.Connection);
          mxJson.Connection = [];
          mxJson.Connection.push(_tempConn);
        }
      } else {
        mxJson.Connection = [];
      }
      const startObj: any = {
        _label: '',
        _type: '',
        _id: '4',
        mxCell: {
          _parent: '1',
          _source: '3',
          _target: json.instructions[0].id,
          _edge: '1',
          mxGeometry: {
            _relative: 1,
            _as: 'geometry'
          }
        }
      };
      const last = json.instructions[json.instructions.length - 1];
      let targetId = last.id;
      if (last.TYPE === 'ForkJoin' || last.TYPE === 'If' || last.TYPE === 'Try' || last.TYPE === 'Retry') {
        let z: any;
        if (last.TYPE === 'ForkJoin') {
          z = mxJson.Join;
        } else if (last.TYPE === 'If') {
          z = mxJson.EndIf;
        } else if (last.TYPE === 'Try') {
          z = mxJson.EndTry;
        } else if (last.TYPE === 'Retry') {
          z = mxJson.RetryEnd;
        }
        if (z && _.isArray(z)) {
          for (let i = 0; i < z.length; i++) {
            if (z[i]._targetId === last.id) {
              targetId = z[i]._id;
              break;
            }
          }
        } else if (z) {
          targetId = z._id;
        }
      }

      const endObj: any = {
        _label: '',
        _type: '',
        _id: 6,
        mxCell: {
          _parent: '1',
          _source: targetId,
          _target: '5',
          _edge: '1',
          mxGeometry: {
            _relative: 1,
            _as: 'geometry'
          }
        }
      };
      mxJson.Connection.push(startObj);
      mxJson.Connection.push(endObj);
    }
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.init();
    this.coreService.get('workflow.json').subscribe((data) => {
      this.dummyXml = x2js.json2xml_str(data);
    });
  }

  ngOnDestroy() {
    try {
      if (this.editor) {
        mxEvent.removeAllListeners(this.editor.graph);
        this.editor.destroy();
        this.editor = null;
      }
    } catch (e) {
      console.log(e);
    }
  }

  init() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    if (localStorage.views) {
      // this.pageView = JSON.parse(localStorage.views).joe || 'grid';
    }
    if (!(this.preferences.theme === 'light' || this.preferences.theme === 'lighter')) {
      this.configXml = './assets/mxgraph/config/diagrameditor-dark.xml';
    }
    this.initTree();
  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ['WORKFLOW']
    }).subscribe((res) => {
      this.tree = this.coreService.prepareTree(res);
      const interval = setInterval(() => {
        if (this.treeCtrl && this.treeCtrl.treeModel) {
          const node = this.treeCtrl.treeModel.getNodeById(1);
          node.expand();
          node.data.isSelected = true;
          this.selectedPath = node.data.path;
          clearInterval(interval);
        }
      }, 5);
      this.isLoading = false;
      this.createEditor(this.configXml);
    }, () => this.isLoading = false);
  }

  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  createEditor(config) {
    let editor = null;
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        mxObjectCodec.allowEval = true;
        const node = mxUtils.load(config).getDocumentElement();
        editor = new mxEditor(node);
        this.editor = editor;

        this.initEditorConf(editor, null);
        mxObjectCodec.allowEval = false;

        const outln = document.getElementById('outlineContainer');
        outln.style['border'] = '1px solid lightgray';
        outln.style['background'] = '#FFFFFF';
        new mxOutline(this.editor.graph, outln);
        editor.graph.allowAutoPanning = true;
        editor.graph.timerAutoScroll = true;
        editor.addListener(mxEvent.OPEN);
        // Prints the current root in the window title if the
        // current root of the graph changes (drilling).
        editor.addListener(mxEvent.ROOT);
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
  }

  submitWorkFlow() {
    this.coreService.post('workflow/store', {
      jobschedulerId: this.schedulerIds.selected,
      workflow: this.workFlowJson
    }).subscribe(res => {
      console.log(res);
    }, (err) => {
      console.log(err);
    });
  }

  clearWorkFlow() {
    this.initEditorConf(this.editor, this.dummyXml);
  }

  toggleRightSideBar() {
    this.isPropertyHide = !this.isPropertyHide;
  }

  checkAll() {
    console.log('Check all...');
  }

  checkMainCheckbox() {
    console.log('Check all...');
  }

  navFullTree() {
    const self = this;
    this.tree.forEach((value) => {
      if (this.selectedPath === value.path && this.workFlowJson.instructions && this.workFlowJson.instructions.length > 0) {
        value.json = _.clone(this.workFlowJson);
      }
      value.isSelected = false;
      traverseTree(value);
    });

    function traverseTree(data) {
      data.children.forEach((value) => {
        value.isSelected = false;
        if (self.selectedPath === value.path && self.workFlowJson.instructions && self.workFlowJson.instructions.length > 0) {
          value.json = _.clone(self.workFlowJson);
        }
        traverseTree(value);
      });
    }
  }

  onNodeSelected(e): void {
    this.navFullTree();
    this.selectedPath = e.node.data.path;
    e.node.data.isSelected = true;
    this.count = 11;
    if (e.node.data.json) {
      let _json = e.node.data.json;
      this.appendIdInJson(_json);
      let mxJson = {
        mxGraphModel: {
          root: {
            mxCell: [
              {_id: '0'},
              {
                _id: '1',
                _parent: '0'
              }
            ],
            Process: []
          }
        }
      };
      mxJson.mxGraphModel.root.Process = JoeComponent.getDummyNodes();

      this.jsonParser(_json, mxJson.mxGraphModel.root, '', '');
      JoeComponent.connectWithDummyNodes(_json, mxJson.mxGraphModel.root);
      this.initEditorConf(this.editor, x2js.json2xml_str(mxJson));
    } else {
      this.initEditorConf(this.editor, this.dummyXml);
    }
  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }

  receiveMessage($event) {
    this.pageView = $event;
  }

  // Function to generating dynamic unique Id
  private appendIdInJson(json) {
    for (let x = 0; x < json.instructions.length; x++) {
      json.instructions[x].id = ++this.count;
      if (json.instructions[x].instructions) {
        this.appendIdInJson(json.instructions[x]);
      }
      if (json.instructions[x].catch) {
        if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
          this.appendIdInJson(json.instructions[x].catch);
        }
      }
      if (json.instructions[x].then) {
        this.appendIdInJson(json.instructions[x].then);
      }
      if (json.instructions[x].else) {
        this.appendIdInJson(json.instructions[x].else);
      }
      if (json.instructions[x].branches) {
        for (let i = 0; i < json.instructions[x].branches.length; i++) {
          this.appendIdInJson(json.instructions[x].branches[i]);
        }
      }
    }
  }

  /**
   * Function to generate flow diagram with the help of JSON
   *
   * @param json
   * @param mxJson
   * @param type
   * @param parentId
   */
  private jsonParser(json, mxJson, type, parentId) {
    const self = this;
    if (json.instructions) {
      for (let x = 0; x < json.instructions.length; x++) {
        let obj: any = {
          mxCell: {
            _parent: parentId ? parentId : '1',
            _vertex: '1',
            mxGeometry: {
              _as: 'geometry'
            }
          }
        };

        if (json.instructions[x].TYPE === 'Job') {
          if (mxJson.Job) {
            if (!_.isArray(mxJson.Job)) {
              let _tempJob = _.clone(mxJson.Job);
              mxJson.Job = [];
              mxJson.Job.push(_tempJob);
            }

          } else {
            mxJson.Job = [];
          }

          obj._id = json.instructions[x].id;
          obj._path = json.instructions[x].jobPath;
          obj._title = json.instructions[x].title ? json.instructions[x].title : '';
          obj._agent = json.instructions[x].agentPath ? json.instructions[x].agentPath : '';
          obj.mxCell._style = 'rounded';

          obj.mxCell.mxGeometry._width = '200';
          obj.mxCell.mxGeometry._height = '50';
          mxJson.Job.push(obj);
        } else if (json.instructions[x].TYPE === 'If') {
          if (mxJson.If) {
            if (!_.isArray(mxJson.If)) {
              let _tempIf = _.clone(mxJson.If);
              mxJson.If = [];
              mxJson.If.push(_tempIf);
            }
          } else {
            mxJson.If = [];
          }
          obj._id = json.instructions[x].id;
          obj._predicate = json.instructions[x].predicate;
          obj.mxCell._style = 'rhombus';
          obj.mxCell.mxGeometry._width = '150';
          obj.mxCell.mxGeometry._height = '70';

          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            self.jsonParser(json.instructions[x].then, mxJson, 'endIf', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].then.instructions[0], mxJson, 'then', obj._id);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            self.jsonParser(json.instructions[x].else, mxJson, 'endIf', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].else.instructions[0], mxJson, 'else', obj._id);
          }
          self.endIf(json.instructions[x], mxJson, json.instructions, x, json.instructions[x].id, parentId);
          mxJson.If.push(obj);
        } else if (json.instructions[x].TYPE === 'ForkJoin') {
          if (mxJson.Fork) {
            if (!_.isArray(mxJson.Fork)) {
              let _tempFork = _.clone(mxJson.Fork);
              mxJson.Fork = [];
              mxJson.Fork.push(_tempFork);
            }
          } else {
            mxJson.Fork = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = 'Fork';
          obj.mxCell._style = 'symbol;image=./assets/mxgraph/images/symbols/fork.png';
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';

          if (json.instructions[x].branches && json.instructions[x].branches.length > 0) {
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              self.jsonParser(json.instructions[x].branches[i], mxJson, 'branch', obj._id);
              self.connectInstruction(json.instructions[x], json.instructions[x].branches[i], mxJson, 'branch', obj._id);
            }

            self.joinFork(json.instructions[x].branches, mxJson, json.instructions, x, json.instructions[x].id, parentId);
          } else {
            self.joinFork(json.instructions[x], mxJson, json.instructions, x, json.instructions[x].id, parentId);
          }
          mxJson.Fork.push(obj);
        } else if (json.instructions[x].TYPE === 'Retry') {
          if (mxJson.Retry) {
            if (!_.isArray(mxJson.Retry)) {
              const _tempRetry = _.clone(mxJson.Retry);
              mxJson.Retry = [];
              mxJson.Retry.push(_tempRetry);
            }
          } else {
            mxJson.Retry = [];
          }
          obj._id = json.instructions[x].id;
          obj._repeat = json.instructions[x].repeat;
          obj._delay = json.instructions[x].delay;
          obj.mxCell._style = 'rhombus';
          obj.mxCell.mxGeometry._width = '180';
          obj.mxCell.mxGeometry._height = '70';

          if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
            self.jsonParser(json.instructions[x], mxJson, '', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].instructions[0], mxJson, 'retry', obj._id);
          }

          self.endRetry(json.instructions[x], mxJson, json.instructions, x, json.instructions[x].id, parentId);
          mxJson.Retry.push(obj);
        } else if (json.instructions[x].TYPE === 'Try') {
          if (mxJson.Try) {
            if (!_.isArray(mxJson.Try)) {
              const _tempRetry = _.clone(mxJson.Try);
              mxJson.Try = [];
              mxJson.Try.push(_tempRetry);
            }
          } else {
            mxJson.Try = [];
          }
          if (mxJson.Catch) {
            if (!_.isArray(mxJson.Catch)) {
              const _tempRetry = _.clone(mxJson.Catch);
              mxJson.Catch = [];
              mxJson.Catch.push(_tempRetry);
            }
          } else {
            mxJson.Catch = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = 'Try';
          obj.mxCell._style = 'rhombus';
          obj.mxCell.mxGeometry._width = '90';
          obj.mxCell.mxGeometry._height = '70';

          let catchObj: any = {
            mxCell: {
              _parent: obj._id,
              _vertex: '1',
              _style: 'rectangle',
              mxGeometry: {
                _as: 'geometry',
                _width: '90',
                _height: '40'
              }
            },
            _label: 'Catch'
          };
          let _id = 0;


          if (!json.instructions[x].catch) {
            json.instructions[x].catch = {id: (json.instructions[x].id * 7777), instructions: []};
          }

          if (json.instructions[x].catch && json.instructions[x].catch.instructions) {
            catchObj._id = json.instructions[x].catch.id;
            catchObj._targetId = json.instructions[x].id;
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              self.jsonParser(json.instructions[x].catch, mxJson, 'endCatch', obj._id);
              self.connectInstruction(json.instructions[x].catch, json.instructions[x].catch.instructions[0], mxJson, 'catch', obj._id);
            } else {
              catchObj.mxCell._style = 'dashRectangle';
            }
            _id = self.endCatch(json.instructions[x].catch, mxJson, json.instructions, json.instructions[x].catch.id, obj._id);
            mxJson.Catch.push(catchObj);
          }

          if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
            self.jsonParser(json.instructions[x], mxJson, '', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].instructions[0], mxJson, 'try', obj._id);
            const _lastNode = json.instructions[x].instructions[json.instructions[x].instructions.length - 1];
            if (_lastNode.TYPE !== 'ForkJoin' && _lastNode.TYPE !== 'If' && _lastNode.TYPE !== 'Try' && _lastNode.TYPE !== 'try') {
              self.connectInstruction(_lastNode, json.instructions[x].catch, mxJson, 'try', obj._id);
            } else {
              if (_lastNode && (_lastNode.TYPE === 'If')) {
                if (mxJson.EndIf && mxJson.EndIf.length) {
                  for (let j = 0; j < mxJson.EndIf.length; j++) {
                    if (_lastNode.id === mxJson.EndIf[j]._targetId) {
                      this.connectInstruction({id: mxJson.EndIf[j]._id}, json.instructions[x].catch, mxJson, 'try', obj._id);
                      break;
                    }
                  }
                }
              } else if (_lastNode && (_lastNode.TYPE === 'Retry')) {
                if (mxJson.RetryEnd && mxJson.RetryEnd.length) {
                  for (let j = 0; j < mxJson.RetryEnd.length; j++) {
                    if (_lastNode.id === mxJson.RetryEnd[j]._targetId) {
                      this.connectInstruction({id: mxJson.RetryEnd[j]._id}, json.instructions[x].catch, mxJson, 'try', obj._id);
                      break;
                    }
                  }
                }
              } else if (_lastNode && (_lastNode.TYPE === 'Try')) {
                if (mxJson.EndTry && mxJson.EndTry.length) {
                  for (let j = 0; j < mxJson.EndTry.length; j++) {
                    if (_lastNode.id === mxJson.EndTry[j]._targetId) {
                      this.connectInstruction({id: mxJson.EndTry[j]._id}, json.instructions[x].catch, mxJson, 'try', obj._id);
                      break;
                    }
                  }
                }
              } else if (_lastNode && (_lastNode.TYPE === 'ForkJoin')) {
                if (mxJson.Join && mxJson.Join.length) {
                  for (let j = 0; j < mxJson.Join.length; j++) {
                    if (_lastNode.id === mxJson.Join[j]._targetId) {
                      this.connectInstruction({id: mxJson.Join[j]._id}, json.instructions[x].catch, mxJson, 'try', obj._id);
                      break;
                    }
                  }
                }
              }
            }
          } else {
            self.connectInstruction(json.instructions[x], json.instructions[x].catch, mxJson, 'try', obj._id);
          }
          self.endTry(_id, mxJson, json.instructions, x, json.instructions[x].id, parentId);
          mxJson.Try.push(obj);
        } else if (json.instructions[x].TYPE === 'Terminate') {
          if (mxJson.Terminate) {
            if (!_.isArray(mxJson.Terminate)) {
              const _tempExit = _.clone(mxJson.Terminate);
              mxJson.Terminate = [];
              mxJson.Terminate.push(_tempExit);
            }
          } else {
            mxJson.Terminate = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = json.instructions[x].TYPE;
          obj._message = json.instructions[x].message;
          obj.mxCell._style = 'symbol;image=./assets/mxgraph/images/symbols/cancel_end.png';
          obj.mxCell.mxGeometry._width = '60';
          obj.mxCell.mxGeometry._height = '60';
          mxJson.Terminate.push(obj);
        } else if (json.instructions[x].TYPE === 'Await') {
          if (mxJson.Await) {
            if (!_.isArray(mxJson.Await)) {
              const _tempAwait = _.clone(mxJson.Await);
              mxJson.Await = [];
              mxJson.Await.push(_tempAwait);
            }
          } else {
            mxJson.Await = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = 'Await';
          obj.mxCell._style = 'symbol;image=./assets/mxgraph/images/symbols/timer.png';
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';

          if (json.instructions[x].events && json.instructions[x].events.length > 0) {
            for (let i = 0; i < json.instructions[x].events.length; i++) {
              self.jsonParseForAwait(json.instructions[x].events[i], mxJson, parentId);
              self.connectInstruction(json.instructions[x], json.instructions[x].events[i], mxJson, 'await', parentId);
            }
          }
          mxJson.Await.push(obj);
        } else {
          console.log('Workflow yet to parse : ' + json.instructions[x].TYPE);
        }
        if (json.instructions[x].TYPE !== 'ForkJoin' && json.instructions[x].TYPE !== 'If' && json.instructions[x].TYPE !== 'Try' && json.instructions[x].TYPE !== 'Retry') {
          self.connectEdges(json.instructions, x, mxJson, type, parentId);
        }
      }
    } else {
      console.log('No instruction..');
    }
  }

  private connectEdges(list, index, mxJson, type, parentId) {
    if (mxJson.Connection) {
      if (!_.isArray(mxJson.Connection)) {
        const _tempJob = _.clone(mxJson.Connection);
        mxJson.Connection = [];
        mxJson.Connection.push(_tempJob);
      }
    } else {
      mxJson.Connection = [];
    }

    if (list.length > (index + 1)) {
      let obj: any = {
        _label: type,
        _type: type,
        _id: ++this.count,
        mxCell: {
          _parent: parentId ? parentId : '1',
          _source: list[index].id,
          _target: list[index + 1].id,
          _edge: '1',
          mxGeometry: {
            _relative: 1,
            _as: 'geometry'
          }
        }
      };
      mxJson.Connection.push(obj);
    }
  }

  private connectInstruction(source, target, mxJson, label, parentId) {
    if (mxJson.Connection) {
      if (!_.isArray(mxJson.Connection)) {
        const _tempJob = _.clone(mxJson.Connection);
        mxJson.Connection = [];
        mxJson.Connection.push(_tempJob);
      }
    } else {
      mxJson.Connection = [];
    }
    let obj: any = {
      _label: label === 'then' ? 'true' : label === 'else' ? 'false' : label,
      _type: label,
      _id: ++this.count,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _source: source.id,
        _target: (source.TYPE === 'ForkJoin' && target.instructions) ? target.instructions[0].id : target.id,
        _edge: '1',
        mxGeometry: {
          _relative: 1,
          _as: 'geometry'
        }
      }
    };

    if (label === 'endCatch' && source.instructions.length === 0) {
      obj._label = '';
      obj._type = '';
      obj.mxCell._style = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;jettySize=auto;orthogonalLoop=1;dashed=1;shadow=0;opacity=50;';
    }
    mxJson.Connection.push(obj);
  }

  private endRetry(branches, mxJson, list, index, targetId, parentId) {
    if (mxJson.RetryEnd) {
      if (!_.isArray(mxJson.RetryEnd)) {
        const _tempRetryEnd = _.clone(mxJson.RetryEnd);
        mxJson.RetryEnd = [];
        mxJson.RetryEnd.push(_tempRetryEnd);
      }

    } else {
      mxJson.RetryEnd = [];
    }
    let id: number;
    id = parseInt(list[list.length - 1].id, 10) + 3000;

    this.nodeMap.set(targetId.toString(), id.toString());

    let joinObj: any = {
      _id: id,
      _label: 'Retry-End',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: 'rhombus',
        mxGeometry: {
          _as: 'geometry',
          _width: '150',
          _height: '70'
        }
      }
    };
    mxJson.RetryEnd.push(joinObj);

    if (branches.instructions && branches.instructions.length > 0) {
      const x = branches.instructions[branches.instructions.length - 1];
      if (x && (x.TYPE === 'If')) {
        if (mxJson.EndIf && mxJson.EndIf.length) {
          for (let j = 0; j < mxJson.EndIf.length; j++) {
            if (x.id === mxJson.EndIf[j]._targetId) {
              this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'retryEnd', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Retry')) {
        if (mxJson.RetryEnd && mxJson.RetryEnd.length) {
          for (let j = 0; j < mxJson.RetryEnd.length; j++) {
            if (x.id === mxJson.RetryEnd[j]._targetId) {
              this.connectInstruction({id: mxJson.RetryEnd[j]._id}, {id: id}, mxJson, 'retryEnd', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Try')) {
        if (mxJson.EndTry && mxJson.EndTry.length) {
          for (let j = 0; j < mxJson.EndTry.length; j++) {
            if (x.id === mxJson.EndTry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'retryEnd', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'ForkJoin')) {
        if (mxJson.Join && mxJson.Join.length) {
          for (let j = 0; j < mxJson.Join.length; j++) {
            if (x.id === mxJson.Join[j]._targetId) {
              this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'retryEnd', parentId);
              break;
            }
          }
        }
      } else {
        this.connectInstruction(x, {id: id}, mxJson, 'retryEnd', parentId);
      }
    } else {
      this.connectInstruction(branches, {id: id}, mxJson, '', parentId);
    }

    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', parentId);
    }
  }

  private joinFork(branches, mxJson, list, index, targetId, parentId) {
    if (mxJson.Join) {
      if (!_.isArray(mxJson.Join)) {
        const _tempJoin = _.clone(mxJson.Join);
        mxJson.Join = [];
        mxJson.Join.push(_tempJoin);
      }

    } else {
      mxJson.Join = [];
    }

    let id: number;
    id = parseInt(list[list.length - 1].id, 10) + 1000;
    this.nodeMap.set(targetId.toString(), id.toString());
    let joinObj: any = {
      _id: id,
      _label: 'Join',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: 'symbol;image=./assets/mxgraph/images/symbols/merge.png',
        mxGeometry: {
          _as: 'geometry',
          _width: '70',
          _height: '70'
        }
      }
    };
    mxJson.Join.push(joinObj);
    if (_.isArray(branches)) {


      for (let i = 0; i < branches.length; i++) {
        const x = branches[i].instructions[branches[i].instructions.length - 1];
        if (x && (x.TYPE === 'If')) {
          if (mxJson.EndIf && mxJson.EndIf.length) {
            for (let j = 0; j < mxJson.EndIf.length; j++) {
              if (x.id === mxJson.EndIf[j]._targetId) {
                this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'join', parentId);
                break;
              }
            }
          }
        } else if (x && (x.TYPE === 'ForkJoin')) {
          if (mxJson.Join && mxJson.Join.length) {
            for (let j = 0; j < mxJson.Join.length; j++) {
              if (x.id === mxJson.Join[j]._targetId) {
                this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'join', parentId);
                break;
              }
            }
          }
        } else if (x && (x.TYPE === 'Retry')) {
          if (mxJson.RetryEnd && mxJson.RetryEnd.length) {
            for (let j = 0; j < mxJson.RetryEnd.length; j++) {
              if (x.id === mxJson.RetryEnd[j]._targetId) {
                this.connectInstruction({id: mxJson.RetryEnd[j]._id}, {id: id}, mxJson, 'join', parentId);
                break;
              }
            }
          }
        } else if (x && (x.TYPE === 'Try')) {
          if (mxJson.EndTry && mxJson.EndTry.length) {
            for (let j = 0; j < mxJson.EndTry.length; j++) {
              if (x.id === mxJson.EndTry[j]._targetId) {
                this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'join', parentId);
                break;
              }
            }
          }
        } else {
          this.connectInstruction(x, {id: id}, mxJson, 'join', parentId);
        }
      }
    } else {
      this.connectInstruction(branches, {id: id}, mxJson, '', parentId);
    }

    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', parentId);
    }
  }

  private endIf(branches, mxJson, list, index, targetId, parentId) {
    if (mxJson.EndIf) {
      if (!_.isArray(mxJson.EndIf)) {
        const _tempJoin = _.clone(mxJson.EndIf);
        mxJson.EndIf = [];
        mxJson.EndIf.push(_tempJoin);
      }

    } else {
      mxJson.EndIf = [];
    }
    let id: number;
    id = parseInt(list[list.length - 1].id, 10) + 2000;
    this.nodeMap.set(targetId.toString(), id.toString());
    let endIfObj: any = {
      _id: id,
      _label: 'EndIf',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: 'rhombus',
        mxGeometry: {
          _as: 'geometry',
          _width: '150',
          _height: '70'
        }
      }
    };
    mxJson.EndIf.push(endIfObj);

    let flag = true;
    if (branches.then && branches.then.instructions) {
      flag = false;
      const x = branches.then.instructions[branches.then.instructions.length - 1];
      if (x && (x.TYPE === 'If')) {
        if (mxJson.EndIf && mxJson.EndIf.length) {
          for (let j = 0; j < mxJson.EndIf.length; j++) {
            if (x.id === mxJson.EndIf[j]._targetId) {
              this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'ForkJoin')) {
        if (mxJson.Join && mxJson.Join.length) {
          for (let j = 0; j < mxJson.Join.length; j++) {
            if (x.id === mxJson.Join[j]._targetId) {
              this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Retry')) {
        if (mxJson.RetryEnd && mxJson.RetryEnd.length) {
          for (let j = 0; j < mxJson.RetryEnd.length; j++) {
            if (x.id === mxJson.RetryEnd[j]._targetId) {
              this.connectInstruction({id: mxJson.RetryEnd[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Try')) {
        if (mxJson.EndTry && mxJson.EndTry.length) {
          for (let j = 0; j < mxJson.EndTry.length; j++) {
            if (x.id === mxJson.EndTry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else {
        this.connectInstruction(x, {id: id}, mxJson, 'endIf', parentId);
      }
    }
    if (branches.else && branches.else.instructions) {
      flag = false;
      const x = branches.else.instructions[branches.else.instructions.length - 1];
      if (x && (x.TYPE === 'If')) {
        if (mxJson.EndIf && mxJson.EndIf.length) {
          for (let j = 0; j < mxJson.EndIf.length; j++) {
            if (x.id === mxJson.EndIf[j]._targetId) {
              this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'ForkJoin')) {
        if (mxJson.Join && mxJson.Join.length) {
          for (let j = 0; j < mxJson.Join.length; j++) {
            if (x.id === mxJson.Join[j]._targetId) {
              this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Retry')) {
        if (mxJson.RetryEnd && mxJson.RetryEnd.length) {
          for (let j = 0; j < mxJson.RetryEnd.length; j++) {
            if (x.id === mxJson.RetryEnd[j]._targetId) {
              this.connectInstruction({id: mxJson.RetryEnd[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Try')) {
        if (mxJson.EndTry && mxJson.EndTry.length) {
          for (let j = 0; j < mxJson.EndTry.length; j++) {
            if (x.id === mxJson.EndTry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else {
        this.connectInstruction(x, {id: id}, mxJson, 'endIf', parentId);
      }
    }

    if (flag) {
      this.connectInstruction(branches, {id: id}, mxJson, '', parentId);
    }
    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', parentId);
    }
  }

  private endTry(x, mxJson, list, index, targetId, parentId) {
    if (mxJson.EndTry) {
      if (!_.isArray(mxJson.EndTry)) {
        const _tempEndTry = _.clone(mxJson.EndTry);
        mxJson.EndTry = [];
        mxJson.EndTry.push(_tempEndTry);
      }
    } else {
      mxJson.EndTry = [];
    }
    let id: number;
    id = parseInt(list[list.length - 1].id, 10) + 5000;
    this.nodeMap.set(targetId.toString(), id.toString());
    let joinObj: any = {
      _id: id,
      _label: 'Try-End',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: 'rhombus',
        mxGeometry: {
          _as: 'geometry',
          _width: '90',
          _height: '70'
        }
      }
    };

    mxJson.EndTry.push(joinObj);
    this.connectInstruction({id: x}, {id: id}, mxJson, 'endTry', parentId);
    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', parentId);
    }
  }

  private endCatch(branches, mxJson, list, targetId, parentId): number {
    if (mxJson.EndCatch) {
      if (!_.isArray(mxJson.EndCatch)) {
        const _tempEndCatch = _.clone(mxJson.EndCatch);
        mxJson.EndCatch = [];
        mxJson.EndCatch.push(_tempEndCatch);
      }

    } else {
      mxJson.EndCatch = [];
    }
    let id: number;
    id = parseInt(list[list.length - 1].id, 10) + 4000;
    this.nodeMap.set(targetId.toString(), id.toString());
    let joinObj: any = {
      _id: id,
      _label: 'Catch-End',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: 'rectangle',
        mxGeometry: {
          _as: 'geometry',
          _width: '90',
          _height: '40'
        }
      }
    };

    if (branches.instructions.length === 0) {
      joinObj.mxCell._style = 'dashRectangle';
    }

    mxJson.EndCatch.push(joinObj);

    let x = branches.instructions[branches.instructions.length - 1];
    if (!x) {
      x = branches;
    }

    if (x && (x.TYPE === 'If')) {
      if (mxJson.EndIf && mxJson.EndIf.length) {
        for (let j = 0; j < mxJson.EndIf.length; j++) {
          if (x.id === mxJson.EndIf[j]._targetId) {
            this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'endCatch', parentId);
            break;
          }
        }
      }
    } else if (x && (x.TYPE === 'Retry')) {
      if (mxJson.RetryEnd && mxJson.RetryEnd.length) {
        for (let j = 0; j < mxJson.RetryEnd.length; j++) {
          if (x.id === mxJson.RetryEnd[j]._targetId) {
            this.connectInstruction({id: mxJson.RetryEnd[j]._id}, {id: id}, mxJson, 'endCatch', parentId);
            break;
          }
        }
      }
    } else if (x && (x.TYPE === 'Try')) {
      if (mxJson.EndTry && mxJson.EndTry.length) {
        for (let j = 0; j < mxJson.EndTry.length; j++) {
          if (x.id === mxJson.EndTry[j]._targetId) {
            this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'endCatch', parentId);
            break;
          }
        }
      }
    } else if (x && (x.TYPE === 'ForkJoin')) {
      if (mxJson.Join && mxJson.Join.length) {
        for (let j = 0; j < mxJson.Join.length; j++) {
          if (x.id === mxJson.Join[j]._targetId) {
            this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'endCatch', parentId);
            break;
          }
        }
      }
    } else if (x) {
      this.connectInstruction(x, {id: id}, mxJson, 'endCatch', parentId);
    }
    return id;
  }

  private jsonParseForAwait(eventObj, mxJson, parentId) {
    if (eventObj.TYPE) {
      if (eventObj.TYPE === 'OfferedOrder') {
        if (mxJson.OfferedOrder) {
          if (!_.isArray(mxJson.OfferedOrder)) {
            const _tempOfferedOrder = _.clone(mxJson.OfferedOrder);
            mxJson.OfferedOrder = [];
            mxJson.OfferedOrder.push(_tempOfferedOrder);
          }
        } else {
          mxJson.OfferedOrder = [];
        }
        let obj: any = {
          _id: eventObj.id,
          _label: 'Offered Order',
          mxCell: {
            _parent: parentId ? parentId : '1',
            _vertex: '1',
            _style: 'ellipse',
            mxGeometry: {
              _as: 'geometry',
              _width: '80',
              _height: '60'
            }
          }
        };
        mxJson.OfferedOrder.push(obj);
      }
    } else if (eventObj.TYPE === 'TimePeriod') {
      //TODO
    } else if (eventObj.TYPE === 'FileOrder') {
      //TODO
    }
  }

  private createObject(type, node): any {
    let obj: any = {
      id: node._id,
      TYPE: type,
    };
    if (type === 'Job') {
      obj.jobPath = node._path;
      obj.title = node._title;
      obj.agentPath = node._agent;
      let successArr, failureArr;
      if (node._success) {
        successArr = node._success.split(',');
      }
      if (node._failure) {
        failureArr = node._failure.split(',');
      }
      obj.returnCodeMeaning = {failure: failureArr, success: successArr};
    } else if (type === 'If') {
      obj.predicate = node._predicate;
    } else if (type === 'Retry') {
      obj.repeat = node._repeat;
      obj.delay = node._delay;
    } else if (type === 'Terminate') {
      obj.message = node._message;
    }
    return obj;
  }

  private xmlToJsonParser() {
    if (this.editor) {
      const _graph = _.clone(this.editor.graph);
      const enc = new mxCodec();
      const node = enc.encode(_graph.getModel());
      const xml = mxUtils.getXml(node);
      let _json: any;
      try {
        _json = x2js.xml_str2json(xml);
      } catch (e) {
        console.log(e);
      }
      if (!_json.mxGraphModel) {
        return;
      }
      console.log(_json)

      let objects = _json.mxGraphModel.root;

      let jsonObj = {
        id: '',
        instructions: []
      };
      let startNode: any = {};
      if (objects.Connection) {
        if (!_.isArray(objects.Connection)) {
          let _tempCon = _.clone(objects.Connection);
          objects.Connection = [];
          objects.Connection.push(_tempCon);
        }
        let connection = objects.Connection;
        let _jobs = _.clone(objects.Job);
        let _ifInstructions = _.clone(objects.If);
        let _forkInstructions = _.clone(objects.Fork);
        let _tryInstructions = _.clone(objects.Try);
        let _retryInstructions = _.clone(objects.Retry);
        let _awaitInstructions = _.clone(objects.Await);
        let _exitInstructions = _.clone(objects.Terminate);

        for (let i = 0; i < connection.length; i++) {
          if (connection[i].mxCell._source == '3') {
            continue;
          } else if (connection[i].mxCell._target == '5') {
            continue;
          }
          if (_jobs) {
            if (_.isArray(_jobs)) {
              for (let j = 0; j < _jobs.length; j++) {
                if (connection[i].mxCell._target === _jobs[j]._id) {
                  _jobs.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _jobs._id) {
                _jobs = [];
              }
            }
          }
          if (_forkInstructions) {
            if (_.isArray(_forkInstructions)) {
              for (let j = 0; j < _forkInstructions.length; j++) {
                if (connection[i].mxCell._target === _forkInstructions[j]._id) {
                  _forkInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _forkInstructions._id) {
                _forkInstructions = [];
              }
            }
          }
          if (_retryInstructions) {
            if (_.isArray(_retryInstructions)) {
              for (let j = 0; j < _retryInstructions.length; j++) {
                if (connection[i].mxCell._target === _retryInstructions[j]._id) {
                  _retryInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _retryInstructions._id) {
                _retryInstructions = [];
              }
            }
          }
          if (_tryInstructions) {
            if (_.isArray(_tryInstructions)) {
              for (let j = 0; j < _tryInstructions.length; j++) {
                if (connection[i].mxCell._target === _tryInstructions[j]._id) {
                  _tryInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _tryInstructions._id) {
                _tryInstructions = [];
              }
            }
          }
          if (_awaitInstructions) {
            if (_.isArray(_awaitInstructions)) {
              for (let j = 0; j < _awaitInstructions.length; j++) {
                if (connection[i].mxCell._target === _awaitInstructions[j]._id) {
                  _awaitInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _awaitInstructions._id) {
                _awaitInstructions = [];
              }
            }
          }
          if (_ifInstructions) {
            if (_.isArray(_ifInstructions)) {
              for (let j = 0; j < _ifInstructions.length; j++) {
                if (connection[i].mxCell._target === _ifInstructions[j]._id) {
                  _ifInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _ifInstructions._id) {
                _ifInstructions = [];
              }
            }
          }
          if (_exitInstructions) {
            if (_.isArray(_exitInstructions)) {
              for (let j = 0; j < _exitInstructions.length; j++) {
                if (connection[i].mxCell._target === _exitInstructions[j]._id) {
                  _exitInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _exitInstructions._id) {
                _exitInstructions = [];
              }
            }
          }
        }

        if (_jobs) {
          if (_.isArray(_jobs) && _jobs.length > 0) {
            startNode = _jobs[0];
          } else {
            startNode = _jobs;
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Job', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_forkInstructions) {
            if (_.isArray(_forkInstructions) && _forkInstructions.length > 0) {
              startNode = _forkInstructions[0];
            } else {
              startNode = _forkInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('ForkJoin', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_retryInstructions) {
            if (_.isArray(_retryInstructions) && _retryInstructions.length > 0) {
              startNode = _retryInstructions[0];
            } else {
              startNode = _retryInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Retry', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_tryInstructions) {
            if (_.isArray(_tryInstructions) && _tryInstructions.length > 0) {
              startNode = _tryInstructions[0];
            } else {
              startNode = _tryInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Try', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_awaitInstructions) {
            if (_.isArray(_awaitInstructions) && _awaitInstructions.length > 0) {
              startNode = _awaitInstructions[0];
            } else {
              startNode = _awaitInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Await', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_ifInstructions) {
            if (_.isArray(_ifInstructions) && _ifInstructions.length > 0) {
              startNode = _ifInstructions[0];
            } else {
              startNode = _ifInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('If', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_exitInstructions) {
            if (_.isArray(_exitInstructions) && _exitInstructions.length > 0) {
              startNode = _exitInstructions[0];
            } else {
              startNode = _exitInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Terminate', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        }

      } else {
        const job = objects.Job;
        const ifIns = objects.If;
        const fork = objects.Fork;
        const retry = objects.Retry;
        const tryIns = objects.Try;
        const awaitIns = objects.Await;
        const exit = objects.Terminate;
        if (job) {
          if (_.isArray(job)) {
            for (let i = 0; i < job.length; i++) {
              jsonObj.instructions.push(this.createObject('Job', job[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Job', job));
          }
        }
        if (ifIns) {
          if (_.isArray(ifIns)) {
            for (let i = 0; i < ifIns.length; i++) {
              jsonObj.instructions.push(this.createObject('If', ifIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('If', ifIns));
          }
        }
        if (fork) {
          if (_.isArray(fork)) {
            for (let i = 0; i < fork.length; i++) {
              jsonObj.instructions.push(this.createObject('ForkJoin', fork[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('ForkJoin', fork));
          }
        }
        if (retry) {
          if (_.isArray(retry)) {
            for (let i = 0; i < retry.length; i++) {
              jsonObj.instructions.push(this.createObject('Retry', retry[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Retry', retry));
          }
        }
        if (tryIns) {
          if (_.isArray(tryIns)) {
            for (let i = 0; i < tryIns.length; i++) {
              jsonObj.instructions.push(this.createObject('Try', tryIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Try', tryIns));
          }
        }
        if (awaitIns) {
          if (_.isArray(awaitIns)) {
            for (let i = 0; i < awaitIns.length; i++) {
              jsonObj.instructions.push(this.createObject('Await', awaitIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Await', awaitIns));
          }
        }
        if (exit) {
          if (_.isArray(exit)) {
            for (let i = 0; i < exit.length; i++) {
              jsonObj.instructions.push(this.createObject('Terminate', exit[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Terminate', exit));
          }
        }
      }
      this.workFlowJson = _.clone(jsonObj);
    }
  }

  private findNextNode(connection, node, objects, instructions: Array<any>, jsonObj) {
    if (!node) {
      return;
    }
    const id = node._id || node;
    if (_.isArray(connection)) {
      for (let i = 0; i < connection.length; i++) {
        if (!connection[i].skip && connection[i].mxCell._source && connection[i].mxCell._source === id) {
          const _id = _.clone(connection[i].mxCell._target);
          let instructionArr = instructions;
          if (connection[i]._type === 'then' || connection[i]._type === 'else') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'If' && instructions[j].id === id) {
                if (connection[i]._type === 'then') {
                  instructions[j].then = {
                    instructions: []
                  };
                  instructionArr = instructions[j].then.instructions;
                } else {
                  instructions[j].else = {
                    instructions: []
                  };
                  instructionArr = instructions[j].else.instructions;
                }
                break;
              }
            }
          } else if (connection[i]._type === 'branch') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'ForkJoin' && instructions[j].id === id) {
                if (!instructions[j].branches) {
                  instructions[j].branches = [];
                }
                instructions[j].branches.push({instructions: []});
                for (let x = 0; x < instructions[j].branches.length; x++) {
                  if (!instructions[j].branches[x].id) {
                    instructions[j].branches[x].id = 'branch ' + (x + 1);
                    instructionArr = instructions[j].branches[x].instructions;
                    break;
                  }
                }
                break;
              }
            }
          } else if (connection[i]._type === 'retry') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'Retry' && instructions[j].id === id) {
                if (!instructions[j].instructions) {
                  instructions[j].instructions = [];
                  instructionArr = instructions[j].instructions;
                }
                break;
              }
            }
          } else if (connection[i]._type === 'try') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'Try' && instructions[j].id === id) {
                if (!instructions[j].instructions) {
                  instructions[j].instructions = [];
                  instructionArr = instructions[j].instructions;
                }
                break;
              }
            }
          } else if (connection[i]._type === 'catch') {
            console.log('catch', instructions);
          }
          connection[i].skip = true;
          if (connection[i]._type === 'join') {
            const joinInstructions = objects.Join;
            let _node: any = {};
            if (joinInstructions) {
              if (_.isArray(joinInstructions)) {
                for (let x = 0; x < joinInstructions.length; x++) {
                  if (joinInstructions[x]._id === _id) {
                    _node = joinInstructions[x];
                    break;
                  }
                }
              } else {
                if (joinInstructions._id === _id) {
                  _node = joinInstructions;
                }
              }
            }
            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endIf') {
            const endIfInstructions = objects.EndIf;
            let _node: any = {};
            if (endIfInstructions) {
              if (_.isArray(endIfInstructions)) {
                for (let x = 0; x < endIfInstructions.length; x++) {
                  if (endIfInstructions[x]._id === _id) {
                    _node = endIfInstructions[x];
                    break;
                  }
                }
              } else {
                if (endIfInstructions._id === _id) {
                  _node = endIfInstructions;
                }
              }
            }

            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'retryEnd') {
            const retryEndInstructions = objects.RetryEnd;
            let _node: any = {};
            if (retryEndInstructions) {
              if (_.isArray(retryEndInstructions)) {
                for (let x = 0; x < retryEndInstructions.length; x++) {
                  if (retryEndInstructions[x]._id === _id) {
                    _node = retryEndInstructions[x];
                    break;
                  }
                }
              } else {
                if (retryEndInstructions._id === _id) {
                  _node = retryEndInstructions;
                }
              }
            }
            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endTry') {
            const endTryInstructions = objects.EndTry;
            let _node: any = {};
            if (endTryInstructions) {
              if (_.isArray(endTryInstructions)) {
                for (let x = 0; x < endTryInstructions.length; x++) {
                  if (endTryInstructions[x]._id === _id) {
                    _node = endTryInstructions[x];
                    break;
                  }
                }
              } else {
                if (endTryInstructions._id === _id) {
                  _node = endTryInstructions;
                }
              }
            }

            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endCatch') {
            const endCatchInstructions = objects.EndCatch;
            let _node: any = {};
            if (endCatchInstructions) {
              if (_.isArray(endCatchInstructions)) {
                for (let x = 0; x < endCatchInstructions.length; x++) {
                  if (endCatchInstructions[x]._id === _id) {
                    _node = endCatchInstructions[x];
                    break;
                  }
                }
              } else {
                if (endCatchInstructions._id === _id) {
                  _node = endCatchInstructions;
                }
              }
            }

            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          }
          this.getNextNode(_id, objects, instructionArr, jsonObj);
        }
      }
    } else {
      if (connection.mxCell._source && connection.mxCell._source === id) {
        const _id = _.clone(connection.mxCell._target);
        connection = null;
        this.getNextNode(_id, objects, instructions, jsonObj);
      }
    }
  }

  private recursiveFindParentCell(id, instructionsArr: Array<any>): Array<any> {
    let arr = [];

    function recursive(_id, _instructionsArr: Array<any>) {
      for (let i = 0; i < _instructionsArr.length; i++) {
        if (_instructionsArr[i].id === _id) {
          arr = _instructionsArr;
          break;
        } else {
          if (_instructionsArr[i].TYPE === 'ForkJoin') {
            if (_instructionsArr[i].branches) {
              for (let j = 0; j < _instructionsArr[i].branches.length; j++) {
                recursive(_id, _instructionsArr[i].branches[j].instructions);
              }
            }
          } else if (_instructionsArr[i].TYPE === 'If') {
            if (_instructionsArr[i].then) {
              recursive(_id, _instructionsArr[i].then.instructions);
            }
            if (_instructionsArr[i].else) {
              recursive(_id, _instructionsArr[i].else.instructions);
            }
          } else if (_instructionsArr[i].TYPE === 'Try') {
            if (_instructionsArr[i].catch) {
              if (_instructionsArr[i].catch.id === _id) {
                arr = _instructionsArr[i].catch.instructions;
                break;
              } else {
                recursive(_id, _instructionsArr[i].catch.instructions);
              }
            }
            if (_instructionsArr[i].instructions && _instructionsArr[i].instructions.length > 0) {
              recursive(_id, _instructionsArr[i].instructions);
            }
          }
        }
      }
    }

    recursive(id, instructionsArr);
    return arr;
  }

  private recursiveFindCatchCell(node, instructionsArr: Array<any>): Array<any> {
    let arr = [];

    function recursive(_node, _instructionsArr: Array<any>) {
      for (let i = 0; i < _instructionsArr.length; i++) {
        if (_instructionsArr[i].id === _node._targetId) {
          if (_instructionsArr[i].TYPE === 'Try') {
            if (!_instructionsArr[i].catch) {
              _instructionsArr[i].catch = {instructions: [], id: _node._id};
              arr = _instructionsArr[i].catch.instructions;
            }
          }
          break;
        } else {
          if (_instructionsArr[i].TYPE === 'ForkJoin') {
            if (_instructionsArr[i].branches) {
              for (let j = 0; j < _instructionsArr[i].branches.length; j++) {
                recursive(_node, _instructionsArr[i].branches[j].instructions);
              }
            }
          } else if (_instructionsArr[i].TYPE === 'If') {
            if (_instructionsArr[i].then) {
              recursive(_node, _instructionsArr[i].then.instructions);
            }
            if (_instructionsArr[i].else) {
              recursive(_node, _instructionsArr[i].else.instructions);
            }
          } else if (_instructionsArr[i].TYPE === 'Try') {
            if (_instructionsArr[i].catch) {
              recursive(_node, _instructionsArr[i].catch.instructions);
            }
          }
        }
      }
    }

    recursive(node, instructionsArr);
    return arr;
  }

  private getNextNode(id, objects, instructionsArr: Array<any>, jsonObj) {
    const jobs = objects.Job;
    const ifInstructions = objects.If;
    const endIfInstructions = objects.EndIf;
    const forkInstructions = objects.Fork;
    const joinInstructions = objects.Join;
    const retryInstructions = objects.Retry;
    const retryEndInstructions = objects.RetryEnd;
    const tryInstructions = objects.Try;
    const catchInstructions = objects.Catch;
    const catchEndInstructions = objects.EndCatch;
    const tryEndInstructions = objects.EndTry;
    const awaitInstructions = objects.Await;
    const connection = objects.Connection;
    const exitInstructions = objects.Terminate;
    let nextNode: any = {};

    if (jobs) {
      if (_.isArray(jobs)) {
        for (let i = 0; i < jobs.length; i++) {
          if (jobs[i]._id === id) {
            nextNode = jobs[i];
            break;
          }
        }
      } else {
        if (jobs._id === id) {
          nextNode = jobs;
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Job', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (forkInstructions) {
        if (_.isArray(forkInstructions)) {
          for (let i = 0; i < forkInstructions.length; i++) {
            if (forkInstructions[i]._id === id) {
              nextNode = forkInstructions[i];
              break;
            }
          }
        } else {
          if (forkInstructions._id === id) {
            nextNode = forkInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('ForkJoin', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (joinInstructions) {
        if (_.isArray(joinInstructions)) {
          for (let i = 0; i < joinInstructions.length; i++) {
            if (joinInstructions[i]._id === id) {
              nextNode = joinInstructions[i];
              break;
            }
          }
        } else {
          if (joinInstructions._id === id) {
            nextNode = joinInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (retryInstructions) {
        if (_.isArray(retryInstructions)) {
          for (let i = 0; i < retryInstructions.length; i++) {
            if (retryInstructions[i]._id === id) {
              nextNode = retryInstructions[i];
              break;
            }
          }
        } else {
          if (retryInstructions._id === id) {
            nextNode = retryInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Retry', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (retryEndInstructions) {
        if (_.isArray(retryEndInstructions)) {
          for (let i = 0; i < retryEndInstructions.length; i++) {
            if (retryEndInstructions[i]._id === id) {
              nextNode = retryEndInstructions[i];
              break;
            }
          }
        } else {
          if (retryEndInstructions._id === id) {
            nextNode = retryEndInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (awaitInstructions) {
        if (_.isArray(awaitInstructions)) {
          for (let i = 0; i < awaitInstructions.length; i++) {
            if (awaitInstructions[i]._id === id) {
              nextNode = awaitInstructions[i];
              break;
            }
          }
        } else {
          if (awaitInstructions._id === id) {
            nextNode = awaitInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Await', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (tryInstructions) {
        if (_.isArray(tryInstructions)) {
          for (let i = 0; i < tryInstructions.length; i++) {
            if (tryInstructions[i]._id === id) {
              nextNode = tryInstructions[i];
              break;
            }
          }
        } else {
          if (tryInstructions._id === id) {
            nextNode = tryInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Try', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (tryEndInstructions) {
        if (_.isArray(tryEndInstructions)) {
          for (let i = 0; i < tryEndInstructions.length; i++) {
            if (tryEndInstructions[i]._id === id) {
              nextNode = tryEndInstructions[i];
              break;
            }
          }
        } else {
          if (tryEndInstructions._id === id) {
            nextNode = tryEndInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (catchInstructions) {
        if (_.isArray(catchInstructions)) {
          for (let i = 0; i < catchInstructions.length; i++) {
            if (catchInstructions[i]._id === id) {
              nextNode = catchInstructions[i];
              break;
            }
          }
        } else {
          if (catchInstructions._id === id) {
            nextNode = catchInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      let arr = this.recursiveFindCatchCell(nextNode, jsonObj.instructions);
      this.findNextNode(connection, nextNode, objects, arr, jsonObj);
      nextNode = null;
    } else {
      if (catchEndInstructions) {
        if (_.isArray(catchEndInstructions)) {
          for (let i = 0; i < catchEndInstructions.length; i++) {
            if (catchEndInstructions[i]._id === id) {
              nextNode = catchEndInstructions[i];
              break;
            }
          }
        } else {
          if (catchEndInstructions._id === id) {
            nextNode = catchEndInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (ifInstructions) {
        if (_.isArray(ifInstructions)) {
          for (let i = 0; i < ifInstructions.length; i++) {
            if (ifInstructions[i]._id === id) {
              nextNode = ifInstructions[i];
              break;
            }
          }
        } else {
          if (ifInstructions._id === id) {
            nextNode = ifInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('If', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (endIfInstructions) {
        if (_.isArray(endIfInstructions)) {
          for (let i = 0; i < endIfInstructions.length; i++) {
            if (endIfInstructions[i]._id === id) {
              nextNode = endIfInstructions[i];
              break;
            }
          }
        } else {
          if (endIfInstructions._id === id) {
            nextNode = endIfInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (exitInstructions) {
        if (_.isArray(exitInstructions)) {
          for (let i = 0; i < exitInstructions.length; i++) {
            if (exitInstructions[i]._id === id) {
              nextNode = exitInstructions[i];
              break;
            }
          }
        } else {
          if (exitInstructions._id === id) {
            nextNode = exitInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Terminate', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      this.findNextNode(connection, id, objects, instructionsArr, jsonObj);
    }
  }

  private initEditorConf(editor, _xml: any) {
    const self = this;
    const graph = editor.graph;
    let dropTarget;
    let isProgrammaticallyDelete = false;
    let isVertexDrop = false;
    let isUndoable = false;
    let isFullyDelete = false;
    let _targetNode: any;
    let _iterateId = 0;

    const doc = mxUtils.createXmlDocument();

    if (!_xml) {

      // Alt disables guides
      mxGraphHandler.prototype.guidesEnabled = true;
      /**
       * Variable: autoSaveDelay
       *
       * Minimum amount of seconds between two consecutive autosaves. Eg. a
       * value of 1 (s) means the graph is not stored more than once per second.
       * Default is 10.
       */
      mxAutoSaveManager.prototype.autoSaveDelay = 2;
      /**
       * Variable: autoSaveThreshold
       *
       * Minimum amount of ignored changes before an autosave. Eg. a value of 2
       * means after 2 change of the graph model the autosave will trigger if the
       * condition below is true. Default is 5.
       */
      mxAutoSaveManager.prototype.autoSaveThreshold = 1;
      mxGraph.prototype.cellsResizable = false;
      mxGraph.prototype.multigraph = false;
      mxGraph.prototype.allowDanglingEdges = false;
      mxGraph.prototype.cellsLocked = true;
      mxGraph.prototype.foldingEnabled = true;
      mxHierarchicalLayout.prototype.interRankCellSpacing = 60;
      mxHierarchicalLayout.prototype.fineTuning = true;
      mxHierarchicalLayout.prototype.disableEdgeStyle = true;
      mxConstants.DROP_TARGET_COLOR = 'green';
      if (this.preferences.theme !== 'light' && this.preferences.theme !== 'lighter') {
        mxConstants.STYLE_FONTCOLOR = 'white';
      }

      // Enables snapping waypoints to terminals
      mxEdgeHandler.prototype.snapToTerminals = true;

      graph.setConnectable(false);
      graph.setEnabled(false);
      graph.setDisconnectOnMove(false);
      graph.collapseToPreferredSize = false;
      graph.constrainChildren = false;
      graph.extendParentsOnAdd = false;
      graph.extendParents = false;

      // Create select actions in page
      let node = document.getElementById('mainActions');
      let buttons = ['undo', 'redo', 'delete'];

      // editor.urlImage = 'http://localhost:4200/export';
      // Only adds image and SVG export if backend is available
      // NOTE: The old image export in mxEditor is not used, the urlImage is used for the new export.
      if (editor.urlImage != null) {
        // Client-side code for image export
        const exportImage = function (_editor) {
          const scale = graph.view.scale;
          let bounds = graph.getGraphBounds();

          // New image export
          const xmlDoc = mxUtils.createXmlDocument();
          let root = xmlDoc.createElement('output');
          xmlDoc.appendChild(root);

          // Renders graph. Offset will be multiplied with state's scale when painting state.
          const xmlCanvas = new mxXmlCanvas2D(root);
          const imgExport = new mxImageExport();
          xmlCanvas.translate(Math.floor(1 / scale - bounds.x), Math.floor(1 / scale - bounds.y));
          xmlCanvas.scale(scale);

          imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);

          // Puts request data together
          let w = Math.ceil(bounds.width * scale + 2);
          let h = Math.ceil(bounds.height * scale + 2);
          const xml = mxUtils.getXml(root);

          // Requests image if request is valid
          if (w > 0 && h > 0) {
            const name = 'export.xml';
            const format = 'png';
            const bg = '&bg=#FFFFFF';
            const blob = new Blob([xml], {type: 'text/xml'});
            saveAs(blob, name);
            /* new mxXmlRequest(_editor.urlImage, 'filename=' + name + '&format=' + format +
               bg + '&w=' + w + '&h=' + h + '&xml=' + encodeURIComponent(xml)).simulate(document, '_blank');*/
          }
        };

        editor.addAction('exportImage', exportImage);
        buttons.push('exportImage');
      }

      for (let i = 0; i < buttons.length; i++) {
        let button = document.createElement('button');
        let dom = document.createElement('i');
        let icon: any;
        if (buttons[i] === 'undo') {
          icon = 'fa fa-undo';
          button.setAttribute('class', 'btn btn-sm btn-grey');
          button.setAttribute('title', 'Undo');
          button.setAttribute('id', 'undoBtn');
        } else if (buttons[i] === 'redo') {
          icon = 'fa fa-repeat';
          button.setAttribute('class', 'btn btn-sm btn-grey m-r-sm');
          button.setAttribute('title', 'Redo');
          button.setAttribute('id', 'redoBtn');
        } else if (buttons[i] === 'delete') {
          icon = 'fa fa-times';
          button.setAttribute('class', 'btn btn-sm btn-grey m-r-sm');
          button.setAttribute('title', 'Delete');
        }

        dom.setAttribute('class', icon);
        button.appendChild(dom);
        mxUtils.write(button, '');
        const factory = function (name) {
          return function () {
            editor.execute(name);
          };
        };

        mxEvent.addListener(button, 'click', factory(buttons[i]));
        node.appendChild(button);
      }

      // Create zoom actions in page
      let zoomNode = document.getElementById('zoomActions');
      const zoomButtons = ['zoomIn', 'zoomOut', 'actualSize', 'fit'];

      for (let i = 0; i < zoomButtons.length; i++) {
        let button = document.createElement('button');
        let dom = document.createElement('i');
        let icon: any;
        if (zoomButtons[i] === 'zoomIn') {
          icon = 'fa fa-search-plus';
          button.setAttribute('class', 'btn btn-sm btn-grey');
          button.setAttribute('title', 'Zoom In');
        } else if (zoomButtons[i] === 'zoomOut') {
          icon = 'fa fa-search-minus';
          button.setAttribute('class', 'btn btn-sm btn-grey m-r-sm');
          button.setAttribute('title', 'Zoom Out');
        } else if (zoomButtons[i] === 'actualSize') {
          icon = 'fa fa-search';
          button.setAttribute('class', 'btn btn-sm btn-grey');
          button.setAttribute('id', 'actual');
          button.setAttribute('title', 'Actual');
        } else if (zoomButtons[i] === 'fit') {
          icon = 'fa  fa-arrows-alt';
          button.setAttribute('class', 'btn btn-sm btn-grey m-r-sm');
          button.setAttribute('title', 'Fit');
        }
        dom.setAttribute('class', icon);
        button.appendChild(dom);
        mxUtils.write(button, '');
        const factory = function (name) {
          return function () {
            editor.execute(name);
          };
        };

        mxEvent.addListener(button, 'click', factory(zoomButtons[i]));
        zoomNode.appendChild(button);
      }

      graph.isCellEditable = function (cell) {
        return !this.getModel().isEdge(cell);
      };


      /**
       * Overrides method to provide a cell label in the display
       * @param cell
       */
      graph.convertValueToString = function (cell) {
        if (mxUtils.isNode(cell.value)) {
          if (cell.value.nodeName.toLowerCase() === 'process') {
            let title = cell.getAttribute('title', '');
            if (title != null && title.length > 0) {
              return title;
            }
            return '';
          } else if (cell.value.nodeName.toLowerCase() === 'job') {
            let path = cell.getAttribute('path', '');
            let title = cell.getAttribute('title', '');
            if (title != null && title.length > 0) {
              return path + ' - ' + title;
            }
            return path;
          } else if (cell.value.nodeName.toLowerCase() === 'retry') {
            let str = 'Repeat ' + cell.getAttribute('repeat', '') + ' times';
            if (cell.getAttribute('delay', '') && cell.getAttribute('delay', '') !== 0) {
              str = str + '\nwith delay ' + cell.getAttribute('delay', '');
            }
            return str;
          } else if (cell.value.nodeName.toLowerCase() === 'if') {
            return cell.getAttribute('predicate', '');
          } else {
            return cell.getAttribute('label', '');
          }
        }
        return '';
      };

      /**
       * To check drop target is valid or not on hover
       *
       */
      mxDragSource.prototype.dragOver = function (_graph, evt) {
        let offset = mxUtils.getOffset(_graph.container);
        let origin = mxUtils.getScrollOrigin(_graph.container);
        let x = mxEvent.getClientX(evt) - offset.x + origin.x - _graph.panDx;
        let y = mxEvent.getClientY(evt) - offset.y + origin.y - _graph.panDy;

        if (_graph.autoScroll && (this.autoscroll == null || this.autoscroll)) {
          _graph.scrollPointToVisible(x, y, _graph.autoExtend);
        }

        // Highlights the drop target under the mouse
        if (this.currentHighlight != null && _graph.isDropEnabled()) {
          this.currentDropTarget = this.getDropTarget(_graph, x, y, evt);
          let state = _graph.getView().getState(this.currentDropTarget);
          this.currentHighlight.highlightColor = 'green';
          if (state && state.cell) {
            if (state.cell.value.tagName === 'Connector') {
              return;
            } else if (state.cell.value.tagName === 'Job' || state.cell.value.tagName === 'Terminate') {
              if (state.cell.edges) {
                for (let i = 0; i < state.cell.edges.length; i++) {
                  if (state.cell.edges[i].target.id !== state.cell.id) {
                    this.currentHighlight.highlightColor = '#ff0000';
                  }
                }
              }
            } else if (state.cell.value.tagName === 'If') {
              if (state.cell.edges && state.cell.edges.length > 2) {
                this.currentHighlight.highlightColor = '#ff0000';
              }
            } else if (state.cell.value.tagName === 'Join' || state.cell.value.tagName === 'EndIf' || state.cell.value.tagName === 'RetryEnd'
              || state.cell.value.tagName === 'EndTry' || state.cell.value.tagName === 'EndCatch') {
              if (state.cell.edges && state.cell.edges.length > 1) {
                for (let i = 0; i < state.cell.edges.length; i++) {
                  if (state.cell.edges[i].target.id !== state.cell.id) {
                    this.currentHighlight.highlightColor = '#ff0000';
                  }
                }
              }
            } else if (state.cell.value.tagName === 'Connection') {
              if ((state.cell.source.value.tagName === 'Fork' && state.cell.target.value.tagName === 'Join') ||
                (state.cell.source.value.tagName === 'If' && state.cell.target.value.tagName === 'EndIf') ||
                (state.cell.source.value.tagName === 'Retry' && state.cell.target.value.tagName === 'RetryEnd') ||
                (state.cell.source.value.tagName === 'Try' && state.cell.target.value.tagName === 'Catch') ||
                (state.cell.source.value.tagName === 'Catch' && state.cell.target.value.tagName === 'EndCatch') ||
                (state.cell.source.value.tagName === 'EndCatch' && state.cell.target.value.tagName === 'EndTry')) {
                return;
              }
            } else if (state.cell.value.tagName === 'Retry') {
              if (state.cell.edges && state.cell.edges.length > 1) {
                for (let i = 0; i < state.cell.edges.length; i++) {
                  if (state.cell.edges[i].target.id !== state.cell.id) {
                    if (state.cell.edges[i].target.value.tagName !== 'RetryEnd') {
                      this.currentHighlight.highlightColor = '#ff0000';
                    }
                  }
                }
              }
            } else if (state.cell.value.tagName === 'Try') {
              if (state.cell.edges && state.cell.edges.length > 1) {
                for (let i = 0; i < state.cell.edges.length; i++) {
                  if (state.cell.edges[i].target.id !== state.cell.id) {
                    if (state.cell.edges[i].target.value.tagName !== 'Catch') {
                      this.currentHighlight.highlightColor = '#ff0000';
                    }
                  }
                }
              }
            } else if (state.cell.value.tagName === 'Catch') {
              let flag1 = false;
              if (state.cell.edges && state.cell.edges.length) {
                for (let i = 0; i < state.cell.edges.length; i++) {
                  if (state.cell.edges[i].source.value.tagName === 'Catch' && state.cell.edges[i].target.value.tagName === 'EndCatch') {
                    flag1 = true;
                  }
                }
              }
              if (!flag1) {
                this.currentHighlight.highlightColor = '#ff0000';
              }
            } else if (state.cell.value.tagName === 'Process') {
              if (state.cell.value.attributes && state.cell.value.attributes.length > 0) {
                if (state.cell.value.attributes[0].value === 'Start' || state.cell.value.attributes[0].value === 'End') {
                  return;
                }
              }
              if (state.cell.edges && state.cell.edges.length === 1) {
                if (state.cell.edges[0].value.tagName === 'Connector') {
                  return;
                }
              }
            }
          }
          this.currentHighlight.highlight(state);
        }

        // Updates the location of the preview
        if (this.previewElement != null) {
          if (this.previewElement.parentNode == null) {
            _graph.container.appendChild(this.previewElement);
            this.previewElement.style.zIndex = '3';
            this.previewElement.style.position = 'absolute';
          }

          let gridEnabled = this.isGridEnabled() && _graph.isGridEnabledEvent(evt);
          let hideGuide = true;

          // Grid and guides
          if (this.currentGuide != null && this.currentGuide.isEnabledForEvent(evt)) {
            // LATER: HTML preview appears smaller than SVG preview
            let w = parseInt(this.previewElement.style.width, 10);
            let h = parseInt(this.previewElement.style.height, 10);
            let bounds = new mxRectangle(0, 0, w, h);
            let delta = new mxPoint(x, y);
            delta = this.currentGuide.move(bounds, delta, gridEnabled);
            hideGuide = false;
            x = delta.x;
            y = delta.y;
          } else if (gridEnabled) {
            let scale = _graph.view.scale;
            let tr = _graph.view.translate;
            let off = _graph.gridSize / 2;
            x = (_graph.snap(x / scale - tr.x - off) + tr.x) * scale;
            y = (_graph.snap(y / scale - tr.y - off) + tr.y) * scale;
          }

          if (this.currentGuide != null && hideGuide) {
            this.currentGuide.hide();
          }

          if (this.previewOffset != null) {
            x += this.previewOffset.x;
            y += this.previewOffset.y;
          }

          this.previewElement.style.left = Math.round(x) + 'px';
          this.previewElement.style.top = Math.round(y) + 'px';
          this.previewElement.style.visibility = 'visible';
        }
        this.currentPoint = new mxPoint(x, y);
      };

      /**
       * Check the drop target on drop event
       * @param _graph
       * @param evt
       * @param drpTargt
       * @param x
       * @param y
       */
      mxDragSource.prototype.drop = function (_graph, evt, drpTargt, x, y) {
        dropTarget = null;
        let flag = false;
        if (drpTargt) {
          if (drpTargt.value.tagName !== 'Connection') {
            let title = '';
            self.translate.get('label.invalidTarget').subscribe(translatedValue => {
              title = translatedValue;
            });
            if (drpTargt.value.tagName === 'Job' || drpTargt.value.tagName === 'Terminate') {
              for (let i = 0; i < drpTargt.edges.length; i++) {
                if (drpTargt.edges[i].target.id !== drpTargt.id) {
                  self.toasterService.pop('error', title + '!!', drpTargt.value.tagName + ' instruction can have only one out going and one incoming Edges');
                  return;
                }
              }
            } else if (drpTargt.value.tagName === 'If') {
              if (drpTargt.edges.length > 2) {
                self.toasterService.pop('error', title + '!!', 'Cannot have more than one condition');
                return;
              }
            } else if (drpTargt.value.tagName === 'Join' || drpTargt.value.tagName === 'EndIf' || drpTargt.value.tagName === 'RetryEnd' ||
              drpTargt.value.tagName === 'EndCatch' || drpTargt.value.tagName === 'EndTry') {
              if (drpTargt.edges.length > 1) {
                for (let i = 0; i < drpTargt.edges.length; i++) {
                  if (drpTargt.edges[i].target.id !== drpTargt.id) {
                    self.toasterService.pop('error', title + '!!', 'Cannot have more than one out going Edge');
                    return;
                  }
                }
              }
            } else if (drpTargt.value.tagName === 'Retry') {
              let flag1 = false;
              if (drpTargt.edges && drpTargt.edges.length) {
                for (let i = 0; i < drpTargt.edges.length; i++) {
                  if (drpTargt.edges[i].source.value.tagName === 'Retry' && drpTargt.edges[i].target.value.tagName === 'RetryEnd') {
                    flag1 = true;
                  }
                }
              }
              if (!flag1) {
                self.toasterService.pop('error', title + '!!', 'Cannot have more than one out going Edge');
                return;
              }
            } else if (drpTargt.value.tagName === 'Try') {
              let flag1 = false;
              if (drpTargt.edges && drpTargt.edges.length) {
                for (let i = 0; i < drpTargt.edges.length; i++) {
                  if (drpTargt.edges[i].source.value.tagName === 'Try' && drpTargt.edges[i].target.value.tagName === 'Catch') {
                    flag1 = true;
                  }
                }
              }
              if (!flag1) {
                self.toasterService.pop('error', title + '!!', 'Cannot have more than one out going Edge');
                return;
              }
            } else if (drpTargt.value.tagName === 'Catch') {
              let flag1 = false;
              if (drpTargt.edges && drpTargt.edges.length) {
                for (let i = 0; i < drpTargt.edges.length; i++) {
                  if (drpTargt.edges[i].source.value.tagName === 'Catch' && drpTargt.edges[i].target.value.tagName === 'EndCatch') {
                    flag1 = true;
                  }
                }
              }
              if (!flag1) {
                self.toasterService.pop('error', title + '!!', 'Cannot have more than one out going Edge');
                return;
              }
            } else if (drpTargt.value.tagName === 'Process') {
              if (drpTargt.value.attributes && drpTargt.value.attributes.length > 0) {
                if (drpTargt.value.attributes[0].value === 'Start' || drpTargt.value.attributes[0].value === 'End') {
                  return;
                }
              }
              if (drpTargt.edges && drpTargt.edges.length === 1) {
                if (drpTargt.edges[0].value.tagName === 'Connector') {
                  return;
                }
              }
            }
            dropTarget = drpTargt;
          } else {
            if (drpTargt.value.tagName === 'Connection') {
              if ((drpTargt.source.value.tagName === 'Fork' && drpTargt.target.value.tagName === 'Join') ||
                (drpTargt.source.value.tagName === 'If' && drpTargt.target.value.tagName === 'EndIf') ||
                (drpTargt.source.value.tagName === 'Retry' && drpTargt.target.value.tagName === 'RetryEnd') ||
                (drpTargt.source.value.tagName === 'Try' && drpTargt.target.value.tagName === 'Catch') ||
                (drpTargt.source.value.tagName === 'Catch' && drpTargt.target.value.tagName === 'EndCatch') ||
                (drpTargt.source.value.tagName === 'EndCatch' && drpTargt.target.value.tagName === 'EndTry')) {
                return;
              }
            }
            flag = true;
          }
        } else {
          return;
        }
        this.dropHandler(_graph, evt, drpTargt, x, y);
        if (_graph.container.style.visibility !== 'hidden') {
          _graph.container.focus();
        }
        if (flag) {
          executeLayout();
        }
      };

      /**
       * Recursively remove all the target vertex if edges is removed
       */
      graph.addListener(mxEvent.REMOVE_CELLS, function (sender, evt) {
        const cells = evt.getProperty('cells');
        if (!isFullyDelete) {
          isFullyDelete = true;
          recursiveEdgeDelete(cells);
        }
      });

      /**
       * Removes the vertex which are added on click event
       */
      editor.addListener(mxEvent.ADD_VERTEX, function (sender, evt) {
        if (isVertexDrop) {
          isVertexDrop = false;
        } else {
          graph.getModel().remove(evt.getProperty('vertex'));
        }
      });

      /**
       * Function: foldCells to collapse/expand
       *
       *
       * collapsed - Boolean indicating the collapsed state to be assigned.
       * recurse - Optional boolean indicating if the collapsed state of all
       * descendants should be set. Default is true.
       * cells - Array of <mxCells> whose collapsed state should be set. If
       * null is specified then the foldable selection cells are used.
       * checkFoldable - Optional boolean indicating of isCellFoldable should be
       * checked. Default is false.
       * evt - Optional native event that triggered the invocation.
       */
      mxGraph.prototype.foldCells = function (collapse, recurse, cells, checkFoldable, evt) {
        recurse = (recurse != null) ? recurse : true;

        if (cells == null) {
          cells = this.getFoldableCells(this.getSelectionCells(), collapse);
        }
        this.stopEditing(false);
        this.model.beginUpdate();
        try {
          this.cellsFolded(cells, collapse, recurse, checkFoldable);
          this.fireEvent(new mxEventObject(mxEvent.FOLD_CELLS,
            'collapse', collapse, 'recurse', recurse, 'cells', cells));
        } finally {
          this.model.endUpdate();
        }
        const layout = new mxHierarchicalLayout(graph);
        layout.execute(graph.getDefaultParent());
        return cells;
      };

      /**
       *
       * Function: undoableEditHappened
       *
       * Method to be called to add new undoable edits to the <history>.
       */
      mxUndoManager.prototype.undoableEditHappened = function (undoableEdit) {
        if (self.isWorkflowReload) {
          this.indexOfNextAdd = 0;
          this.history = [];
          self.isWorkflowReload = false;
        }

        if (isUndoable) {
          if (this.history.length === 10) {
            this.history.shift();
          }
          const _enc = new mxCodec();
          const _nodeModel = _enc.encode(graph.getModel());
          const xml = mxUtils.getXml(_nodeModel);
          this.history.push(xml);
          this.indexOfNextAdd = this.history.length;
          isUndoable = false;
          if (this.indexOfNextAdd < this.history.length) {
            $('#redoBtn').prop('disabled', false);
          }
          if (this.indexOfNextAdd > 0) {
            $('#undoBtn').prop('disabled', false);
          }
        }
      };

      /**
       * Function: undo
       *
       * Undoes the last change.
       */
      mxUndoManager.prototype.undo = function () {
        if (this.indexOfNextAdd > 0) {
          
          const xml = this.history[--this.indexOfNextAdd];

          graph.getModel().beginUpdate();
          try {
            isProgrammaticallyDelete = true;
            // Removes all cells
            graph.removeCells(graph.getChildCells(graph.getDefaultParent(), true, true));
            isProgrammaticallyDelete = false;
            const _doc = mxUtils.parseXml(xml);
            const dec = new mxCodec(_doc);
            const model = dec.decode(_doc.documentElement);
            // Merges the response model with the client model
            graph.getModel().mergeChildren(model.getRoot().getChildAt(0), graph.getDefaultParent(), false);
          } finally {
            // Updates the display
            graph.getModel().endUpdate();
          }

          if (this.indexOfNextAdd < this.history.length) {
            $('#redoBtn').prop('disabled', false);
          }
        } else {
          $('#undoBtn').prop('disabled', true);
        }
      };

      /**
       * Function: redo
       *
       * Redoes the last change.
       */
      mxUndoManager.prototype.redo = function () {
        const n = this.history.length;
        if (this.indexOfNextAdd < n) {
          const xml = this.history[this.indexOfNextAdd++];
          graph.getModel().beginUpdate();
          try {
            const _doc = mxUtils.parseXml(xml);
            const dec = new mxCodec(_doc);
            const model = dec.decode(_doc.documentElement);
            isProgrammaticallyDelete = true;
            // Removes all cells
            graph.removeCells(graph.getChildCells(graph.getDefaultParent(), true, true));
            isProgrammaticallyDelete = false;
            graph.getModel().mergeChildren(model.getRoot().getChildAt(0), graph.getDefaultParent(), false);
          } finally {
            graph.getModel().endUpdate();
          }

          if (this.indexOfNextAdd > 0) {
            $('#undoBtn').prop('disabled', false);
          }
        } else {
          $('#redoBtn').prop('disabled', true);
        }
      };

      /**
       * Function: getEdges
       *
       * Returns the connected edges for the given cell.
       *
       * Parameters:
       *
       * cell - <mxCell> whose edges should be returned.
       */
      mxHierarchicalLayout.prototype.getEdges = function (cell) {
        let cachedEdges = this.edgesCache.get(cell);

        if (cachedEdges != null) {
          return cachedEdges;
        }
        let model = this.graph.model;
        let edges = [];
        let isCollapsed = this.graph.isCellCollapsed(cell);

        let childCount = model.getChildCount(cell);
        for (let i = 0; i < childCount; i++) {
          let child = model.getChildAt(cell, i);
          if (this.isPort(child)) {
            edges = edges.concat(model.getEdges(child, true, true));
          } else if (isCollapsed || !this.graph.isCellVisible(child)) {
            edges = edges.concat(model.getEdges(child, true, true));
          }
        }
        edges = edges.concat(model.getEdges(cell, true, true));
        let result = [];

        for (let i = 0; i < edges.length; i++) {
          let source = this.getVisibleTerminal(edges[i], true);
          let target = this.getVisibleTerminal(edges[i], false);
          if ((source === target) ||
            ((source !== target) &&
              ((target === cell && (this.parent == null || this.isAncestor(this.parent, source, this.traverseAncestors))) ||
                (source === cell && (this.parent == null || this.isAncestor(this.parent, target, this.traverseAncestors)))))) {
            result.push(edges[i]);
          }
        }
        this.edgesCache.put(cell, result);
        return result;
      };

      /**
       * Event to check if connector is valid or not on drop of new instruction
       * @param cell
       * @param cells
       * @param evt
       */
      graph.isValidDropTarget = function (cell, cells, evt) {
        isVertexDrop = true;
        if (cell) {
          if (cells && cells.length > 0) {
            if (cells[0].value.tagName === 'Fork' || cells[0].value.tagName === 'If' ||
              cells[0].value.tagName === 'Retry' || cells[0].value.tagName === 'Try') {
              cells[0].collapsed = true;
            }
          }
          if (cell.value && cell.value.tagName === 'Connection') {
            graph.clearSelection();
            if (cells && cells.length > 0) {
              if (cell.source) {
                if (cell.source.getParent().id !== '1') {
                  cell.setParent(cell.source.getParent());
                }
              }
              if (cells[0].value.tagName === 'Fork' || cells[0].value.tagName === 'If' || cells[0].value.tagName === 'Retry' || cells[0].value.tagName === 'Try') {
                const parent = cell.getParent() || graph.getDefaultParent();
                let v1, label = '', type = '', v2, v3;
                const attr = cell.value.attributes;
                if (attr) {
                  for (let i = 0; i < attr.length; i++) {
                    if (attr[i].value && attr[i].name) {
                      label = attr[i].value;
                      type = attr[i].value === 'true' ? 'then' : attr[i].value === 'false' ? 'else' : attr[i].value;
                      break;
                    }
                  }
                }
                if (cells[0].value.tagName === 'Fork') {
                  v1 = graph.insertVertex(parent, null, getCellNode('Join', 'Join', null), 0, 0, 70, 70, 'symbol;image=./assets/mxgraph/images/symbols/merge.png');
                } else if (cells[0].value.tagName === 'If') {
                  v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'If-End', null), 0, 0, 150, 70, 'rhombus');
                } else if (cells[0].value.tagName === 'Retry') {
                  v1 = graph.insertVertex(parent, null, getCellNode('RetryEnd', 'Retry-End', null), 0, 0, 150, 70, 'rhombus');
                } else {
                  v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'Try-End', null), 0, 0, 90, 70, 'rhombus');
                  v2 = graph.insertVertex(cells[0], null, getCellNode('Catch', 'Catch', null), 0, 0, 90, 40, 'dashRectangle');
                  v3 = graph.insertVertex(cells[0], null, getCellNode('EndCatch', 'Catch-End', null), 0, 0, 90, 40, 'dashRectangle');
                  graph.insertEdge(parent, null, getConnectionNode('try', 'try'), cells[0], v2);
                  graph.insertEdge(cells[0], null, getConnectionNode('', ''), v2, v3, 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;jettySize=auto;orthogonalLoop=1;dashed=1;shadow=0;opacity=50;');
                  graph.insertEdge(parent, null, getConnectionNode('endTry', 'endTry'), v3, v1);
                }
                graph.insertEdge(parent, null, getConnectionNode(label, type), cell.source, cells[0]);
                if (cells[0].value.tagName !== 'Try') {
                  graph.insertEdge(parent, null, getConnectionNode('', ''), cells[0], v1);
                }
                graph.insertEdge(parent, null, getConnectionNode('', ''), v1, cell.target);
                isProgrammaticallyDelete = true;
                for (let x = 0; x < cell.source.edges.length; x++) {
                  if (cell.source.edges[x].id === cell.id) {
                   // cell.source.removeEdge(cell.source.edges[x], true); // Sometime remove sometimes not need testing...
                    graph.getModel().remove(cell.source.edges[x]);
                    break;
                  }
                }
                isProgrammaticallyDelete = false;

                setTimeout(() => {
                  graph.getModel().beginUpdate();
                  try {
                    const targetId = new mxCellAttributeChange(
                      v1, 'targetId',
                      cells[0].id);
                    graph.getModel().execute(targetId);
                    if (v2 && v3) {
                      const targetId2 = new mxCellAttributeChange(
                        v2, 'targetId', cells[0].id);
                      graph.getModel().execute(targetId2);
                      const targetId3 = new mxCellAttributeChange(
                        v3, 'targetId', v2.id);
                      graph.getModel().execute(targetId3);
                    }


                  } finally {
                    graph.getModel().endUpdate();
                  }
                  checkConnectionLabel(cells[0], cell, false);
                }, 0);
                return false;
              }
            }
            if ((cell.source.value.tagName === 'Fork' && cell.target.value.tagName === 'Join') ||
              (cell.source.value.tagName === 'If' && cell.target.value.tagName === 'EndIf') ||
              (cell.source.value.tagName === 'Retry' && cell.target.value.tagName === 'RetryEnd') ||
              (cell.source.value.tagName === 'Try' && cell.target.value.tagName === 'EndTry')) {
              isProgrammaticallyDelete = true;
              graph.removeCells(cells);
              isProgrammaticallyDelete = false;
              evt.preventDefault();
              evt.stopPropagation();
              return false;
            }
            graph.setSelectionCells(cells);
            setTimeout(() => {
              checkConnectionLabel(cells[0], cell, true);
            }, 0);
          } else {
            if (cell.value && cell.value.tagName === 'Connector') {
              isProgrammaticallyDelete = true;
              graph.removeCells(cells);
              isProgrammaticallyDelete = false;
              evt.preventDefault();
              evt.stopPropagation();
              return false;
            }
          }
        }
        if (this.isCellCollapsed(cell)) {
          return true;
        }
        return mxGraph.prototype.isValidDropTarget.apply(this, arguments);
      };

      /**
       * Implements a properties panel that uses
       * mxCellAttributeChange to change properties
       */
      graph.getSelectionModel().addListener(mxEvent.CHANGE, function () {
        let cell = graph.getSelectionCell();
        if (cell && (cell.value.tagName === 'EndIf' || cell.value.tagName === 'Join' || cell.value.tagName === 'RetryEnd'
          || cell.value.tagName === 'EndTry' || cell.value.tagName === 'EndCatch' || cell.value.tagName === 'Connection' || cell.value.tagName === 'Process')) {
          graph.clearSelection();
          return;
        }

        let label = '', type = '';
        if (cell && dropTarget) {
          if (dropTarget.value.tagName === 'If') {
            let flag = false;
            label = 'true';
            type = 'then';
            for (let i = 0; i < dropTarget.edges.length; i++) {
              if (dropTarget.edges[i].target.id !== dropTarget.id && dropTarget.edges[i].target.value.tagName !== 'EndIf') {
                label = 'false';
                type = 'else';
              } else {
                if (dropTarget.edges[i].target && dropTarget.edges[i].target.edges) {
                  for (let j = 0; j < dropTarget.edges[i].target.edges.length; j++) {
                    if (dropTarget.edges[i].target.edges[j].edge && dropTarget.edges[i].target.edges[j].value.attributes
                      && dropTarget.edges[i].target.edges[j].value.attributes.length > 0 && (dropTarget.edges[i].target.edges[j].value.attributes[0]
                        && dropTarget.edges[i].target.edges[j].value.attributes[0].value == 'false')) {
                      flag = true;
                    }
                  }
                }
              }
            }
            if (flag) {
              label = 'true';
              type = 'then';
            }
          } else if (dropTarget.value.tagName === 'Retry') {
            label = 'retry';
            type = 'retry';
          } else if (dropTarget.value.tagName === 'Try') {
            label = 'try';
            type = 'try';
          } else if (dropTarget.value.tagName === 'Catch') {
            label = 'catch';
            type = 'catch';
          } else if (dropTarget.value.tagName === 'Fork') {
            label = 'branch';
            type = 'branch';
          }

          let parent = cell.getParent() || graph.getDefaultParent();
          if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
            let v1, v2, v3, _label;
            if (cell.value.tagName === 'Fork') {
              v1 = graph.insertVertex(parent, null, getCellNode('Join', 'Join', cell.id), 0, 0, 70, 70, 'symbol;image=./assets/mxgraph/images/symbols/merge.png');
              graph.insertEdge(parent, null, getConnectionNode('', ''), cell, v1);
              if (dropTarget.value.tagName === 'If' || dropTarget.value.tagName === 'Retry' || dropTarget.value.tagName === 'Try' || dropTarget.value.tagName === 'Catch'
                || dropTarget.value.tagName === 'Fork') {
                _label = dropTarget.value.tagName === 'Retry' ? 'retryEnd' : dropTarget.value.tagName === 'If' ? 'endIf' : dropTarget.value.tagName === 'Catch' ? 'endCatch' : dropTarget.value.tagName === 'Fork' ? 'join' : 'try';
              }
            } else if (cell.value.tagName === 'If') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'If-End', cell.id), 0, 0, 150, 70, 'rhombus');
              graph.insertEdge(parent, null, getConnectionNode('', ''), cell, v1);
              if (dropTarget.value.tagName === 'Fork' || dropTarget.value.tagName === 'Retry' || dropTarget.value.tagName === 'Try' || dropTarget.value.tagName === 'Catch' || dropTarget.value.tagName === 'If') {
                _label = dropTarget.value.tagName === 'Fork' ? 'join' : dropTarget.value.tagName === 'Retry' ? 'retryEnd' : dropTarget.value.tagName === 'Catch' ? 'endCatch' : dropTarget.value.tagName === 'endIf' ? 'join' : 'try';
              }
            } else if (cell.value.tagName === 'Retry') {
              v1 = graph.insertVertex(parent, null, getCellNode('RetryEnd', 'Retry-End', cell.id), 0, 0, 150, 70, 'rhombus');
              graph.insertEdge(parent, null, getConnectionNode('', ''), cell, v1);
              if (dropTarget.value.tagName === 'Fork' || dropTarget.value.tagName === 'If' || dropTarget.value.tagName === 'Try' || dropTarget.value.tagName === 'Catch' || dropTarget.value.tagName === 'Retry') {
                _label = dropTarget.value.tagName === 'Fork' ? 'join' : dropTarget.value.tagName === 'If' ? 'endIf' : dropTarget.value.tagName === 'Catch' ? 'endCatch' : dropTarget.value.tagName === 'Retry' ? 'retryEnd' : 'try';
              }
            } else if (cell.value.tagName === 'Try') {
              v2 = graph.insertVertex(cell, null, getCellNode('Catch', 'Catch', cell.id), 0, 0, 90, 40, 'dashRectangle');
              v3 = graph.insertVertex(cell, null, getCellNode('EndCatch', 'Catch-End', null), 0, 0, 90, 40, 'dashRectangle');
              v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'Try-End', cell.id), 0, 0, 90, 70, 'rhombus');

              graph.insertEdge(parent, null, getConnectionNode('try', 'try'), cell, v2);
              graph.insertEdge(cell, null, getConnectionNode('', ''), v2, v3, 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;jettySize=auto;orthogonalLoop=1;dashed=1;shadow=0;opacity=50;');
              graph.insertEdge(parent, null, getConnectionNode('', ''), cell, v1);
              graph.insertEdge(parent, null, getConnectionNode('endTry', 'endTry'), v3, v1);
              if (dropTarget.value.tagName === 'Fork' || dropTarget.value.tagName === 'If' || dropTarget.value.tagName === 'Retry' || dropTarget.value.tagName === 'Catch' || dropTarget.value.tagName === 'Try') {
                _label = dropTarget.value.tagName === 'Fork' ? 'join' : dropTarget.value.tagName === 'If' ? 'endIf' : dropTarget.value.tagName === 'Catch' ? 'endCatch' : dropTarget.value.tagName === 'Try' ? 'try' : 'retryEnd';
              }
            }

            if (v1) {
              setTimeout(() => {
                if (v2 && v3) {
                  graph.getModel().beginUpdate();
                  try {
                    const targetId = new mxCellAttributeChange(
                      v3, 'targetId', v2.id);
                    graph.getModel().execute(targetId);
                  } finally {
                    graph.getModel().endUpdate();
                  }
                }
                if (_label) {
                  for (let i = 0; i < v1.edges.length; i++) {
                    if (v1.edges[i].target.id !== v1.id) {
                      changeLabelOfConnection(v1.edges[i], _label);
                      break;
                    }
                  }
                }
              }, 0);
            }
          }

          if (dropTarget.value.tagName === 'Process') {
            parent = graph.getDefaultParent();
            let flag = false;
            for (let i = 0; i < dropTarget.edges.length; i++) {
              if (dropTarget.edges[i].source.id !== dropTarget.id) {
                if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
                  for (let j = 0; j < cell.edges.length; j++) {
                    if (cell.edges[j].target.id !== cell.id) {
                      if (cell.edges[j].target.value.tagName === 'Join' || cell.edges[j].target.value.tagName === 'EndIf'
                        || cell.edges[j].target.value.tagName === 'RetryEnd' || cell.edges[j].target.value.tagName === 'EndTry') {
                        if (flag) {
                          graph.insertEdge(parent, null, getConnectionNode(label, type), cell.edges[j].target, dropTarget.edges[i].target);
                        } else {
                          graph.insertEdge(parent, null, getConnectionNode(label, type), dropTarget.edges[i].source, cell.edges[j].source);
                        }
                        flag = true;
                        break;
                      }
                    }
                  }
                } else {
                  graph.insertEdge(parent, null, getConnectionNode(label, type), dropTarget.edges[i].source, cell);
                }
              } else {
                if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
                  for (let j = 0; j < cell.edges.length; j++) {
                    if (cell.edges[j].target.id !== cell.id) {
                      if (cell.edges[j].target.value.tagName === 'Join' || cell.edges[j].target.value.tagName === 'EndIf'
                        || cell.edges[j].target.value.tagName === 'RetryEnd' || cell.edges[j].target.value.tagName === 'EndTry') {
                        graph.insertEdge(parent, null, getConnectionNode(label, type), cell.edges[j].target, dropTarget.edges[i].target);
                        break;
                      }
                    }
                  }
                } else {
                  graph.insertEdge(parent, null, getConnectionNode(label, type), cell, dropTarget.edges[i].target);
                }
              }
            }

            isProgrammaticallyDelete = true;
            graph.getModel().remove(dropTarget);
            isProgrammaticallyDelete = false;
          } else {
            let checkLabel = '';
            if (dropTarget.value.tagName === 'Fork') {
              label = 'branch';
              type = 'branch';
              checkLabel = 'Join';
            } else if (dropTarget.value.tagName === 'If') {
              checkLabel = 'EndIf';
            } else if (dropTarget.value.tagName === 'Retry') {
              checkLabel = 'RetryEnd';
            } else if (dropTarget.value.tagName === 'Try') {
              label = 'try';
              type = 'try';
              checkLabel = 'EndTry';
            } else if (dropTarget.value.tagName === 'Catch') {
              checkLabel = 'EndCatch';
              graph.getModel().setStyle(dropTarget, 'rectangle');
            }
            if (cell.value.tagName === 'If' || cell.value.tagName === 'Fork' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
              let target1, target2;
              if (!self.nodeMap.has(dropTarget.id)) {
                for (let i = 0; i < dropTarget.edges.length; i++) {
                  if (dropTarget.edges[i].target.id !== dropTarget.id) {
                    if (dropTarget.edges[i].target.value.tagName === checkLabel || dropTarget.edges[i].target.value.tagName === 'Catch') {
                      self.nodeMap.set(dropTarget.id, dropTarget.edges[i].target.id);
                      target1 = dropTarget.edges[i];
                    }
                    break;
                  }
                }
              }

              if (!self.nodeMap.has(cell.id)) {
                for (let i = 0; i < cell.edges.length; i++) {
                  if (cell.edges[i].target.id !== cell.id) {
                    if (cell.edges[i].target.value.tagName === 'Join' || cell.edges[i].target.value.tagName === 'EndIf'
                      || cell.edges[i].target.value.tagName === 'RetryEnd' || cell.edges[i].target.value.tagName === 'EndTry') {
                      self.nodeMap.set(cell.id, cell.edges[i].target.id);
                      target2 = cell.edges[i].target;
                      break;
                    }
                  }
                }
              }

              if (target1 && target2) {
                graph.insertEdge(parent, null, getConnectionNode(label, type), target2, target1.target);
                isProgrammaticallyDelete = true;
                graph.getModel().remove(target1);
                isProgrammaticallyDelete = false;
              } else if (self.nodeMap.has(dropTarget.id)) {
                const target = graph.getModel().getCell(self.nodeMap.get(dropTarget.id));
                graph.insertEdge(parent, null, getConnectionNode(label, type), target2, target);
              }
            } else {
              let flag = false;
              for (let i = 0; i < dropTarget.edges.length; i++) {
                if (dropTarget.edges[i].target.id !== dropTarget.id) {
                  if (dropTarget.edges[i].target.value.tagName === checkLabel || dropTarget.edges[i].target.value.tagName === 'Catch') {
                    flag = true;
                    if (!self.nodeMap.has(dropTarget.id)) {
                      self.nodeMap.set(dropTarget.id, dropTarget.edges[i].target.id);
                    }
                    if (dropTarget.edges[i].target.value.tagName === 'EndCatch') {
                      graph.getModel().setStyle(dropTarget.edges[i].target, 'rectangle');
                    }

                    const attr = dropTarget.edges[i].value.attributes;
                    if (attr) {
                      for (let x = 0; x < attr.length; x++) {
                        if (attr[x].value && attr[x].name) {
                          label = attr[x].value;
                          type = attr[i].value === 'true' ? 'then' : attr[i].value === 'false' ? 'else' : attr[i].value;
                          break;
                        }
                      }
                    }

                    if(cell && dropTarget.edges[i].target) {
                      graph.insertEdge(parent, null, getConnectionNode(label, type), cell, dropTarget.edges[i].target);
                    }
                    isProgrammaticallyDelete = true;
                    graph.getModel().remove(dropTarget.edges[i]);
                    isProgrammaticallyDelete = false;
                  }
                  break;
                }
              }
              if (!flag && self.nodeMap.has(dropTarget.id)) {
                const target = graph.getModel().getCell(self.nodeMap.get(dropTarget.id));
                if (cell && target) {
                  graph.insertEdge(parent, null, getConnectionNode(label, type), cell, target);
                }
              }
            }

            if (cell.edges) {
              for (let i = 0; i < cell.edges.length; i++) {
                if (cell.edges[i].target.value.tagName === checkLabel) {
                  const _label = checkLabel === 'Join' ? 'join' : checkLabel === 'EndIf' ? 'endIf' : checkLabel === 'RetryEnd' ? 'retryEnd' : checkLabel === 'EndCatch' ? 'endCatch' : 'endTry';
                  if (cell.value.tagName !== 'Fork' && cell.value.tagName !== 'If' && cell.value.tagName !== 'Try' && cell.value.tagName !== 'Retry') {
                    cell.edges[i].value.attributes[0].nodeValue = _label;
                    cell.edges[i].value.attributes[1].nodeValue = _label;
                  }
                }
              }
            }

            if (cell && dropTarget) {
              graph.insertEdge(parent, null, getConnectionNode(label, type), dropTarget, cell);
            }
          }
          if (cell.value.tagName === 'Try') {
            for (let j = 0; j < cell.edges.length; j++) {
              if (cell.edges[j].target.id !== cell.id) {
                if (cell.edges[j].source.value.tagName === 'Try' && cell.edges[j].target.value.tagName === 'EndTry') {
                  isProgrammaticallyDelete = true;
                  graph.getModel().remove(cell.edges[j]);
                  isProgrammaticallyDelete = false;
                  break;
                }
              }
            }
          }
          dropTarget = null;
          executeLayout();
        }
        selectionChanged(graph);
      });

      initGraph(this.dummyXml);
      const mgr = new mxAutoSaveManager(graph);

      selectionChanged(graph);

      executeLayout();
      makeCenter();

      mgr.save = function () {
        if (!self.isWorkflowReload) {
          setTimeout(() => {
            self.xmlToJsonParser();
            if (self.workFlowJson && self.workFlowJson.instructions && self.workFlowJson.instructions.length > 0) {
              graph.setEnabled(true);
            } else {
              reloadDummyXml(self.dummyXml);
            }
          }, 0);
        }
      };
    } else {
      self.isWorkflowReload = true;
      reloadDummyXml(_xml);
    }

    /**
     * Reload dummy xml
     */
    function reloadDummyXml(xml) {
      graph.getModel().beginUpdate();
      try {
        // Removes all cells
        graph.removeCells(graph.getChildCells(graph.getDefaultParent(), true, true));
        const _doc = mxUtils.parseXml(xml);
        const dec = new mxCodec(_doc);
        const model = dec.decode(_doc.documentElement);
        // Merges the response model with the client model
        graph.getModel().mergeChildren(model.getRoot().getChildAt(0), graph.getDefaultParent(), false);
      } finally {
        // Updates the display
        graph.getModel().endUpdate();
        const layout = new mxHierarchicalLayout(graph);
        layout.execute(graph.getDefaultParent());
      }
    }

    function initGraph(xml) {
      const _doc = mxUtils.parseXml(xml);
      const codec = new mxCodec(_doc);
      codec.decode(_doc.documentElement, graph.getModel());
      const vertices = graph.getChildVertices(graph.getDefaultParent());

      if (vertices.length > 3) {
        graph.setEnabled(true);
      }
    }

    /**
     * Create new connection object
     * @param label
     * @param type
     */
    function getConnectionNode(label: string, type: string): Object {
      // Create new Connection object
      const connNode = doc.createElement('Connection');
      connNode.setAttribute('label', label);
      connNode.setAttribute('type', type);
      return connNode;
    }

    /**
     * Create new Node object
     * @param name
     * @param label
     * @param id
     */
    function getCellNode(name: string, label: string, id: any): Object {
      // Create new node object
      const _node = doc.createElement(name);
      _node.setAttribute('label', label);
      if (id) {
        _node.setAttribute('targetId', id);
      }
      return _node;
    }

    /**
     * Reformat the layout
     */
    function executeLayout() {
      isUndoable = true;
      const layout = new mxHierarchicalLayout(graph);
      layout.execute(graph.getDefaultParent());
    }

    /**
     * Function to centered the flow diagram
     */
    function makeCenter() {
      setTimeout(() => {
        graph.zoomActual();
        graph.center(true, true, 0.5, 0.2);
      }, 0);
    }

    function recursiveDeleteFn(selectedCell, target) {
      let flag = false;
      const edges = target.edges;
      if ((selectedCell.value.tagName === 'Fork' && target.value.tagName === 'Join') ||
        (selectedCell.value.tagName === 'If' && target.value.tagName === 'EndIf') ||
        (selectedCell.value.tagName === 'Retry' && target.value.tagName === 'RetryEnd') ||
        (selectedCell.value.tagName === 'Try' && target.value.tagName === 'EndTry')) {

        const attrs = target.value.attributes;
        if (attrs) {
          for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].nodeName === 'targetId' && attrs[i].nodeValue === selectedCell.id) {
              for (let x = 0; x < edges.length; x++) {
                if (edges[x].target.id !== target.id) {
                  _targetNode = edges[x].target;
                }
              }
              self.nodeMap.delete(attrs[i].nodeValue);
              graph.removeCells([target]);
              flag = true;
              break;
            }
          }
        }
      }
      if (edges && edges.length > 0) {
        for (let j = 0; j < edges.length; j++) {
          if (edges[j].target) {
            if (edges[j].target.id !== target.id) {
              if ((selectedCell.value.tagName === 'Fork' && edges[j].target.value.tagName === 'Join') ||
                (selectedCell.value.tagName === 'If' && edges[j].target.value.tagName === 'EndIf') ||
                (selectedCell.value.tagName === 'Retry' && edges[j].target.value.tagName === 'RetryEnd') ||
                (selectedCell.value.tagName === 'Try' && edges[j].target.value.tagName === 'EndTry')) {
                const attrs = edges[j].target.value.attributes;
                if (attrs) {
                  for (let i = 0; i < attrs.length; i++) {
                    if (attrs[i].nodeName === 'targetId' && (attrs[i].nodeValue === selectedCell.id || attrs[i].nodeValue === target.id)) {
                      const _edges = edges[j].target.edges;
                      for (let x = 0; x < _edges.length; x++) {
                        if (_edges[x].target.id !== edges[j].target.id) {
                          _targetNode = _edges[x].target;
                        }
                      }

                      self.nodeMap.delete(attrs[i].nodeValue);
                      graph.removeCells([edges[j].target]);
                      flag = true;
                      break;
                    }
                  }
                }
              } else {
                if (edges[j].target) {
                  if (_iterateId !== edges[j].target.id) {
                    _iterateId = edges[j].target.id;
                    recursiveDeleteFn(selectedCell, edges[j].target);
                  }
                  if (edges[j]) {
                    graph.removeCells([edges[j].target]);
                  }
                }
              }
            }
          }
        }
        if (!flag) {
          for (let i = 0; i < edges.length; i++) {
            if (edges[i] && edges[i].target) {
              if (_iterateId !== edges[i].target.id) {
                _iterateId = edges[i].target.id;
                recursiveDeleteFn(selectedCell, (edges[i].target));
              }
              if (edges[i]) {
                graph.removeCells([edges[i].target]);
              }
              break;
            }
          }
        }
      }
    }

    function recursiveEdgeDelete(cells) {
      _targetNode = {};
      _iterateId = 0;
      const selectedCell = graph.getSelectionCell();
      let id = 0;
      if (selectedCell) {
        if (!isProgrammaticallyDelete) {
          id = selectedCell.id;
          let _sour, _tar, _label = '', _type = '';
          for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (cell.edge && cell.source) {
              if (cell.target.id === id) {
                _sour = cell.source;
              }
              if (selectedCell.value.tagName === 'Fork' || selectedCell.value.tagName === 'If' ||
                selectedCell.value.tagName === 'Retry' || selectedCell.value.tagName === 'Try') {
                if (cell.target) {
                  if (cell.target.id !== id) {
                    recursiveDeleteFn(selectedCell, cell.target);
                    graph.removeCells([cell.target]);
                  }
                }
              } else {
                if (cell.source.id === id) {
                  const attrs = cell.value.attributes;
                  if (attrs) {
                    for (let j = 0; j < attrs.length; j++) {
                      if (attrs[j].nodeName === 'label') {
                        _label = attrs[j].nodeValue;
                      } else if (attrs[j].nodeName === 'type') {
                        _type = attrs[j].nodeValue;
                      }
                    }
                  }
                  _tar = cell.target;
                }
              }
            }
          }
          if (_sour && (_tar || !_.isEmpty(_targetNode))) {
            if (!_tar) {
              _tar = _targetNode;
            }
            let flag = true;
            if ((_sour.value.tagName === 'Fork' && _tar.value.tagName === 'Join') ||
              (_sour.value.tagName === 'If' && _tar.value.tagName === 'EndIf') ||
              (_sour.value.tagName === 'Retry' && _tar.value.tagName === 'RetryEnd') ||
              (_sour.value.tagName === 'Try' && _tar.value.tagName === 'EndTry')) {
              if (_sour.edges.length > 1) {
                flag = false;
              } else {
                _label = '';
                _type = '';
              }
            }
            if (flag) {
              graph.insertEdge(graph.getDefaultParent(), null, getConnectionNode(_label, _type), _sour, _tar);
            }
          }
        } else {
          isProgrammaticallyDelete = false;
        }
      }
      setTimeout(() => {
        isFullyDelete = false;
        if (id > 0) {
          executeLayout();
        }
      }, 0);
    }

    /**
     * change label of EndIf and Join
     */
    function changeLabelOfConnection(cell, data) {
      graph.getModel().beginUpdate();
      try {
        const label = new mxCellAttributeChange(
          cell, 'label',
          data);
        const type = new mxCellAttributeChange(
          cell, 'type',
          data);
        graph.getModel().execute(label);
        graph.getModel().execute(type);
      } finally {
        graph.getModel().endUpdate();
      }
    }

    function checkConnectionLabel(cell, _dropTarget, isChange) {
      if (!isChange) {
        if ((_dropTarget.value.attributes && _dropTarget.value.attributes.length > 0) && (_dropTarget.value.attributes[0].nodeValue === 'join' || _dropTarget.value.attributes[0].nodeValue === 'branch' || _dropTarget.value.attributes[0].nodeValue === 'endIf'
          || _dropTarget.value.attributes[0].nodeValue === 'retryEnd' || _dropTarget.value.attributes[0].nodeValue === 'endTry' || _dropTarget.value.attributes[0].nodeValue === 'endCatch')) {
          let _label1, _label2;
          if (_dropTarget.value.attributes[0].nodeValue === 'join') {
            _label1 = 'join';
            _label2 = 'branch';
          } else if (_dropTarget.value.attributes[0].nodeValue === 'branch') {
            _label1 = 'branch';
            _label2 = 'branch';
          } else if (_dropTarget.value.attributes[0].nodeValue === 'endIf') {
            _label1 = 'endIf';
            _label2 = 'endIf';
          } else if (_dropTarget.value.attributes[0].nodeValue === 'retryEnd') {
            _label1 = 'retryEnd';
            _label2 = 'retryEnd';
          } else if (_dropTarget.value.attributes[0].nodeValue === 'try') {
            _label1 = 'try';
            _label2 = 'try';
          } else if (_dropTarget.value.attributes[0].nodeValue === 'endTry') {
            _label1 = 'endTry';
            _label2 = 'endTry';
          } else if (_dropTarget.value.attributes[0].nodeValue === 'endCatch') {
            _label1 = 'endCatch';
            _label2 = 'endCatch';
          }
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target !== cell.id) {
              if ((cell.edges[i].target.value.tagName === 'Join' || cell.edges[i].target.value.tagName === 'EndIf' || cell.edges[i].target.value.tagName === 'RetryEnd'
                || cell.edges[i].target.value.tagName === 'EndTry' || cell.edges[i].target.value.tagName === 'EndCatch')) {
                if (cell.edges[i].target.edges) {
                  for (let j = 0; j < cell.edges[i].target.edges.length; j++) {
                    if (cell.edges[i].target.edges[j] && cell.edges[i].target.edges[j].target.id !== cell.edges[i].target.id) {
                      changeLabelOfConnection(cell.edges[i].target.edges[j], _label1);
                      break;
                    }
                  }
                }
              } else if (cell.edges[i].target.value.tagName === 'Fork' || cell.edges[i].target.value.tagName === 'If' || cell.edges[i].target.value.tagName === 'Retry'
                || cell.edges[i].target.value.tagName === 'Try') {
                changeLabelOfConnection(cell.edges[i], _label2);
              } else if (cell.edges[i].target.value.tagName === 'Catch') {
                changeLabelOfConnection(cell.edges[i], 'try');
              }
            }
          }
        }
      } else {
        if (cell.edges) {
          let _tempCell: any;
          for (let i = 0; i < cell.edges.length; i++) {
            if (_tempCell) {
              if (cell.edges[i].target !== cell.id) {
                if (cell.edges[i].target.value.tagName === 'Join') {
                  changeLabelOfConnection(_tempCell, 'branch');
                  changeLabelOfConnection(cell.edges[i], 'join');
                } else if (cell.edges[i].target.value.tagName === 'EndIf') {
                  changeLabelOfConnection(cell.edges[i], 'endIf');
                } else if (cell.edges[i].target.value.tagName === 'RetryEnd') {
                  changeLabelOfConnection(cell.edges[i], 'retryEnd');
                } else if (cell.edges[i].target.value.tagName === 'EndTry') {

                  changeLabelOfConnection(cell.edges[i], 'endTry');
                } else if (cell.edges[i].target.value.tagName === 'EndCatch') {
                  changeLabelOfConnection(cell.edges[i], 'endCatch');
                }
              }
            }
            if (cell.edges[i].source !== cell.id) {
              if (cell.edges[i].source.value.tagName === 'Join' || cell.edges[i].source.value.tagName === 'EndIf' || cell.edges[i].source.value.tagName === 'RetryEnd'
                || cell.edges[i].source.value.tagName === 'EndTry' || cell.edges[i].source.value.tagName === 'EndCatch') {
                _tempCell = cell.edges[i];
              }
            }

            if (_dropTarget.value.attributes && _dropTarget.value.attributes.length > 0) {
              if (((_dropTarget.value.attributes[0].nodeValue === 'join' || _dropTarget.value.attributes[1].nodeValue === 'join') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], 'branch');
              } else if (((_dropTarget.value.attributes[0].nodeValue === 'endIf' || _dropTarget.value.attributes[1].nodeValue === 'endIf') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((_dropTarget.value.attributes[0].nodeValue === 'retryEnd' || _dropTarget.value.attributes[1].nodeValue === 'retryEnd') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((_dropTarget.value.attributes[0].nodeValue === 'endTry' || _dropTarget.value.attributes[1].nodeValue === 'endTry') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((_dropTarget.value.attributes[0].nodeValue === 'endCatch' || _dropTarget.value.attributes[1].nodeValue === 'endCatch') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              }
            }
            if (cell.id !== cell.edges[i].target.id) {
              const attrs = cell.edges[i].value.attributes;
              if (attrs) {
                if (attrs[0].value && (attrs[0].value === 'true' || attrs[0].value === 'false')) {
                  graph.getModel().beginUpdate();
                  try {
                    const label = new mxCellAttributeChange(
                      cell.edges[i], 'label',
                      '');
                    const type = new mxCellAttributeChange(
                      cell.edges[i], 'type',
                      '');
                    graph.getModel().execute(label);
                    graph.getModel().execute(type);
                  } finally {
                    graph.getModel().endUpdate();
                  }
                }
              }
            } else if (cell.id !== cell.edges[i].source.id) {
              const attrs = cell.edges[i].value.attributes;
              if (attrs && attrs.length > 0) {
                if (attrs[0].value === 'If') {
                  if (cell.edges[i].target.value.tagName !== 'If' && cell.edges[i].source.value.tagName !== 'If' && cell.value.tagName !== 'If') {
                    graph.getModel().beginUpdate();
                    try {
                      const label = new mxCellAttributeChange(
                        cell.edges[i], 'label',
                        '');
                      const type = new mxCellAttributeChange(
                        cell.edges[i], 'type',
                        '');
                      graph.getModel().execute(label);
                      graph.getModel().execute(type);
                    } finally {
                      graph.getModel().endUpdate();
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    /**
     * Updates the properties panel
     */
    function selectionChanged(_graph) {

      let div = document.getElementById('properties');
      // Forces focusout in IE
      _graph.container.focus();

      // Clears the DIV the non-DOM way
      div.innerHTML = '';

      // Gets the selection cell
      const cell = _graph.getSelectionCell();
      if (cell == null) {
        div.setAttribute('class', 'text-center text-orange');
        mxUtils.writeln(div, 'Nothing selected.');
      } else {
        if (cell.value.tagName === 'Fork') {
          div.setAttribute('class', 'text-center text-orange');
          mxUtils.writeln(div, 'Nothing selected.');
          return;
        }
        div.removeAttribute('class');
        const form = new mxForm('property-table');
        let attrs = cell.value.attributes;
        let flg1 = false, flg2 = false;
        if (attrs) {
          for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].nodeName !== 'label') {
              createTextField(_graph, form, cell, attrs[i]);
            }
            if (attrs[i].nodeName === 'success') {
              flg1 = true;
            }
            if (attrs[i].nodeName === 'failure') {
              flg2 = true;
            }
          }
          if (cell.value.nodeName === 'Job') {
            if (!flg1) {
              createTextField(_graph, form, cell, {nodeName: 'success', nodeValue: ''});
            }
            if (!flg2) {
              createTextField(_graph, form, cell, {nodeName: 'failure', nodeValue: ''});
            }
            createTextAreaField(_graph, form, cell, 'Script', '');
          }
        }
        div.appendChild(form.getTable());
        mxUtils.br(div);
      }
    }

    /**
     * Creates the textfield for the given property.
     */
    function createTextField(_graph, form, cell, attribute) {
      let input = form.addText(attribute.nodeName + ':', attribute.nodeValue);
      const applyHandler = function () {
        let newValue = input.value || '';
        let oldValue = cell.getAttribute(attribute.nodeName, '');
        if (newValue !== oldValue) {
          _graph.getModel().beginUpdate();
          try {
            const edit = new mxCellAttributeChange(
              cell, attribute.nodeName, newValue);
            _graph.getModel().execute(edit);
            isUndoable = true;
          } finally {
            _graph.getModel().endUpdate();
          }
        }
      };

      mxEvent.addListener(input, 'keypress', function (evt) {
        // Needs to take shift into account for textareas
        if (evt.which == /*enter*/13 &&
          !mxEvent.isShiftDown(evt)) {
          input.blur();
        }
      });

      if (mxClient.IS_IE) {
        mxEvent.addListener(input, 'focusout', applyHandler);
      } else {
        mxEvent.addListener(input, 'blur', applyHandler);
      }
    }

    /**
     * Creates the textAreafield for the given property.
     */
    function createTextAreaField(_graph, form, cell, name, value) {
      let input = form.addTextarea(name + ':', value, 10);
      const applyHandler = function () {
        let newValue = input.value || '';
        let oldValue = cell.getAttribute(name, '');
        if (newValue !== oldValue) {
          _graph.getModel().beginUpdate();
          try {
            const edit = new mxCellAttributeChange(
              cell, name, newValue);
            _graph.getModel().execute(edit);
            isUndoable = true;
          } finally {
            _graph.getModel().endUpdate();
          }
        }
      };

      mxEvent.addListener(input, 'keypress', function (evt) {
        // Needs to take shift into account for textareas
        if (evt.which === /*enter*/13 && !mxEvent.isShiftDown(evt)) {
          input.blur();
        }
      });

      if (mxClient.IS_IE) {
        mxEvent.addListener(input, 'focusout', applyHandler);
      } else {
        mxEvent.addListener(input, 'blur', applyHandler);
      }
    }
  }
}