import {Component, Input, OnInit, ViewChild, OnDestroy, HostListener, AfterViewInit} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {saveAs} from 'file-saver';
import * as _ from 'underscore';
import {FileUploader} from 'ng2-file-upload';
import {TreeModel, TreeNode} from 'angular-tree-component';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../admin/data.service';
import {Subscription} from 'rxjs';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

declare const require;
declare const vkbeautify;
declare const $;

const xpath = require('xpath');
const convert = require('xml-js');
const xmldom = require('xmldom');


@Component({
  selector: 'app-modal-child-content',
  templateUrl: './show-childs-dialog.html'
})
export class ShowChildModalComponent implements OnInit {
  @ViewChild('treeCtrl') treeCtrl;
  counter = 0;
  data: string;
  innerTreeStruct: any = [];
  options: any = {};
  nodes = [];
  @Input() showAllChild: any;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {

  }

  ngOnInit(): void {
    this.createTJson(this.showAllChild);
  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }

  createTJson(json) {
    let arr: any = [];
    for (let i = 0; i < json.length; i++) {
      if (json[i].parent === '#') {
        if (!json[i].children) {
          json[i].children = [];
        }
        arr.push(json[i]);
      } else if (json[i].parent !== '#') {
        this.recur(json[i], arr[0]);
      }
    }
    this.printTreeArray(arr);
  }

  recur(node, list) {
    if ((node.parent === list.ref || node.parent === list.rootNode) && node.grandFather === list.parent) {
      if (!node.children) {
        node.children = [];
      }
      list.children.push(node);
    } else {
      for (let j = 0; j < list.children.length; j++) {
        this.recur(node, list.children[j]);
      }
    }
  }

  printTreeArray(rootChildrArr) {
    this.nodes = rootChildrArr;
    this.options = {
      displayField: 'ref',
      isExpandedField: 'expanded',
    };
    this.innerTreeStruct = '';
    this.innerH();
  }

  innerH() {
    this.innerTreeStruct = '';
    this.innerTreeStruct = this.innerTreeStruct + '<div class=\'keysearch\'>' + this.nodes[0].ref + '</div>';
    let temp = this.nodes[0].children;
    let temp2;
    for (let i = 0; i < temp.length; i++) {
      this.innerTreeStruct = this.innerTreeStruct + '<div class=\'ml-1 keysearch\'>' + temp[i].ref + '</div>';
      if (temp[i].children && temp[i].children.length > 0) {
        temp2 = temp[i].children;
        this.printCN(temp2);
      }
    }
  }

  printCN(node) {
    let temp;
    const self = this;
    let count = 1;
    for (let i = 0; i < node.length; i++) {
      this.innerTreeStruct = this.innerTreeStruct + '<div class=\'keysearch\' style="margin-left: ' + (10 * count) + 'px">'
        + node[i].ref + '</div>';
      if (node[i].children && node[i].children.length > 0) {
        temp = node[i].children;
        count++;
        printChNode(temp);
      }
    }

    function printChNode(_node) {
      for (let i = 0; i < _node.length; i++) {
        self.innerTreeStruct = self.innerTreeStruct + '<div class=\'keysearch\' style="margin-left: ' + (10 * count) + 'px">'
          + _node[i].ref + '</div>';
        if (_node[i].children && _node[i].children.length > 0) {
          count++;
          printChNode(_node[i].children);
        }
      }
    }
  }

  // Search in show all child nodes.
  search(sData) {
    this.counter = 0;
    document.getElementById('innertext').innerHTML = '';
    this.innerH();
    setTimeout(() => {
      document.getElementById('innertext').innerHTML = this.innerTreeStruct;
      let inputText = document.getElementsByClassName('keysearch');
      for (let i = 0; i < inputText.length; i++) {
        let innerHTML = inputText[i].innerHTML;
        let pattern = new RegExp('(' + sData + ')', 'gi');
        let searchPara = innerHTML.toString();
        if (pattern.test(searchPara)) {
          innerHTML = searchPara.replace(pattern, function (str) {
            return '<span class=\'highlight\'>' + str + '</span>';
          });
          inputText[i].innerHTML = innerHTML;
        }
        if (searchPara.match(pattern)) {
          let c = searchPara.match(pattern).length;
          this.counter = this.counter + c;
        }
      }
    }, 0);
  }

  // Expand all Node
  expandAll(): void {
    this.treeCtrl.treeModel.expandAll();
  }

  // Collapse all Node
  collapseAll(): void {
    this.treeCtrl.treeModel.collapseAll();
  }
}

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './show-dialog.html'
})
export class ShowModalComponent {
  @Input() xml: any;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }
}

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './import-dialog.html'
})
export class ImportModalComponent implements OnInit {

  @Input() schedulerId: any;
  @Input() display: any;
  @Input() selectedPath: any;

  uploader: FileUploader;
  fileLoading = false;
  messageList: any;
  required = false;
  submitted = false;
  comments: any = {};
  selectedXsd: any;
  assignXsd: any;
  uploadData: any;

  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({
      url: ''
    });
  }

  ngOnInit() {
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }

    this.uploader.onBeforeUploadItem = (item: any) => {

    };

    this.uploader.onCompleteItem = (fileItem: any, response, status, headers) => {
      if (status === 200) {
        this.activeModal.close('success');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      if (response.error) {
        this.toasterService.pop('error', response.error.code, response.error.message);
      }
    };
  }

  // import xml
  onFileSelected(event: any): void {
    let item = event['0'];
    let fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (fileExt != 'XML') {
      this.toasterService.pop('error', '', fileExt + ' ' + 'invalid file type');
    } else {
      this.fileLoading = false;
      let reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = (_event: any) => {
        this.uploadData = _event.target.result;
        if (this.uploadData !== undefined && this.uploadData !== '') {
        } else {
          this.toasterService.pop('error', 'Invalid xml file or file must be empty');
        }
      };
    }
  }

  // submit data
  onSubmit() {
    this.activeModal.close({data: this.uploadData, xsd: this.selectedXsd});
  }


  // reassign xsd on import xml
  reassignxsd(selectedXsd) {
    this.selectedXsd = selectedXsd;
    this.assignXsd = this.selectedXsd !== '';
  }

  cancel() {
    this.activeModal.close('');
  }
}

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './confirmation-dialog.html'
})
export class ConfirmationModalComponent implements OnInit {
  @Input() save;
  @Input() self;
  @Input() assignXsd;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
  }

  confirmMessage(message) {
    if (message === 'yes') {
      this.save(this.self);
      this.activeModal.close('success');
    } else {
      this.assignXsd(this.self);
      this.activeModal.close('success');
    }
  }
}

@Component({
  selector: 'app-xml',
  templateUrl: './xml-editor.component.html',
  styleUrls: ['./xml-editor.component.scss']
})
export class XmlEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  schedulerIds: any = {};
  preferences: any = {};
  isLoading = true;
  options: any = {};
  doc: any;
  nodes: any = [];
  tooltipAttrData: any;
  showAllChild: any = [];
  xsdXML: any;
  isNext = false;
  counting = 0;
  autoAddCount = 0;
  copyItem: any = {};
  cutData = false;
  checkRule = true;
  choice = true;
  dragFrom: any;
  dragTo: any;
  dropCheck = false;
  selectedNode: any;
  selectedXsd = '';
  submitXsd = false;
  submitted;
  errorLocation: any;
  childNode: any = [];
  myContent: string;
  value: any = [];
  count = 1;
  error = false;
  errorName;
  tempArr: any = [];
  text;
  subscription: Subscription;
  validConfig = false;
  nonValidattribute: any = {};
  keyRefNodes;
  keyNodes;
  breadCrumbArray: any = [];
  refElement;
  public Editor = ClassicEditor;
  @ViewChild('treeCtrl') treeCtrl;
  @ViewChild('myckeditor') ckeditor: any;

  //translate messages
  requiredField: string;
  spaceNotAllowed: string;
  cannotAddBlankSpace: string;
  onlyPositiveNumbers: string;
  cannotNegative: string;
  colonNotAllowed: string;

  constructor(private http: HttpClient, public coreService: CoreService, private modalService: NgbModal, private dataService: DataService, public translate: TranslateService, public toasterService: ToasterService) {
    this.myContent = '';
    this.subscription = this.dataService.functionAnnounced$.subscribe(res => {
      this.gotoErrorLocation();
    });
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    if (sessionStorage.getItem('xsd') !== null) {
      if (sessionStorage.$SOS$XSD) {
        this.submitXsd = true;
        this.selectedXsd = sessionStorage.$SOS$XSD;
      }
      this.reassignSchema();
      setTimeout(() => {
        this.createJsonfromXml(sessionStorage.getItem('xsd'));
      }, 600);
    } else {
      if (sessionStorage.$SOS$XSD) {
        this.submitXsd = true;
        this.selectedXsd = sessionStorage.$SOS$XSD;
        this.getInitTree(false);
      } else {
        this.isLoading = false;
      }
    }

    this.translate.get('xml.message.requiredField').subscribe(translatedValue => {
      this.requiredField = translatedValue;
    });
    this.translate.get('xml.message.spaceNotAllowed').subscribe(translatedValue => {
      this.spaceNotAllowed = translatedValue;
    });
    this.translate.get('xml.message.cannotAddBlankSpace').subscribe(translatedValue => {
      this.cannotAddBlankSpace = translatedValue;
    });
    this.translate.get('xml.message.onlyPositiveNumbers').subscribe(translatedValue => {
      this.onlyPositiveNumbers = translatedValue;
    });
    this.translate.get('xml.message.cannotNegative').subscribe(translatedValue => {
      this.cannotNegative = translatedValue;
    });
    this.translate.get('xml.message.colonNotAllowed').subscribe(translatedValue => {
      this.colonNotAllowed = translatedValue;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.calcHeight();
    }, 1);
  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }

  // Expand all Node
  expandAll(): void {
    this.treeCtrl.treeModel.expandAll();
  }

  // Collapse all Node
  collapseAll(): void {
    this.treeCtrl.treeModel.collapseAll();
  }

  // change selected xsd value
  changeXSD(value) {
    this.selectedXsd = value;
  }

  // submit xsd to open
  submit() {
    if (this.selectedXsd !== '') {
      sessionStorage.$SOS$XSD = this.selectedXsd;
      this.submitXsd = true;
      this.getInitTree(false);
    }
  }

  // getInit tree
  getInitTree(check) {
    if (this.selectedXsd === 'systemMonitorNotification') {
      this.http.get('xsd/SystemMonitorNotification_v1.0.xsd', {responseType: 'text'})
        .subscribe(data => {
          this.loadTree(data, check);
        });
    } else if (this.selectedXsd === 'yade') {
      this.http.get('xsd/yade_v1.12.xsd', {responseType: 'text'})
        .subscribe(data => {
          this.loadTree(data, check);
        });
    } else {
      this.http.get('xsd/' + this.selectedXsd + '.xsd', {responseType: 'text'})
        .subscribe(data => {
          this.loadTree(data, check);
        });
    }
  }

  loadTree(xml, check) {
    const DOMParser = xmldom.DOMParser;
    this.doc = new DOMParser().parseFromString(xml, 'application/xml');
    this.getRootNode(this.doc, check);
    this.xsdXML = xml;
    this.xpath();
    this.AddKeyRefrencing();
    this.selectedNode = this.nodes[0];
    this.getData(this.nodes[0]);
    this.isLoading = !!check;
  }

  reassignSchema() {
    this.nodes = [];
    this.isLoading = true;
    this.getInitTree(true);
  }

  getRootNode(doc, check) {
    let temp: any;
    let attrs: any;
    let child: any;
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let rootElementPath = '//xs:element';
    let root = select(rootElementPath, doc);
    for (let i = 0; i < root[0].attributes.length; i++) {
      let b = root[0].attributes[i].nodeValue;
      temp = Object.assign({}, {ref: b});
    }
    temp.parent = '#';
    temp.uuid = this.counting;
    this.counting++;
    attrs = this.checkAttributes(temp.ref);
    if (attrs.length > 0) {
      temp.attributes = [];
      for (let i = 0; i < attrs.length; i++) {
        this.checkAttrsText(attrs[i]);
        attrs[i].id = this.counting;
        this.counting++;
        temp.attributes.push(attrs[i]);
      }
    }
    let text = this.checkText(temp.ref);
    if (text) {
      temp.text = text;
    }
    if (!check) {
      child = this.checkChildNode(temp);
      if (child.length > 0) {
        for (let i = 0; i < child.length; i++) {
          if (child[i].minOccurs == undefined) {
            if (!temp.children) {
              temp.children = [];
            }
            this.addChild(child[i], temp, true);
          }
        }
      }
    }
    this.printArray(temp);
  }

  checkAttributes(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
    let attribute: any = {};
    let attrsArr: any = [];
    let element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      let attrsPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute';
      let attrs = select(attrsPath, this.doc);
      if (attrs.length > 0) {
        for (let i = 0; i < attrs.length; i++) {
          attribute = {};
          let x;
          for (let j = 0; j < attrs[i].attributes.length; j++) {
            let a = attrs[i].attributes[j].nodeName;
            let b = attrs[i].attributes[j].nodeValue;
            attribute = Object.assign(attribute, {[a]: b});
            let valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute[@name=\'' + b + '\']/xs:annotation/xs:appinfo/XmlEditor';
            let attr1 = select(valueFromXmlEditorPath, this.doc);
            if (attr1.length > 0) {
              if (attr1[0].attributes && attr1[0].attributes.length > 0) {
                for (let i = 0; i < attr1[0].attributes.length; i++) {
                  if (attr1[0].attributes[i].nodeName == 'type') {
                    x = attr1[0].attributes[i].nodeValue;
                    break;
                  }
                }
              }
            }
          }
          if (x !== undefined) {
            attribute.type = x;
          }
          attribute.parent = node;
          attrsArr.push(attribute);
        }
      }
    }
    if (element.length > 0) {
      let attrsPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute';
      let attrs = select(attrsPath, this.doc);
      if (attrs.length > 0) {
        for (let i = 0; i < attrs.length; i++) {
          attribute = {};
          let x;
          for (let j = 0; j < attrs[i].attributes.length; j++) {
            let a = attrs[i].attributes[j].nodeName;
            let b = attrs[i].attributes[j].nodeValue;
            attribute = Object.assign(attribute, {[a]: b});
            let valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute[@name=\'' + b + '\']/xs:annotation/xs:appinfo/XmlEditor';
            let attr1 = select(valueFromXmlEditorPath, this.doc);
            if (attr1.length > 0) {
              if (attr1[0].attributes && attr1[0].attributes.length > 0) {
                for (let i = 0; i < attr1[0].attributes.length; i++) {
                  if (attr1[0].attributes[i].nodeName == 'type') {
                    x = attr1[0].attributes[i].nodeValue;
                    break;
                  }
                }
              }
            }
          }
          if (x !== undefined) {
            attribute.type = x;
          }
          attribute.parent = node;
          attrsArr.push(attribute);
        }
      }
    }
    if (element.length > 0) {
      let attrsPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:simpleContent/xs:extension/xs:attribute';
      let attrs = select(attrsPath, this.doc);
      if (attrs.length > 0) {
        for (let i = 0; i < attrs.length; i++) {
          attribute = {};
          let x;
          for (let j = 0; j < attrs[i].attributes.length; j++) {
            let a = attrs[i].attributes[j].nodeName;
            let b = attrs[i].attributes[j].nodeValue;
            attribute = Object.assign(attribute, {[a]: b});
            let valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute[@name=\'' + b + '\']/xs:annotation/xs:appinfo/XmlEditor';
            let attr1 = select(valueFromXmlEditorPath, this.doc);
            if (attr1.length > 0) {
              if (attr1[0].attributes && attr1[0].attributes.length > 0) {
                for (let i = 0; i < attr1[0].attributes.length; i++) {
                  if (attr1[0].attributes[i].nodeName == 'type') {
                    x = attr1[0].attributes[i].nodeValue;
                    break;
                  }
                }
              }
            }
          }
          if (x !== undefined) {
            attribute.type = x;
          }
          attribute.parent = node;
          attrsArr.push(attribute);
        }
      }
    }
    return attrsArr;
  }

  checkChildNode(nodes) {
    let node = nodes.ref;
    let parentNode;
    this.childNode = [];
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
    let TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
    let children: any = {};
    let childArr: any = [];
    let element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      let sequencePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence';
      let choicePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice';
      let childFromBasePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/@base';
      let complexContentWithElementPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/xs:sequence/xs:element';
      let childs = select(childFromBasePath, this.doc);
      let element1 = select(sequencePath, this.doc);
      if (element1.length > 0) {
        let cPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:element';
        let cElement = select(cPath, this.doc);
        if (cElement.length > 0) {
          for (let i = 0; i < cElement.length; i++) {
            children = {};
            for (let j = 0; j < cElement[i].attributes.length; j++) {
              let a = cElement[i].attributes[j].nodeName;
              let b = cElement[i].attributes[j].nodeValue;
              children = Object.assign(children, {[a]: b});
            }
            children.parent = node;
            childArr.push(children);
            this.childNode = childArr;
          }
        }
        let dPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:element';
        let dElement = select(dPath, this.doc);
        if (dElement.length > 0) {
          for (let i = 0; i < dElement.length; i++) {
            children = {};
            for (let j = 0; j < dElement[i].attributes.length; j++) {
              let a = dElement[i].attributes[j].nodeName;
              let b = dElement[i].attributes[j].nodeValue;
              children = Object.assign(children, {[a]: b});
            }
            children.parent = node;
            children.choice = node;
            childArr.push(children);
            this.childNode = childArr;
          }
        }
        let ePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:sequence/xs:element';
        let eElement = select(ePath, this.doc);
        if (eElement.length > 0) {
          for (let i = 0; i < eElement.length; i++) {
            children = {};
            for (let j = 0; j < eElement[i].attributes.length; j++) {
              let a = eElement[i].attributes[j].nodeName;
              let b = eElement[i].attributes[j].nodeValue;
              children = Object.assign(children, {[a]: b});
            }
            children.parent = node;
            children.choice = node;
            if (children.minOccurs && !children.maxOccurs) {
            } else {
              childArr.push(children);
            }
            this.childNode = childArr;
          }
        }
        return childArr;
      }
      if ((select(choicePath, this.doc)).length > 0) {
        let childPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:element';
        let childs1 = select(childPath, this.doc);
        if (childs1.length > 0) {
          for (let i = 0; i < childs1.length; i++) {
            children = {};
            for (let j = 0; j < childs1[i].attributes.length; j++) {
              let a = childs1[i].attributes[j].nodeName;
              let b = childs1[i].attributes[j].nodeValue;
              children = Object.assign(children, {[a]: b});
            }
            children.parent = node;
            children.choice = node;
            childArr.push(children);
            this.childNode = childArr;
          }
          let childPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:sequence/xs:element';
          let child12 = select(childPath2, this.doc);
          if (child12.length > 0) {
            for (let i = 0; i < child12.length; i++) {
              children = {};
              for (let j = 0; j < child12[i].attributes.length; j++) {
                let a = child12[i].attributes[j].nodeName;
                let b = child12[i].attributes[j].nodeValue;
                children = Object.assign(children, {[a]: b});
              }
              children.parent = node;
              children.choice = node;
              childArr.push(children);
              this.childNode = childArr;
            }
          }
          return childArr;
        }
      }
      if (childs.length > 0) {
        if (childs[0].nodeValue !== 'NotEmptyType') {
          let childrenPath = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:sequence/xs:element';
          let sElement = select(childrenPath, this.doc);
          if (sElement.length > 0) {
            for (let i = 0; i < sElement.length; i++) {
              children = {};
              for (let j = 0; j < sElement[i].attributes.length; j++) {
                let a = sElement[i].attributes[j].nodeName;
                let b = sElement[i].attributes[j].nodeValue;
                children = Object.assign(children, {[a]: b});
              }
              children.parent = node;
              childArr.push(children);
              this.childNode = childArr;
            }
          } else if ((select(complexContentWithElementPath, this.doc)).length > 0) {
            let childrenPath1 = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:choice/xs:element';
            let elementx = select(childrenPath1, this.doc);
            if (elementx.length > 0) {
              for (let i = 0; i < elementx.length; i++) {
                children = {};
                for (let j = 0; j < elementx[i].attributes.length; j++) {
                  let a = elementx[i].attributes[j].nodeName;
                  let b = elementx[i].attributes[j].nodeValue;
                  children = Object.assign(children, {[a]: b});
                }
                children.parent = node;
                children.choice = node;
                childArr.push(children);
                this.childNode = childArr;
              }
              let ele = select(complexContentWithElementPath, this.doc);
              for (let i = 0; i < ele.length; i++) {
                children = {};
                for (let j = 0; j < ele[i].attributes.length; j++) {
                  let a = ele[i].attributes[j].nodeName;
                  let b = ele[i].attributes[j].nodeValue;
                  children = Object.assign(children, {[a]: b});
                }
                children.parent = node;
                childArr.push(children);
                this.childNode = childArr;
              }
              return childArr;
            }
          }
        }
      }
    } else if ((select(TypePath, this.doc).length > 0)) {
      parentNode = node;
      let typeElement = select(TypePath, this.doc);
      if (typeElement.length > 0 && typeElement[0].attributes.length > 0) {
        for (let i = 0; i < typeElement[0].attributes.length; i++) {
          if (typeElement[0].attributes[i].nodeName === 'type') {
            this.addTypeChildNode(typeElement[0].attributes[i].nodeValue, parentNode);
          }
          if (typeElement[0].attributes[i].nodeValue === 'xs:boolean') {
            nodes = Object.assign(nodes, {values: []});
            let temp: any = {};
            for (let j = 0; j < typeElement[0].attributes.length; j++) {
              let a = typeElement[0].attributes[j].nodeName;
              let b = typeElement[0].attributes[j].nodeValue;
              if (a == 'type') {
                a = 'base';
              }
              if (a == 'default') {
                temp.data = b;
              }
              temp = Object.assign(temp, {[a]: b});
            }
            temp.parent = node;
            nodes.values.push(temp);
          }
        }
      }
    }
  }

  getAttrFromType(nodeValue, parentNode) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue + '\']/@type';
    let element = select(attrTypePath, this.doc);
    let attribute: any = {};
    if (element.length > 0) {
      let ele = select(attrTypePath, this.doc);
      let x;
      for (let i = 0; i < ele.length; i++) {
        let a = ele[i].nodeName;
        let b = ele[i].nodeValue;
        attribute = Object.assign(attribute, {[a]: b});

      }

      attribute.parent = nodeValue;
      attribute.grandFather = parentNode;
    }
    return this.getAttrsFromType(attribute);
  }

  getAttrsFromType(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '/xs:schema/xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute/@*';
    let element = select(attrTypePath, this.doc);
    let attrArr = [];
    let attribute: any = {};
    if (element.length > 0) {
      for (let i = 0; i < element.length; i++) {
        let a = element[i].nodeName;
        let b = element[i].nodeValue;
        attribute = Object.assign(attribute, {[a]: b});
      }
      attribute.parent = node.parent;
      attribute.grandFather = node.grandFather;
      let value: any = this.getAttrsValueFromType(attribute, node);
      if (value.length > 0) {
        attribute.values = value;
      }
      attrArr.push(attribute);
      return attrArr;
    }
  }

  getAttrsValueFromType(attr, node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let valueTypePath = '//xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + attr.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
    let element = select(valueTypePath, this.doc);
    let valueArr = [];
    if (element.length > 0) {
      for (let i = 0; i < element.length; i++) {
        let value = {};
        for (let j = 0; j < element[i].attributes.length; j++) {
          let a = element[i].attributes[j].nodeName;
          let b = element[i].attributes[j].nodeValue;
          value = Object.assign(value, {[a]: b});
        }
        valueArr.push(value);
      }
      return valueArr;
    }
  }

  getValFromDefault(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '/xs:schema/xs:element[@name=\'' + node.ref + '\']/@default';
    let ele = select(attrTypePath, this.doc);
    let valueArr: any = [];
    let value: any = {};
    for (let i = 0; i < ele.length; i++) {
      value.base = 'xs:string';
      value.parent = node.ref;
      value.grandFather = node.parent;
      value.data = ele[i].nodeValue;
    }
    if (!(_.isEmpty(value))) {
      valueArr.push(value);
    }
    return valueArr;
  }

  getVal(nodeValue) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue.ref + '\']/@type';
    let ele = select(attrTypePath, this.doc);
    let valueArr: any = [];
    let value: any = {};
    for (let i = 0; i < ele.length; i++) {
      if (ele[i].nodeValue === 'xs:string' || ele[i].nodeValue === 'xs:long' || ele[i].nodeValue === 'xs:positiveInteger') {
        value.base = ele[i].nodeValue;
        value.parent = nodeValue.ref;
        value.grandFather = nodeValue.parent;
      }
      if (!(_.isEmpty(value))) {
        valueArr.push(value);
      }
    }
    return valueArr;
  }

  getValueFromType(nodeValue, parentNode) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue + '\']/@type';
    let ele = select(attrTypePath, this.doc);
    let attribute: any = {};
    if (ele.length > 0) {
      for (let i = 0; i < ele.length; i++) {
        let a = ele[i].nodeName;
        let b = ele[i].nodeValue;
        attribute = Object.assign(attribute, {[a]: b});
      }
      attribute.parent = nodeValue;
      attribute.grandFather = parentNode;
    }
    return this.getTypeValue(attribute);
  }

  getTypeValue(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let extensionTypePath = '/xs:schema/xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/@*';
    let element = select(extensionTypePath, this.doc);
    let value: any = {};
    let valueArr: any = [];
    let b;
    if (element.length > 0) {
      if (element[0] && element[0].nodeValue === 'NotEmptyType') {
        let a = element[0].nodeName;
        let x = element[0].nodeValue;
        value = Object.assign(value, {[a]: x});
        let simpleTypePath = '/xs:schema/xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
        element = select(simpleTypePath, this.doc);
        if (element.length > 0) {
          a = element[0].nodeName;
          b = element[0].nodeValue;
          value = Object.assign(value, {[a]: b});
          let minLengthPath = '/xs:schema/xs:simpleType[@name=\'' + x + '\']/xs:restriction/xs:minLength/@*';
          element = select(minLengthPath, this.doc);
          a = element[0].nodeName;
          b = element[0].nodeValue;
          value = Object.assign(value, {[a]: b});
        }
        value.parent = node.parent;
        value.grandFather = node.grandFather;
      }

      if (!(_.isEmpty(value))) {
        valueArr.push(value);
      }
      return valueArr;
    }
  }

  checkText(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let documentationPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation/@*';
    let element = select(documentationPath, this.doc);
    let text: any = {};
    if (element.length > 0) {
      for (let i = 0; i < element.length; i++) {
        let a = element[i].nodeName;
        let b = element[i].nodeValue;
        text = Object.assign(text, {[a]: b});
      }
    } else {
      let documentationPath1 = '/xs:schema/xs:element[@ref=\'' + node + '\']/xs:annotation/xs:documentation/@*';
      let element1 = select(documentationPath1, this.doc);
      for (let i = 0; i < element1.length; i++) {
        let a = element1[i].nodeName;
        let b = element1[i].nodeValue;
        text = Object.assign(text, {[a]: b});
      }
    }
    let documentationPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation';
    let element2 = select(documentationPath2, this.doc);
    if (element2.length > 0) {
      text.doc = element2;
    }
    text.parent = node;
    return text;
  }

  checkAttrsText(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let textAttrsPath = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
    let element = select(textAttrsPath, this.doc);
    let text: any = {};
    if (element.length > 0) {
      text.doc = element;
      node.text = text;
    }
    if (element.length == 0) {
      let textAttrsPath = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
      let element1 = select(textAttrsPath, this.doc);
      text.doc = element1;
      node.text = text;

      let textAttrsPath1 = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
      let element2 = select(textAttrsPath1, this.doc);
      text.doc = element2;
      node.text = text;
    }
  }

  addTypeChildNode(node, parent) {
    var parentNode;
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let complexTypePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']';
    let TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
    let children: any = {};
    let childArr: any = [];
    let element = select(complexTypePath, this.doc);
    if (element.length > 0) {
      let sequencePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence';
      let element1 = select(sequencePath, this.doc);
      if (element1.length > 0) {
        let childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:element';
        let childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            children = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              let a = childs[i].attributes[j].nodeName;
              let b = childs[i].attributes[j].nodeValue;
              children = Object.assign(children, {[a]: b});
            }
            children.parent = parent;
            childArr.push(children);
            this.childNode = childArr;
          }
        }
        let seqChoicePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:element';
        let getChildChoice = select(seqChoicePath, this.doc);
        if (getChildChoice.length > 0) {
          for (let i = 0; i < getChildChoice.length; i++) {
            children = {};
            for (let j = 0; j < getChildChoice[i].attributes.length; j++) {
              let a = getChildChoice[i].attributes[j].nodeName;
              let b = getChildChoice[i].attributes[j].nodeValue;
              children = Object.assign(children, {[a]: b});
            }
            children.parent = parent;
            children.choice = parent;
            childArr.push(children);
            this.childNode = childArr;
          }
        }
        let seqChoiceSeqPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:sequence/xs:element';
        let getChildChoiceSeq = select(seqChoiceSeqPath, this.doc);
        if (getChildChoiceSeq.length > 0) {
          for (let i = 0; i < getChildChoiceSeq.length; i++) {
            children = {};
            for (let j = 0; j < getChildChoiceSeq[i].attributes.length; j++) {
              let a = getChildChoiceSeq[i].attributes[j].nodeName;
              let b = getChildChoiceSeq[i].attributes[j].nodeValue;
              children = Object.assign(children, {[a]: b});
            }
            children.parent = parent;
            children.choice1 = parent;
            childArr.push(children);
            this.childNode = childArr;
          }
        }
        return childArr;
      }
      let choicePath = '//xs:complexType[@name=\'' + node + '\']/xs:choice';
      if ((select(choicePath, this.doc)).length) {
        let childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:choice/xs:element';
        let childs = select(childPath, this.doc);
        if (childs.length > 0) {
          for (let i = 0; i < childs.length; i++) {
            children = {};
            for (let j = 0; j < childs[i].attributes.length; j++) {
              let a = childs[i].attributes[j].nodeName;
              let b = childs[i].attributes[j].nodeValue;
              children = Object.assign(children, {[a]: b});
            }
            children.parent = parent;
            children.choice = parent;
            childArr.push(children);
            this.childNode = childArr;
          }
          return childArr;
        }
      }
    } else if ((select(TypePath, this.doc).length > 0)) {
      parentNode = node;
      let typeElement = select(TypePath, this.doc);
      if (typeElement.length > 0 && typeElement[0].attributes.length > 0) {
        for (let i = 0; i < typeElement[0].attributes.length; i++) {
          if (typeElement[0].attributes[i].nodeName === 'type') {
            this.addTypeChildNode(typeElement[0].attributes[i].nodeValue, parentNode);
          }
        }
      }
    }
  }

  addChild(child, nodeArr, check) {
    let attrs = this.checkAttributes(child.ref);
    let text = this.checkText(child.ref);
    let value = this.getValues(child.ref);
    let attrsType: any = this.getAttrFromType(child.ref, child.parent);
    let valueType = this.getValueFromType(child.ref, child.parent);
    let val = this.getVal(child);
    if ((_.isEmpty(val)) && (_.isEmpty(value)) && (_.isEmpty(valueType))) {
      val = this.getValFromDefault(child);
    }
    child.children = [];
    child.uuid = this.counting;
    child.parentId = nodeArr.uuid;
    this.counting++;
    if (!(_.isEmpty(attrs))) {
      this.attachAttrs(attrs, child);
    }
    nodeArr.children.push(child);
    if (check) {
      this.autoAddChild(child);
    }
    if (!(_.isEmpty(text))) {
      this.addText(text, nodeArr.children);
    }
    if (!(_.isEmpty(val))) {
      this.attachValue(val, nodeArr.children);
    }
    if (!(_.isEmpty(value))) {
      this.attachValue(value, nodeArr.children);
    }
    if (valueType !== undefined) {
      this.attachValue(valueType, nodeArr.children);
    }
    if (attrsType !== undefined) {
      this.attachTypeAttrs(attrsType, nodeArr.children);
    }
    if (nodeArr.ref == 'NotificationMail' || nodeArr.ref == 'Header') {
      this.arrangeArr(nodeArr);
    }

    this.autoExpand(nodeArr);
    this.printArraya(false);
  }

  arrangeArr(node) {
    let arr = _.clone(node.children);
    for (let j = 0; j < arr.length; j++) {
      if (node.children[j].ref === 'From') {
        let temp;
        if (node && node.children[0] !== undefined) {
          temp = node.children[0];
          node.children[0] = node.children[j];
          node.children[j] = temp;
        }
      }
      if (node.children[j].ref === 'To') {
        let temp;
        if (node && node.children[1] !== undefined) {
          temp = node.children[1];
          node.children[1] = node.children[j];
          node.children[j] = temp;
        }
      }
      if (node.children[j].ref === 'CC') {
        let temp;
        if (node && node.children[2] !== undefined) {
          temp = node.children[2];
          node.children[2] = node.children[j];
          node.children[j] = temp;
        }
      }
      if (node.children[j].ref === 'BCC') {
        let temp;
        if (node && node.children[3] !== undefined) {
          temp = node.children[3];
          node.children[3] = node.children[j];
          node.children[j] = temp;
        }
      }
      if (node.children[j].ref === 'Subject' && j < node.children[j].length) {
        let temp;
        if (node && node.children[4] !== undefined) {
          temp = node.children[4];
          node.children[4] = node.children[j];
          node.children[j] = temp;
        }
      }
    }
  }

  autoAddChild(child) {
    if (this.autoAddCount == 0) {
      let getCh = this.checkChildNode(child);
      if (getCh) {
        for (let i = 0; i < getCh.length; i++) {
          if (getCh[i].minOccurs == undefined || getCh[i].minOccurs == 1) {
            if (!getCh[i].choice) {
              getCh[i].children = [];
              this.autoAddCount++;
              this.addChild(getCh[i], child, true);
            }
          }
        }
      }
      this.getData(child);
      this.printArraya(false);
    }
  }

  addText(text, child) {
    if (child.length > 0) {
      for (let i = 0; i < child.length; i++) {
        if (text && text.parent === child[i].ref) {
          if (!child[i].text) {
            child[i].text = text;
          }
        }
      }
    }
  }

  attachTypeAttrs(attrs, child) {
    for (let i = 0; i < child.length; i++) {
      if (attrs[0] && attrs[0].parent === child[i].ref && attrs[0].grandFather === child[i].parent) {
        if (!child[i].attributes) {
          child[i].attributes = [];
          for (let j = 0; j < attrs.length; j++) {
            this.checkAttrsValue(attrs[j]);
            attrs[j].id = this.counting;
            if (attrs[j].default) {
              attrs[j].data = attrs[j].default;
            }
            this.counting++;
            child[i].attributes.push(attrs[j]);
          }
          this.printArraya(false);
        } else {
          for (let j = 0; j < attrs.length; j++) {
            this.checkAttrsValue(attrs[j]);
            attrs[j].id = this.counting;
            if (attrs[j].default) {
              attrs[j].data = attrs[j].default;
            }
            this.counting++;
            child[i].attributes.push(attrs[j]);
          }
          this.printArraya(false);
        }
      }
    }
  }

  attachAttrs(attrs, child) {
    if (!child.attribute) {
      child.attributes = [];
      for (let j = 0; j < attrs.length; j++) {
        this.checkAttrsValue(attrs[j]);
        this.checkAttrsText(attrs[j]);
        attrs[j].id = this.counting;
        this.counting++;
        if (attrs[j].default) {
          attrs[j].data = attrs[j].default;
        }
        child.attributes.push(attrs[j]);
      }
    }
  }

  attachValue(value, child) {
    if (value && value.length > 0 && value[0].grandFather) {
      for (let i = 0; i < child.length; i++) {
        if (value[0] && value[0].parent === child[i].ref && value[0].grandFather === child[i].parent) {
          if (!child[i].values) {
            child[i].values = [];
            for (let j = 0; j < value.length; j++) {
              value[j].uuid = this.counting;
              this.counting++;
              child[i].values.push(value[j]);
            }
            this.printArraya(false);
          }
        }
      }
    } else {
      if (child.length > 0) {
        for (let i = 0; i < child.length; i++) {
          if (value && value[0] && value[0].parent === child[i].ref) {
            if (!child[i].values) {
              child[i].values = [];
              for (let j = 0; j < value.length; j++) {
                value[j].uuid = this.counting;
                this.counting++;
                child[i].values.push(value[j]);
              }
              this.printArraya(false);
            }
          }
        }
      }
    }
  }

  checkAttrsValue(attrs) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let enumerationPath = '//xs:element[@name=\'' + attrs.parent + '\']//xs:complexType/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + attrs.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
    let valueArr = [];
    let valueJson = {};
    let value = select(enumerationPath, this.doc);
    if (value.length > 0) {
      for (let i = 0; i < value.length; i++) {
        valueJson = {};
        for (let j = 0; j < value[i].attributes.length; j++) {
          let a = value[i].attributes[j].nodeName;
          let b = value[i].attributes[j].nodeValue;
          valueJson = Object.assign(valueJson, {[a]: b});
        }
        valueArr.push(valueJson);
      }
      if (!attrs.values) {
        attrs.values = [];
        for (let i = 0; i < valueArr.length; i++) {
          attrs.values.push(valueArr[i]);
        }
      }
    } else {
      let enumerationPath = '//xs:element[@name=\'' + attrs.parent + '\']//xs:complexType/xs:attribute[@name=\'' + attrs.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
      value = select(enumerationPath, this.doc);
      for (let i = 0; i < value.length; i++) {
        valueJson = {};
        for (let j = 0; j < value[i].attributes.length; j++) {
          let a = value[i].attributes[j].nodeName;
          let b = value[i].attributes[j].nodeValue;
          valueJson = Object.assign(valueJson, {[a]: b});
        }
        valueArr.push(valueJson);
      }
      if (!attrs.values) {
        attrs.values = [];
        for (let i = 0; i < valueArr.length; i++) {
          attrs.values.push(valueArr[i]);
        }
      }
    }
  }

  getValues(node) {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let extensionPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:simpleContent/xs:extension/@*';
    let value: any = {};
    let valueArr: any = [];
    let b;
    let element = select(extensionPath, this.doc);
    if (element[0] && element[0].nodeValue !== 'NotEmptyType') {
      let a = element[0].nodeName;
      let x = element[0].nodeValue;
      value = Object.assign(value, {[a]: x});
      let defultPath = '//xs:element[@name=\'' + node + '\']/@*';
      let defAttr = select(defultPath, this.doc);
      if (defAttr.length > 0) {
        for (let s = 0; s < defAttr.length; s++) {
          if (defAttr[s].nodeName === 'default') {
            value.default = defAttr[s].nodeValue;
            value.data = defAttr[s].nodeValue;
          }
        }
      }
    }
    if (element[0] && element[0].nodeValue === 'NotEmptyType') {
      let a = element[0].nodeName;
      let x = element[0].nodeValue;
      value = Object.assign(value, {[a]: x});
      let simpleTypePath = '//xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
      element = select(simpleTypePath, this.doc);
      if (element.length > 0) {
        a = element[0].nodeName;
        b = element[0].nodeValue;
        value = Object.assign(value, {[a]: b});
        let minLengthPath = '//xs:simpleType[@name=\'' + x + '\']/xs:restriction/xs:minLength/@*';
        element = select(minLengthPath, this.doc);
        a = element[0].nodeName;
        b = element[0].nodeValue;
        value = Object.assign(value, {[a]: b});

      }
      let defultPath = '//xs:element[@name=\'' + node + '\']/@*';
      let defAttr = select(defultPath, this.doc);
      if (defAttr.length > 0) {
        for (let s = 0; s < defAttr.length; s++) {
          if (defAttr[s].nodeName === 'default') {
            value.default = defAttr[s].nodeValue;
            value.data = defAttr[s].nodeValue;
          }
        }
      }
      value.parent = node;
    } else {
      let extensionPath1 = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/@*';
      element = select(extensionPath1, this.doc);
      if (element.length > 0) {
        let a = element[0].nodeName;
        let c = element[0].nodeValue;
        value = Object.assign(value, {[a]: c});
        let defultPath = '//xs:element[@name=\'' + node + '\']/@*';
        let defAttr = select(defultPath, this.doc);
        if (defAttr.length > 0) {
          for (let s = 0; s < defAttr.length; s++) {
            if (defAttr[s].nodeName === 'default') {
              value.default = defAttr[s].nodeValue;
              value.data = defAttr[s].nodeValue;
            }
          }
        }
        let minLengthPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:minLength/@*';
        element = select(minLengthPath, this.doc);
        let enumPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:enumeration/@*';
        let ele = select(enumPath, this.doc);
        if (element.length > 0) {
          a = element[0].nodeName;
          b = element[0].nodeValue;
          value = Object.assign(value, {[a]: b});
          let defultPath1 = '//xs:element[@name=\'' + node + '\']/@*';
          let defAttr = select(defultPath1, this.doc);
          if (defAttr.length > 0) {
            for (let s = 0; s < defAttr.length; s++) {
              if (defAttr[s].nodeName === 'default') {
                value.default = defAttr[s].nodeValue;
                value.data = defAttr[s].nodeValue;
              }
            }
          }
        }
        if (ele.length > 0) {
          value.values = [];
          for (let i = 0; i < ele.length; i++) {
            let z: any = {};
            let x = ele[i].nodeName;
            let y = ele[i].nodeValue;
            z = Object.assign(z, {[x]: y});
            value.values.push(z);
          }
          let defultPath2 = '//xs:element[@name=\'' + node + '\']/@*';
          let defAttr = select(defultPath2, this.doc);

          if (defAttr.length > 0) {
            for (let s = 0; s < defAttr.length; s++) {
              if (defAttr[s].nodeName === 'default') {
                value.default = defAttr[s].nodeValue;
                value.data = defAttr[s].nodeValue;
              }
            }
          }
        }
      }
      if (!(_.isEmpty(value))) {
        value.parent = node;
      }
    }
    let xmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:annotation/xs:appinfo/XmlEditor/@type';
    let attr = select(xmlEditorPath, this.doc);
    if (attr.length > 0) {
      value.base = attr[0].nodeValue;
    }
    if (_.isEmpty(value)) {
      let x;
      let valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:annotation/xs:appinfo/XmlEditor';
      let attr1 = select(valueFromXmlEditorPath, this.doc);
      if (attr1.length > 0) {
        if (attr1[0].attributes && attr1[0].attributes.length > 0) {
          for (let i = 0; i < attr1[0].attributes.length; i++) {
            if (attr1[0].attributes[i].nodeName == 'type') {
              x = attr1[0].attributes[i].nodeValue;
              break;
            }
          }
          if (x !== undefined) {
            value.base = x;
            value.parent = node;
          } else {
            value.base = 'xs:string';
            value.parent = node;
          }
        }
      }
    }
    if (!(_.isEmpty(value))) {
      valueArr.push(value);
    }
    return valueArr;
  }

  addDefaultValue(node) {
    if (node.values && (node.values[0].base === 'xs:string' && (node.values[0] && node.values[0].values && node.values[0].values.length > 0) && node.values[0].default === undefined)) {
      node.values[0].default = node.values[0].values[0].value;
      node.values[0].data = node.values[0].values[0].value;
    } else if (node.values && (node.values[0].base === 'xs:boolean') && node.values[0].default === undefined) {
      node.values[0].default = true;
      node.values[0].data = true;
    }
  }

  getCustomCss(node, parentNode) {
    let count = 0;
    if (this.choice) {
      return node.choice ? 'disabled disable-link' : '';
    }
    if (node.maxOccurs === 'unbounded') {
      return '';
    } else if (node.maxOccurs !== 'unbounded' && node.maxOccurs !== undefined) {
      if (parentNode.children && parentNode.children.length > 0) {
        for (let i = 0; i < parentNode.children.length; i++) {
          if (node.ref === parentNode.children[i].ref) {
            count++;
          }
        }
        if (node.maxOccurs == count) {
          return 'disabled disable-link';
        }
      }
    } else if (node.maxOccurs === undefined) {
      if (parentNode.children && parentNode.children.length > 0) {
        for (let i = 0; i < parentNode.children.length; i++) {
          if (node.ref === parentNode.children[i].ref) {
            return 'disabled disable-link';
          }
        }
      }
    }
  }

  checkmincss(node, parentNode) {
    if (this.choice) {
      let count = 0;
      if (node.maxOccurs === 'unbounded') {
        return '';
      } else if (node.maxOccurs !== 'unbounded' && node.maxOccurs !== undefined) {
        if (parentNode.children.length > 0) {
          for (let i = 0; i < parentNode.children.length; i++) {
            if (node.ref === parentNode.children[i].ref) {
              count++;
            }
          }
          if (node.maxOccurs == count) {
            return 'disabled disable-link';
          }
        }
      } else if (node.maxOccurs === undefined) {
        if (parentNode.children && parentNode.children.length > 0) {
          for (let i = 0; i < parentNode.children.length; i++) {
            if (node.ref === parentNode.children[i].ref) {
              return 'disabled disable-link';
            }
          }
        }
      }
    }
  }

  checkDuplicateEntries(child, json) {
    let keys = [];
    let count = 0;
    for (let key in child) {
      keys[count] = key;
      count++;
    }
    for (let i = 0; i < json.length; i++) {
      let count1 = 0;
      for (let k = 0; k < keys.length; k++) {
        let temp = json[i];
        if (temp[keys[k]] === child[keys[k]]) {
          count1++;
        }
        if (count1 == keys.length) {
          return true;
        }
      }
    }
    return false;
  }

  printArray(rootchildrensattrArr) {
    this.nodes.push(rootchildrensattrArr);
    this.printArraya(true);
  }

  printArraya(flag) {
    if (!flag) {
      this.autoAddCount = 0;
    }
    this.xpath();
    this.AddKeyRefrencing();
    this.options = {
      displayField: 'ref',
      isExpandedField: 'expanded',
      idField: 'uuid',
      allowDrag: true,
      actionMapping: {
        mouse: {
          drop: (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => {
            if (this.dropCheck) {
              this.dropData(from, to);
            }
          },
          dragStart: (tree: TreeModel, node: TreeNode, $event: any) => {
            this.dragFrom = node.data;
          },
          dragOver: (tree: TreeModel, node: TreeNode, $event: any) => {
            this.dragTo = node.data;
            this.dropCheck = this.dragAnddropRules(this.dragFrom, this.dragTo);
          }
        }
      }
    };
    this.autoValidate();
  }

  // autoValidate 
  autoValidate() {
    if (this.nodes[0] && this.nodes[0].attributes && this.nodes[0].attributes.length > 0) {
      for (let i = 0; i < this.nodes[0].attributes.length; i++) {
        if (this.nodes[0].attributes[i].use === 'required') {
          if (this.nodes[0].attributes[i].data === undefined) {
            this.nonValidattribute = this.nodes[0].attributes[i];
            this.errorLocation = this.nodes[0];
            this.validConfig = false;
            return false;
          }
        }
      }
    }
    if (this.nodes[0] && this.nodes[0].values && this.nodes[0].values.length > 0) {
      if (this.nodes[0].values[0].data === undefined) {
        this.nonValidattribute = this.nodes[0].values[0];
        this.errorLocation = this.nodes[0];
        this.validConfig = false;
        return false;
      }
    }
    if (this.nodes[0] && this.nodes[0].children && this.nodes[0].children.length > 0) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        let x = this.autoValidateRecursion(this.nodes[0].children[i]);
        if (x == false) {
          return x;
        }
      }
    }
    this.nonValidattribute = {};
  }

  autoValidateRecursion(child) {
    if (child && child.attributes && child.attributes.length > 0) {
      for (let i = 0; i < child.attributes.length; i++) {
        if (child.attributes[i].use === 'required') {
          if (child.attributes[i].data === undefined) {
            this.nonValidattribute = child.attributes[i];
            this.errorLocation = child;
            this.validConfig = false;
            return false;
          }
        }
      }
    }
    if (child && child.values && child.values.length > 0) {
      if (child.values[0].data === undefined) {
        this.nonValidattribute = child.values[0];
        this.errorLocation = child;
        this.validConfig = false;
        return false;
      }
    }
    if (child && child.children && child.children.length > 0) {
      for (let i = 0; i < child.children.length; i++) {
        let x = this.autoValidateRecursion(child.children[i]);
        if (x == false) {
          return x;
        }
      }
    }
  }

  // drag and drop check
  dragAnddropRules(dragNode, dropNode) {
    if (dropNode.ref === dragNode.parent) {
      let count = 0;
      if (dragNode.maxOccurs === 'unbounded') {
        return true;
      } else if (dragNode.maxOccurs !== 'unbounded' && dragNode.maxOccurs !== undefined) {
        if (dropNode.children.length > 0) {
          for (let i = 0; i < dropNode.children.length; i++) {
            if (dragNode.ref === dropNode.children[i].ref) {
              count++;
            }
          }
          return dragNode.maxOccurs != count;
        } else if (dropNode.children.length === 0) {
          return true;
        }
      } else if (dragNode.maxOccurs === undefined) {
        if (dropNode.children.length > 0) {
          if (dropNode.children.length > 0) {
            return (dragNode.ref !== dropNode.children[0].ref);
          }
        } else if (dropNode.children.length === 0) {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // drop data
  dropData(from, to) {
    this.dropDataNode(from, to, this.treeCtrl);
    this.removeNode(from.data, this.treeCtrl);
    from.data.parentId = to.parent.data.uuid;
  }

  dropDataNode(from, to, tree) {
    to.parent.data.children.push(from.data);
    tree.treeModel.update();
    this.printArraya(false);
  }

  // to send data in details component
  getData(event) {
    setTimeout(() => {
      this.calcHeight();
    }, 1);
    if (event.keyref) {
      for (let i = 0; i < event.attributes.length; i++) {
        if (event.attributes[i].name === event.keyref) {
          this.getDataAttr(event.attributes[i].refer);
          break;
        }
      }
    }
    this.selectedNode = event;
    this.breadCrumbArray = [];
    this.createBreadCrumb(event);
    this.breadCrumbArray.reverse();
    if (this.preferences.expandOption === 'both') {
      const someNode = this.treeCtrl.treeModel.getNodeById(event.uuid);
      if (someNode) {
        someNode.expand();
      }
    }
  }

  // BreadCrumb
  createBreadCrumb(node) {
    if (this.nodes[0] && this.nodes[0].ref === node.parent && this.nodes[0].uuid === node.parentId) {
      this.breadCrumbArray.push(this.nodes[0]);
    } else {
      if (this.nodes[0] && this.nodes[0].children && this.nodes[0].children.length > 0) {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.createBreadCrumbRecursion(node, this.nodes[0].children[i]);
        }
      }
    }
  }

  createBreadCrumbRecursion(node, nodes) {
    if (nodes.ref === node.parent && nodes.uuid === node.parentId) {
      this.breadCrumbArray.push(nodes);
      this.createBreadCrumb(nodes);
    } else {
      if (nodes.children && nodes.children.length > 0) {
        for (let i = 0; i < nodes.children.length; i++) {
          this.createBreadCrumbRecursion(node, nodes.children[i]);
        }
      }
    }
  }

  // Expand automatically on add children
  autoExpand(exNode) {
    setTimeout(() => {
      const someNode = this.treeCtrl.treeModel.getNodeById(exNode.uuid);
      if (someNode) {
        someNode.expand();
      }
    }, 1);
  }

  // expand particular node
  expandNode(node) {
    const someNode = this.treeCtrl.treeModel.getNodeById(node.uuid);
    someNode.expand();
  }

  checkChoice(node) {
    if (this.childNode && this.childNode.length > 0) {
      let flg = true;
      for (let i = 0; i < this.childNode.length; i++) {
        if (this.childNode[i] && this.childNode[i].choice) {
          if (node.children && node.children.length > 0) {
            for (let j = 0; j < node.children.length; j++) {
              if (node.children[j].choice && node.children[j].ref === this.childNode[i].ref) {
                this.choice = true;
                flg = false;
                break;
              }
            }
            if(flg){
              this.choice = false;
            }
          } else {
            this.choice = false;
          }
        }
      }
    }
  }

// Collapse particular Node
  collapseNode(node) {
    const someNode = this.treeCtrl.treeModel.getNodeById(node.uuid);
    someNode.collapse();
  }

// Remove Node
  removeNode(node, tree) {
    if (node.parent === '#') {
      alert('Cannot Delete Root Node');
    } else {
      this.isNext = false;
      this.getParent(node, tree, this.nodes[0]);
    }
  }

  getParent(node, tree, list) {
    if (node.parentId === list.uuid && list.parent == '#') {
      this.deleteData(list.children, tree, node, list);
    } else {
      if (list.children) {
        for (let i = 0; i < list.children.length; i++) {
          if (node.parentId === list.children[i].uuid) {
            this.deleteData(list.children[i].children, tree, node, list.children[i]);
          } else {
            this.getParent(node, tree, list.children[i]);
          }
        }
      }
    }
  }

  deleteData(parentNode, tree, node, parent) {
    if (parentNode) {
      for (let i = 0; i < parentNode.length; i++) {
        if (node.ref === parentNode[i].ref && node.uuid == parentNode[i].uuid) {
          parentNode.splice(i, 1);
          tree.treeModel.update();
          this.printArraya(false);
          this.getData(parent);
          this.isNext = false;
        }
      }
      if (node.key) {
        if (this.nodes[0].keyref) {
          if (this.nodes[0].attributes.length > 0) {
            for (let i = 0; i < this.nodes[0].attributes.length; i++) {
              if (this.nodes[0].keyref === this.nodes[0].attributes[i].name) {
                for (let j = 0; j < node.attributes.length; j++) {
                  if (node.attributes[j].name == node.key) {
                    if (this.nodes[0].attributes[i].data == node.attributes[j].data) {
                      for (let key in this.nodes[0].attributes[i]) {
                        if (key == 'data') {
                          delete this.nodes[0].attributes[i][key];
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          if (this.nodes[0].children) {
            for (let i = 0; i < this.nodes[0].children.length; i++) {
              this.deleteKeyRefData(this.nodes[0].children[i], node);
            }
          }
        }
      }
    }
  }

  deleteKeyRefData(child, node) {
    if (child.keyref) {
      if (child.attributes.length > 0) {
        for (let i = 0; i < child.attributes.length; i++) {
          if (child.keyref === child.attributes[i].name) {
            for (let j = 0; j < node.attributes.length; j++) {
              if (node.attributes[j].name == node.key) {
                if (child.attributes[i].data == node.attributes[j].data) {
                  for (let key in child.attributes[i]) {
                    if (key == 'data') {
                      delete child.attributes[i][key];
                      break;
                    }
                  }
                }
                break;
              }
            }
          }
        }
      }
    } else {
      if (child.children) {
        for (let i = 0; i < child.children.length; i++) {
          this.deleteKeyRefData(child.children[i], node);
        }
      }
    }
  }

  // Cut Node
  cutNode(node) {
    this.copyItem = {};
    this.copyItem = Object.assign(this.copyItem, node);
    this.searchAndRemoveNode(node);
    this.cutData = true;
  }

  // searchNode
  searchAndRemoveNode(node) {
    if (node.parent === this.nodes[0].ref && node.parentId == this.nodes[0].uuid) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        if (node.uuid == this.nodes[0].children[i].uuid) {
          this.nodes[0].children.splice(i, 1);
        }
      }
    } else {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        this.searchAndRemoveNodeRecursion(node, this.nodes[0].children[i]);
      }
    }
  }

  // searchNodeRecursion
  searchAndRemoveNodeRecursion(node, child) {
    if (node.parent === child.ref && node.parentId == child.uuid) {
      for (let i = 0; i < child.children.length; i++) {
        if (node.uuid == child.children[i].uuid) {
          child.children.splice(i, 1);
        }
      }
    } else {
      for (let i = 0; i < child.children.length; i++) {
        this.searchAndRemoveNodeRecursion(node, child.children[i]);
      }
    }
  }

  // Copy Node
  copyNode(node) {
    for (let key in node) {
      if (typeof (node[key]) == 'object') {
        this.copyItem = Object.assign({}, this.copyItem, {[key]: []});
        if ((key === 'attributes' || key === 'values') && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let temp = {};
            for (let a in node[key][i]) {
              if (a == 'id') {
                temp = Object.assign(temp, {[a]: this.counting});
                this.counting++;
              } else {
                temp = Object.assign(temp, {[a]: node[key][i][a]});
              }
            }
            this.copyItem[key].push(Object.assign({}, temp));
          }
        } else if (key === 'children' && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let a = this.copyNodeRecursion(node[key][i]);
            this.copyItem[key].push(a);
          }
        } else if (key === 'text') {
          this.copyItem = Object.assign({}, this.copyItem, {[key]: node[key]});
        }
      } else {
        if (key === 'uuid') {
          this.copyItem = Object.assign({}, this.copyItem, {[key]: this.counting});
          this.counting++;
        } else {
          this.copyItem = Object.assign({}, this.copyItem, {[key]: node[key]});
        }
      }
    }
  }

  copyNodeRecursion(node) {
    let tempa = {};
    for (let key in node) {
      if (typeof (node[key]) == 'object') {
        tempa = Object.assign({}, tempa, {[key]: []});
        if ((key === 'attributes' || key === 'values') && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let temp = {};
            for (let a in node[key][i]) {
              if (a == 'id') {
                temp = Object.assign(temp, {[a]: this.counting});
                this.counting++;
              } else {
                temp = Object.assign(temp, {[a]: node[key][i][a]});
              }
            }
            tempa[key].push(Object.assign({}, temp));
          }
        } else if (key === 'children' && node[key].length > 0) {
          for (let i = 0; i < node[key].length; i++) {
            let a = this.copyNodeRecursion(node[key][i]);
            tempa[key].push(a);
          }
        } else if (key === 'text') {
          tempa = Object.assign({}, tempa, {[key]: node[key]});
        }
      } else {
        if (key === 'uuid') {
          tempa = Object.assign({}, tempa, {[key]: this.counting});
          this.counting++;
        } else {
          tempa = Object.assign({}, tempa, {[key]: node[key]});
        }
      }
    }
    return tempa;
  }

  // check rules before paste
  checkRules(pasteNode, copyNode) {
    if (copyNode !== undefined) {
      if (pasteNode.ref === copyNode.parent) {
        let count = 0;
        if (copyNode.maxOccurs === 'unbounded') {
          this.checkRule = true;
        } else if (copyNode.maxOccurs !== 'unbounded' && copyNode.maxOccurs !== undefined) {
          if (pasteNode.children.length > 0) {
            for (let i = 0; i < pasteNode.children.length; i++) {
              if (copyNode.ref === pasteNode.children[i].ref) {
                count++;
              }
            }
            this.checkRule = copyNode.maxOccurs != count;
          } else if (pasteNode.children.length === 0) {
            this.checkRule = true;
          }
        } else if (copyNode.maxOccurs === undefined) {
          if (pasteNode.children.length > 0) {
            for (let i = 0; i < pasteNode.children.length; i++) {
              this.checkRule = (copyNode.ref !== pasteNode.children[i].ref);
            }
          } else if (pasteNode.children.length === 0) {
            this.checkRule = true;
          }
        }
      } else {
        this.checkRule = false;
      }
    }
  }

  // Paste Node
  pasteNode(node) {
    node.children.push(this.copyItem);
    this.cutData = false;
    this.checkRule = true;
    this.printArraya(false);
  }

  // attibutes popover
  tooltip(node) {
    let count = 0;
    this.tooltipAttrData = '';
    if (node.attributes) {
      for (let i = 0; i < node.attributes.length; i++) {
        if (node.attributes[i].data) {
          count++;
          let temp = node.attributes[i].name;
          temp = temp + ' = ';
          temp = temp + node.attributes[i].data;
          if (node.attributes.length === count) {
            this.tooltipAttrData = this.tooltipAttrData + temp;
          } else {
            this.tooltipAttrData = this.tooltipAttrData + temp + ' | ';
          }
        }
      }
    }
  }

// Show all Child Nodes and search functionalities.
  showAllChildNode(node) {
    this.showAllChild = [];
    let _node = {ref: node.ref, parent: '#'};
    this.showAllChild.push(_node);
    this.getCNodes(_node);
    const modalRef = this.modalService.open(ShowChildModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.showAllChild = this.showAllChild;
    modalRef.result.then(() => {

    }, function () {

    });
  }

  getCNodes(node) {
    let rootChildChilds;
    if (this.doc.getElementsByTagName('xs:element') !== undefined) {
      rootChildChilds = this.doc.getElementsByTagName('xs:element');
    }
    let rootChildChildsarr = [];
    let childElement;
    let count = 0;
    for (let index = 0; index < rootChildChilds.length; index++) {
      if (rootChildChilds.item(index).getAttributeNode('name') !== undefined) {
        rootChildChildsarr[count] = rootChildChilds.item(index).getAttributeNode('name');
        count++;
        for (let j = 0; j < rootChildChildsarr.length; j++) {
          if (rootChildChildsarr[j].nodeValue === node.ref) {
            childElement = rootChildChildsarr[j].ownerElement;
          }
        }
      }
    }
    this.getChildNodes(childElement, node.ref, node);
  }

  getChildNodes(childElement, tagName, tempNode) {
    if (childElement && childElement.getElementsByTagName('xs:complexType') !== undefined) {
      let rootChildChilds = childElement.getElementsByTagName('xs:complexType');
      if (childElement.getElementsByTagName('xs:sequence').length !== 0) {
        rootChildChilds = childElement.getElementsByTagName('xs:sequence');
        this.getNode(rootChildChilds, tagName, tempNode);
      }
      if (childElement.getElementsByTagName('xs:choice').length !== 0) {
        rootChildChilds = childElement.getElementsByTagName('xs:choice');
        this.getNode(rootChildChilds, tagName, tempNode);
      }
      if (childElement.getElementsByTagName('xs:simpleType').length !== 0) {
        rootChildChilds = childElement.getElementsByTagName('xs:simpleType');
        this.getNode(rootChildChilds, tagName, tempNode);
      }
      if (childElement.getAttributeNode('type') !== undefined) {
        rootChildChilds = childElement.getAttributeNode('type');
        this.getTypeNode(rootChildChilds, tagName, tempNode);
      }
      if (childElement.getElementsByTagName('xs:extension').length > 0) {
        rootChildChilds = childElement.getElementsByTagName('xs:extension');
        if (rootChildChilds[0].getAttributeNode('base') !== undefined) {
          let x = rootChildChilds[0].getAttributeNode('base');
          if (x.nodeValue !== 'NotEmptyType' && x.nodeValue !== 'xs:anyURI') {
            this.getChildFromBase(x, tagName, tempNode);
          }
        }
      }
    }
  }

  getNode(rootChildChilds, tagName, tempNode) {
    let count = 0;
    let childs = [];
    let x;
    for (let i = 0; i < rootChildChilds.length; i++) {
      for (let j = 0; j < rootChildChilds[i].childNodes.length; j++) {
        if (rootChildChilds[i].childNodes[j].nodeType == 1) {
          childs[count] = rootChildChilds[i].childNodes[j];
          count = count + 1;
        }
      }
    }
    let rootchildrensattrArr = [];
    for (let index = 0; index < childs.length; index++) {
      let rootchildrensattr: any = {};
      for (let j = 0; j < childs[index].attributes.length; j++) {
        rootchildrensattr[childs[index].attributes[j].nodeName] = childs[index].attributes[j].nodeValue;
        if (x === tagName || x === undefined) {
          rootchildrensattr = Object.assign(rootchildrensattr, {parent: tagName, grandFather: tempNode.parent});
        } else {
          rootchildrensattr.parent = x;
        }
      }

      rootchildrensattrArr.push(rootchildrensattr);
      if (rootchildrensattr.ref) {
        if (!this.checkDuplicateEntries(rootchildrensattr, this.showAllChild)) {
          this.showAllChild.push(rootchildrensattr);
        }
      }
    }
    for (let i = 0; i < rootchildrensattrArr.length; i++) {
      if (rootchildrensattrArr[i].ref !== undefined) {
        this.getCNodes(rootchildrensattrArr[i]);
      }
    }
  }

  getChildFromBase(child, tagName, tempNode) {
    if (this.doc.getElementsByTagName('xs:complexType') !== undefined) {
      var rootChildChilds = this.doc.getElementsByTagName('xs:complexType');
    }
    let rootChildChildsarr = [];
    let childElement;
    let count = 0;
    for (let index = 0; index < rootChildChilds.length; index++) {
      if (rootChildChilds.item(index).getAttributeNode('name') !== undefined) {
        rootChildChildsarr[count] = rootChildChilds.item(index).getAttributeNode('name');
        count++;
        for (let j = 0; j < rootChildChildsarr.length; j++) {
          if (rootChildChildsarr[j].nodeValue === child.nodeValue) {
            childElement = rootChildChildsarr[j].ownerElement;
          }
        }
      }
    }
    this.getChildNodes(childElement, tagName, tempNode);
  }

  getTypeNode(rootChildChilds, tagName, tempNode) {
    let child = rootChildChilds.nodeValue;
    child = {type: child};
    this.getTChildNode(child.type, tagName, tempNode);
  }

  getTChildNode(child, tagName, tempNode) {
    if (this.doc.getElementsByTagName('xs:complexType') !== undefined) {
      var rootChildChilds = this.doc.getElementsByTagName('xs:complexType');
    }
    let rootChildChildsarr = [];
    let childElement;
    let count = 0;
    for (let index = 0; index < rootChildChilds.length; index++) {
      if (rootChildChilds.item(index).getAttributeNode('name') !== undefined) {
        rootChildChildsarr[count] = rootChildChilds.item(index).getAttributeNode('name');
        count++;
        for (let j = 0; j < rootChildChildsarr.length; j++) {
          if (rootChildChildsarr[j].nodeValue === child) {
            childElement = rootChildChildsarr[j].ownerElement;
          }
        }
      }
    }
    this.getChildNodes(childElement, tagName, tempNode);
  }


  // key and Key Ref Implementation code
  xpath() {
    let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
    let a;
    if (this.nodes[0]) {
      a = this.nodes[0].ref;
    }
    let keyPath = '/xs:schema/xs:element[@name=\'' + a + '\']/xs:key/@name';
    let keyRefPath = '/xs:schema/xs:element[@name=\'' + a + '\']/xs:keyref';
    let keyattrs: any = {};

    if (!this.keyRefNodes || this.keyRefNodes.length == 0) {
      this.keyRefNodes = select(keyRefPath, this.doc);
    }
    if (!this.keyNodes || this.keyNodes.length == 0) {
      this.keyNodes = select(keyPath, this.doc);
    }
    if (this.keyNodes.length > 0) {
      for (let i = 0; i < this.keyNodes.length; i++) {
        let key = this.keyNodes[i].nodeName;
        let value = this.strReplace(this.keyNodes[i].nodeValue);
        keyattrs = Object.assign(keyattrs, {[key]: value});
        for (let j = 0; j < this.keyNodes[i].ownerElement.childNodes.length; j++) {
          if (this.keyNodes[i].ownerElement.childNodes[j].nodeName === 'xs:field') {
            for (let k = 0; k < this.keyNodes[i].ownerElement.childNodes[j].attributes.length; k++) {
              keyattrs.key = this.strReplace(this.keyNodes[i].ownerElement.childNodes[j].attributes[k].nodeValue);
            }
            break;
          }
        }
        this.attachKey(keyattrs);
      }
    }
    if (this.keyRefNodes.length > 0) {
      for (let i = 0; i < this.keyRefNodes.length; i++) {
        this.getKeyRef(this.keyRefNodes[i]);
      }
    }
  }

  getKeyRef(keyRefNodes) {
    let attrs: any = {};
    for (let i = 0; i < keyRefNodes.attributes.length; i++) {
      let key = keyRefNodes.attributes[i].nodeName;
      let value = this.strReplace(keyRefNodes.attributes[i].nodeValue);
      attrs = Object.assign(attrs, {[key]: value});
      for (let j = 0; j < keyRefNodes.attributes[0].ownerElement.childNodes.length; j++) {
        if (keyRefNodes.attributes[0].ownerElement.childNodes[j].nodeName === 'xs:field') {
          for (let k = 0; k < keyRefNodes.attributes[0].ownerElement.childNodes[j].attributes.length; k++) {
            attrs.keyref = this.strReplace(keyRefNodes.attributes[0].ownerElement.childNodes[j].attributes[k].nodeValue);
          }
        }
      }
    }
    this.attachKeyRefNodes(attrs);
  }

  attachKey(key) {
    this.AddKeyAndKeyref(key);
  }

  attachKeyRefNodes(keyrefnodes) {
    this.AddKeyAndKeyref(keyrefnodes);
  }

  AddKeyAndKeyref(nodes) {
    let k = false;
    let keyre = false;
    for (let key in nodes) {
      if (key === 'key') {
        k = true;
        break;
      } else if (key === 'keyref') {
        keyre = true;
        break;
      }
    }
    if (this.nodes[0] && this.nodes[0].children) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        if (this.nodes[0].children[i].ref === nodes.name) {
          if (k) {
            this.nodes[0].children[i].key = nodes.key;
          } else if (keyre) {
            this.nodes[0].children[i].keyref = nodes.keyref;
          }
        } else {
          if (this.nodes[0].children[i].children) {
            recursion(nodes, this.nodes[0].children[i].children);
          }
        }
      }
    }


    function recursion(_nodes, child) {
      let ke = false;
      let keyref = false;
      for (let key in _nodes) {
        if (key === 'key') {
          ke = true;
          break;
        } else if (key === 'keyref') {
          keyref = true;
          break;
        }
      }
      for (let i = 0; i < child.length; i++) {
        if (child[i].ref === _nodes.name) {
          if (ke) {
            child[i].key = _nodes.key;
          } else if (keyref) {
            child[i].keyref = _nodes.keyref;
            if (child[i].attributes) {
              for (let j = 0; j < child[i].attributes.length; j++) {
                if (child[i].attributes[j].name === _nodes.keyref) {
                  child[i].attributes[j].refer = _nodes.refer;
                }
              }
            }
          }
        } else {
          if (child[i].children) {
            recursion(_nodes, child[i].children);
          }

        }
      }
    }
  }

  strReplace(data) {
    return data.replace(/(Key|@)/g, '');
  }

  AddKeyRefrencing() {
    let key = {};
    if (this.nodes[0] && this.nodes[0].keyref) {
      for (let i = 0; i < this.nodes[0].attributes.length; i++) {
        if (this.nodes[0].attributes[i].refer) {
          key = Object.assign(key, {refe: this.nodes[0].ref, name: this.nodes[0].attributes[i].refer});
          this.attachKeyRefrencing(key);
          break;
        }
      }
    } else {
      if (this.nodes[0] && this.nodes[0].children) {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.AddKeyRefrencingRecursion(this.nodes[0].children[i]);
        }
      }
    }
  }

  AddKeyRefrencingRecursion(child) {
    let key = {};
    if (child.keyref && child.attributes) {
      for (let i = 0; i < child.attributes.length; i++) {
        if (child.attributes[i].refer) {
          key = Object.assign(key, {refe: child.ref, name: child.attributes[i].refer});
          this.attachKeyRefrencing(key);
          if (child.children) {
            for (let i = 0; i < child.children.length; i++) {
              this.AddKeyRefrencingRecursion(child.children[i]);
            }
          }
          break;
        }
      }
    } else {
      if (child && child.children) {
        for (let i = 0; i < child.children.length; i++) {
          this.AddKeyRefrencingRecursion(child.children[i]);
        }
      }
    }
  }

  attachKeyRefrencing(key) {
    if (key.name) {
      if (this.nodes[0].ref === key.name && this.nodes[0].key) {
        for (let i = 0; i < this.nodes[0].attributes.length; i++) {
          if (this.nodes[0].attributes[i].name === this.nodes[0].key) {
            this.nodes[0].attributes[i].refElement = key.refe;
            break;
          }
        }
      } else {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.attachKeyRefrencingRecursion(key, this.nodes[0].children[i]);
        }
      }
    }
  }

  attachKeyRefrencingRecursion(key, child) {
    if (key.name) {
      if (child.ref === key.name && child.key && child.attributes) {
        for (let i = 0; i < child.attributes.length; i++) {
          if (child.attributes[i].name === child.key) {
            child.attributes[i].refElement = key.refe;
            break;
          }
        }
      } else {
        for (let i = 0; i < child.children.length; i++) {
          this.attachKeyRefrencingRecursion(key, child.children[i]);
        }
      }
    }
  }

  // details meathod
  onChange(event, nodes) {
    if (!(/[a-zA-Z0-9_]+.*$/.test(event))) {
      this.error = true;
    } else {
      if (event.match(/<[^>]+>/gm)) {
        let x = event.replace(/<[^>]+>/gm);

        if (x !== 'undefined&nbsp;undefined') {
          nodes.values[0] = Object.assign(nodes.values[0], {data: event});
          event = '';
          this.myContent = nodes.values[0].data;
          this.error = false;
        } else {
          delete nodes.values[0].data;
        }
      }
    }
  }

  // validation for attributes
  validateAttr(value, tag) {
    if (tag.type === 'xs:NMTOKEN') {
      if (/\s/.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.spaceNotAllowed;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value == '' && tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = false;
      }
    } else if (tag.type === 'xs:NCName') {

      if (/[\i:]|[:]/g.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.colonNotAllowed;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value == '' && tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = false;
      }
    } else if (tag.type === 'xs:string') {
      if (/[a-zA-Z0-9_]+.*$/.test(value)) {
        this.error = false;
      } else if (tag.use === 'required') {

        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value.length > 0) {
        this.error = true;
        this.text = tag.name + ': ' + this.cannotAddBlankSpace;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = false;
      }
    } else if (tag.type === 'xs:positiveInteger') {
      if (/[0-9]/.test(value)) {
        this.error = false;
        this.submitData(value, tag);
      } else if (tag.use === 'required' && value === '') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (/[a-zA-Z_*]/.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.onlyPositiveNumbers;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = true;
        this.text = tag.name + ': ' + this.cannotNegative;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      }
    } else {
      tag = Object.assign(tag, {data: value});
      this.autoValidate();
    }
  }

  submitData(value, tag) {
    if (tag.type === 'xs:NMTOKEN') {
      if (/\s/.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.spaceNotAllowed;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value == '' && tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ':' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        this.autoValidate();
      }
    } else if (tag.type === 'xs:NCName') {
      if (/[\i:]|[:]/g.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.colonNotAllowed;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value == '' && tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        this.autoValidate();
      }
    } else if (tag.type === 'xs:string') {
      if (/[a-zA-Z0-9_]+.*$/.test(value)) {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        this.autoValidate();
      } else if (tag.use === 'required') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value.length > 0) {
        this.error = true;
        this.text = tag.name + ': ' + this.cannotAddBlankSpace;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = false;
      }
    } else if (tag.type === 'xs:positiveInteger') {
      if (/[0-9]/.test(value)) {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        this.autoValidate();
      } else if (tag.use === 'required' && value === '') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (/[a-zA-Z_*]/.test(value)) {
        this.error = true;
        this.text = tag.name + ': ' + this.onlyPositiveNumbers;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else {
        this.error = true;
        this.text = tag.name + ': ' + this.cannotNegative;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      }
    } else {
      if (/[0-9]/.test(value)) {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        this.autoValidate();
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (tag.use === 'required' && value === '') {
        this.error = true;
        this.text = tag.name + ': ' + this.requiredField;
        this.errorName = tag.name;
        if (tag.data !== undefined) {
          for (let key in tag) {
            if (key == 'data') {
              delete tag[key];
              this.autoValidate();
            }
          }
        }
      } else if (value == '') {
        tag = Object.assign(tag, {data: tag.defalut});
        this.autoValidate();
      }
    }
  }

// validation for node value property
  validValue(value, ref, tag) {
    this.error = false;
    if (/[a-zA-Z0-9_]+.*$/.test(value)) {
      this.error = false;
    } else if (ref == 'FileSpec' || ref == 'Directory') {
      if (/[(a-zA-Z0-9_*./)]+.*$/.test(value)) {
        this.error = false;
      }
    } else {
      this.error = true;
      this.text = 'Required Field';
      this.errorName = ref;
      if (tag.data !== undefined) {
        for (let key in tag) {
          if (key == 'data') {
            delete tag[key];
            this.autoValidate();
          }
        }
      }
    }
  }

  submitValue(value, ref, tag) {
    if (/[a-zA-Z0-9_]+.*$/.test(value)) {
      this.error = false;
      tag = Object.assign(tag, {data: value});
      this.autoValidate();
    } else if (ref == 'FileSpec' || ref == 'Directory') {
      if (/[(a-zA-Z0-9_*./)]+.*$/.test(value)) {
        this.error = false;
        tag = Object.assign(tag, {data: value});
        this.autoValidate();
      }
    } else {
      this.error = true;
      this.text = this.requiredField;
      this.errorName = ref;
      if (tag.data !== undefined) {
        for (let key in tag) {
          if (key == 'data') {
            this.autoValidate();
            delete tag[key];
          }
        }
      }
    }
  }

  getDataAttr(refer) {
    this.tempArr = [];
    let temp;
    for (let i = 0; i < this.nodes[0].children.length; i++) {
      if (this.nodes[0].children[i].ref === refer) {
        if (this.nodes[0].children[i].key) {
          temp = this.nodes[0].children[i].key;
          for (let j = 0; j < this.nodes[0].children[i].attributes.length; j++) {
            if (this.nodes[0].children[i].attributes[j].name === temp) {
              if (this.nodes[0].children[i].attributes[j] && this.nodes[0].children[i].attributes[j].data) {
                this.tempArr.push(this.nodes[0].children[i].attributes[j].data);
              }
            }
          }
        }
      } else {
        if (this.nodes[0].children[i].children) {
          this.keyrecursion(refer, this.nodes[0].children[i].children);
        }
      }
    }
  }

  keyrecursion(refer, childNode) {
    let temp;
    for (let i = 0; i < childNode.length; i++) {
      if (childNode[i].ref === refer) {
        if (childNode[i].key) {
          temp = childNode[i].key;
          for (let j = 0; j < childNode[i].attributes.length; j++) {
            if (childNode[i].attributes[j].name === temp) {
              if (childNode[i].attributes[j] && childNode[i].attributes[j].data) {
                this.tempArr.push(childNode[i].attributes[j].data);
              }
            }
          }
        }
      } else {
        if (this.nodes[0].children[i] && this.nodes[0].children[i].children) {
          this.keyrecursion(refer, childNode[i].children);
        }
      }
    }
  }

  // link gotokey
  gotoKey(node) {
    if (node !== undefined) {
      if (node.refer === this.nodes[0].ref) {
        if (this.nodes[0].key) {
          for (let i = 0; i < this.nodes[0].attributes.length; i++) {
            if (this.nodes[0].attributes[i].name === this.nodes[0].key) {
              if (node.data === this.nodes[0].attributes[i].data) {
                this.getData(this.nodes[0]);
                this.selectedNode = this.nodes[0];
                this.refElement = node;
              }
            }
          }
        } else {
          for (let i = 0; i < this.nodes[0].children.length; i++) {
            this.gotoKeyRecursion(node, this.nodes[0].children[i]);
          }
        }
      } else {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.gotoKeyRecursion(node, this.nodes[0].children[i]);
        }
      }
    }
  }

  gotoKeyRecursion(node, child) {
    if (node !== undefined) {
      if (node.refer === child.ref) {
        if (child.key) {
          for (let i = 0; i < child.attributes.length; i++) {
            if (child.attributes[i].name === child.key) {
              if (node.data === child.attributes[i].data) {
                this.getData(child);
                this.selectedNode = child;
                this.refElement = node;
              }
            }
          }
        } else {
          for (let i = 0; i < child.children.length; i++) {
            this.gotoKeyRecursion(node, child.children[i]);
          }
        }
      } else {
        for (let i = 0; i < child.children.length; i++) {
          this.gotoKeyRecursion(node, child.children[i]);
        }
      }
    }
  }

  gotoKeyref(node) {
    if (node !== undefined) {
      if (node.refElement === this.nodes[0].ref) {
        if (this.nodes[0].keyref) {
          for (let i = 0; i < this.nodes[0].attributes.length; i++) {
            if (this.nodes[0].attributes[i].name === this.nodes[0].keyref) {
              if (node.data === this.nodes[0].attributes[i].data) {
                this.getData(this.nodes[0]);
                this.selectedNode = this.nodes[0];
              }
            }
          }
        } else {
          for (let i = 0; i < this.nodes[0].children.length; i++) {
            this.gotoKeyrefRecursion(node, this.nodes[0].children[i]);
          }
        }
      } else if (this.refElement && this.refElement.parent === this.nodes[0].ref) {
        if (this.nodes[0].keyref) {
          for (let i = 0; i < this.nodes[0].attributes.length; i++) {
            if (this.nodes[0].attributes[i].name === this.nodes[0].keyref) {
              if (node.data === this.nodes[0].attributes[i].data) {
                this.getData(this.nodes[0]);
                this.selectedNode = this.nodes[0];
              }
            }
          }
        } else {
          for (let i = 0; i < this.nodes[0].children.length; i++) {
            this.gotoKeyrefRecursion(node, this.nodes[0].children[i]);
          }
        }
      } else {
        for (let i = 0; i < this.nodes[0].children.length; i++) {
          this.gotoKeyrefRecursion(node, this.nodes[0].children[i]);
        }
      }
    }
  }

  gotoKeyrefRecursion(node, child) {
    if (node !== undefined) {
      if (node.refElement === child.ref) {
        if (child.keyref) {
          for (let i = 0; i < child.attributes.length; i++) {
            if (child.attributes[i].name === child.keyref) {
              if (node.data === child.attributes[i].data) {
                this.selectedNode = child;
                this.getData(child);
              }
            }
          }
        } else {
          for (let i = 0; i < child.children.length; i++) {
            this.gotoKeyrefRecursion(node, child.children[i]);
          }
        }
      } else if (this.refElement && this.refElement.parent === child.ref) {
        if (child.keyref) {
          for (let i = 0; i < child.attributes.length; i++) {
            if (child.attributes[i].name === child.keyref) {
              if (node.data === child.attributes[i].data) {
                this.selectedNode = child;
                this.getData(child);
              }
            }
          }
        } else {
          for (let i = 0; i < child.children.length; i++) {
            this.gotoKeyrefRecursion(node, child.children[i]);
          }
        }
      } else {
        for (let i = 0; i < child.children.length; i++) {
          this.gotoKeyrefRecursion(node, child.children[i]);
        }
      }
    }
  }

  // import xml model
  importXML() {
    const modalRef = this.modalService.open(ImportModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.result.then((res: any) => {
      if (res) {
        this.selectedXsd = res.xsd;
        sessionStorage.setItem('$SOS$XSD', this.selectedXsd);
        this.reassignSchema();
        setTimeout(() => {
          this.createJsonfromXml(res.data);
        }, 600);
      }
    }, function () {

    });
  }

  // open new Confimation model
  newFile() {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {backdrop: 'static', size: 'sm'});
    modalRef.componentInstance.save = this.save2;
    modalRef.componentInstance.assignXsd = this.newXsdAssign;
    modalRef.componentInstance.self = this;
    modalRef.result.then((res) => {
      sessionStorage.removeItem('$SOS$XSD');
      sessionStorage.removeItem('xsd');
    }, function () {
    });
  }

  newXsdAssign(self) {
    self.nodes = [];
    self.selectedNode = [];
    self.submitXsd = false;
  }

  getpos(id) {
    $('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover focus manual',
      html: true,
      delay: {'show': 500, 'hide': 200}
    });
    const a = '#' + id;
    $(a).tooltip('show');
  }

  // create Xml from Json
  showXml() {
    let xml = this._showXml();
    const modalRef = this.modalService.open(ShowModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.xml = xml;
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason);
    });
  }

  jsonToXml() {
    let doc = document.implementation.createDocument('', '', null);
    let peopleElem = doc.createElement(this.nodes[0].ref);
    if (this.nodes[0].attributes && this.nodes[0].attributes.length > 0) {
      for (let i = 0; i < this.nodes[0].attributes.length; i++) {
        if (this.nodes[0].attributes[i].data) {
          peopleElem.setAttribute(this.nodes[0].attributes[i].name, this.nodes[0].attributes[i].data);
        }
      }
    }
    if (this.nodes[0] && this.nodes[0].values && this.nodes[0].values.length >= 0) {
      for (let i = 0; i < this.nodes[0].values.length; i++) {
        if (this.nodes[0].values[0].data) {
          peopleElem.createCDATASection(this.nodes[0].values[0].data);
        }
      }
    }
    if (this.nodes[0].children && this.nodes[0].children.length > 0) {
      for (let i = 0; i < this.nodes[0].children.length; i++) {
        this.createChildJson(peopleElem, this.nodes[0].children[i], doc.createElement(this.nodes[0].children[i].ref), doc);
      }
    }
    return peopleElem;
  }

  createChildJson(node, childrenNode, curentNode, doc) {
    if (childrenNode && childrenNode.attributes) {
      for (let i = 0; i < childrenNode.attributes.length; i++) {
        if (childrenNode.attributes[i].data) {
          curentNode.setAttribute(childrenNode.attributes[i].name, childrenNode.attributes[i].data);
        }
      }
    }
    if (childrenNode && childrenNode.values && childrenNode.values.length >= 0) {
      for (let i = 0; i < childrenNode.values.length; i++) {
        if (childrenNode.values[i].data) {
          let a = doc.createCDATASection(childrenNode.values[i].data);
          if (a) {
            curentNode.appendChild(a);
          }
        }
      }
    }
    if (childrenNode.children && childrenNode.children.length > 0) {
      for (let i = 0; i < childrenNode.children.length; i++) {
        this.createChildJson(curentNode, childrenNode.children[i], doc.createElement(childrenNode.children[i].ref), doc);
      }
    }
    node.appendChild(curentNode);
  }

  // save xml
  save() {
    let xml = this._showXml();
    let name = this.nodes[0].ref + '.xml';
    let fileType = 'application/xml';
    let blob = new Blob([xml], {type: fileType});
    saveAs(blob, name);
  }

  save2(self) {
    self.save();
    self.nodes = [];
    self.selectedNode = [];
    self.submitXsd = false;
  }

  // validate xml
  validate() {
    this.autoValidate();

    if (_.isEmpty(this.nonValidattribute)) {
      this.validConfig = true;
      this.successPopToast();
    } else {
      this.popToast(this.nonValidattribute);
      if (this.nonValidattribute.name) {
        this.validateAttr('', this.nonValidattribute);
      }
    }
  }

  // toaster pop toast
  popToast(node) {
    let msg = '';
    if (node && node.name) {
      msg = 'Attribute "' + node.name + '" cannot be empty';

    } else {
      msg = 'cannot be empty';
    }
    this.toasterService.pop('error', 'Element : ' + node.parent, msg);
  }

  successPopToast() {
    this.toasterService.pop('success', 'Element : ' + this.nodes[0].ref, 'XML is valid');
  }

  // goto error location
  gotoErrorLocation() {
    if (this.errorLocation && this.errorLocation.ref) {
      this.getData(this.errorLocation);
      this.selectedNode = this.errorLocation;
      this.errorLocation = {};
    }
  }

  // create json from xml
  createJsonfromXml(data) {
    let result1: any = convert.xml2json(data, {
      compact: true,
      spaces: 4,
      ignoreDeclaration: true,
      ignoreComment: true,
      alwaysChildren: true
    });
    let rootNode;
    let r_node;
    let x: any = JSON.parse(result1);
    for (let key in x) {
      rootNode = key;
    }
    let json = this.createTempJson(x, rootNode);
    for (let key in json) {
      r_node = key;
    }
    if (this.nodes[0] && this.nodes[0].ref === rootNode) {
      this.createJsonAccToXsd(json, r_node, this.nodes[0]);
    } else {
      this.nodes = [{}];
      this.createNormalTreeJson(json, r_node, this.nodes[0], '#');
    }
  }

  createTempJson(editJson, rootNode) {
    let temp: any = {};
    if (_.isArray(editJson[rootNode])) {
      for (let i = 0; i < editJson[rootNode].length; i++) {
        temp = Object.assign(temp, {[rootNode]: editJson[rootNode][i]});
      }
    } else {
      for (let a in editJson[rootNode]) {
        if (a == '_text') {
          a = '_cdata';
        }
        if (a == '_attributes' || a == '_cdata') {
          if (temp[rootNode] == undefined) {
            temp = Object.assign(temp, {[rootNode]: {[a]: editJson[rootNode][a]}});
          } else {
            temp[rootNode] = Object.assign(temp[rootNode], {[a]: editJson[rootNode][a]});
          }
        } else {
          if (_.isArray(editJson[rootNode][a])) {
            for (let i = 0; i < editJson[rootNode][a].length; i++) {
              let x = a + '*' + i;
              if (temp[rootNode] == undefined) {
                temp = Object.assign(temp, {[rootNode]: {[x]: {}}});
              } else {
                temp[rootNode] = Object.assign(temp[rootNode], {[x]: {}});
              }
              for (let key in editJson[rootNode][a][i]) {
                this.createTempJsonRecursion(key, temp[rootNode][x], editJson[rootNode][a][i]);
              }
            }
          } else {
            if (temp[rootNode] == undefined) {
              temp = Object.assign(temp, {[rootNode]: {[a]: {}}});
              for (let key in editJson[rootNode][a]) {
                this.createTempJsonRecursion(key, temp[rootNode][a], editJson[rootNode][a]);
              }
            } else {
              temp[rootNode] = Object.assign(temp[rootNode], {[a]: {}});
              for (let key in editJson[rootNode][a]) {
                this.createTempJsonRecursion(key, temp[rootNode][a], editJson[rootNode][a]);
              }
            }
          }
        }
      }
    }
    this.isLoading = false;
    return temp;
  }

  createTempJsonRecursion(key, tempArr, editJson) {
    if (key == '_text') {
      key = '_cdata';
    }
    if (key == '_attributes' || key == '_cdata') {
      tempArr = Object.assign(tempArr, {[key]: editJson[key]});
    } else {
      if (editJson && _.isArray(editJson[key])) {
        for (let i = 0; i < editJson[key].length; i++) {
          let x = key + '*' + i;
          tempArr = Object.assign(tempArr, {[x]: {}});
          if (editJson) {
            for (let as in editJson[key][i]) {
              this.createTempJsonRecursion(as, tempArr[x], editJson[key][i]);
            }
          }
        }
      } else {
        tempArr = Object.assign(tempArr, {[key]: {}});
        if (editJson) {
          for (let x in editJson[key]) {
            this.createTempJsonRecursion(x, tempArr[key], editJson[key]);
          }
        }
      }
    }
  }

  createJsonAccToXsd(xmljson, rootNode, mainjson) {
    mainjson.children = [];
    if (xmljson[rootNode] && xmljson[rootNode]._attributes !== undefined) {
      for (let key in xmljson[rootNode]._attributes) {
        if (mainjson && mainjson.attributes) {
          for (let i = 0; i < mainjson.attributes.length; i++) {
            if (key === mainjson.attributes[i].name) {
              let a = xmljson[rootNode]._attributes[key];
              mainjson.attributes[i] = Object.assign(mainjson.attributes[i], {data: a});
            }
          }
        }
      }
    }
    if (xmljson[rootNode] && xmljson[rootNode]._cdata !== undefined) {
      mainjson.values[0] = Object.assign(mainjson.values[0], {data: xmljson[rootNode]._cdata});
    }

    for (let key in xmljson[rootNode]) {
      if (key !== '_attributes' && key !== '_cdata') {
        this.addChildForxml(key, rootNode, xmljson, mainjson);
      }
    }
  }

  addChildForxml(key, rootNode, xmljson, mainjson) {
    let a;
    if (key.indexOf('*')) {
      a = key.split('*')[0];
    }
    this.checkChildNode(mainjson);
    for (let i = 0; i < this.childNode.length; i++) {
      if (a === this.childNode[i].ref) {
        this.childNode[i].import = key;
        this.addChild(this.childNode[i], mainjson, false);
      }
    }
    for (let i = 0; i < mainjson.children.length; i++) {
      if (mainjson.children[i].ref == a && mainjson.children[i].import == key) {
        this.createJsonAccToXsd(xmljson[rootNode], key, mainjson.children[i]);
      }
    }
  }

  // create json if xsd not matched
  createNormalTreeJson(xmljson, rootNode, mainjson, parent) {
    let temp = {};
    this.getData(temp);
    let a = undefined;
    if (rootNode.indexOf('*')) {
      a = rootNode.split('*')[0];
    }
    if (a == undefined) {
      mainjson = Object.assign(mainjson, {ref: rootNode, parent: parent});
    } else {
      mainjson = Object.assign(mainjson, {ref: a, parent: parent, import: rootNode});
    }
    for (let key in xmljson[rootNode]) {
      if (key === '_attributes') {
        mainjson = Object.assign(mainjson, {attributes: []});
        for (let x in xmljson[rootNode]._attributes) {
          let dat = xmljson[rootNode]._attributes[x];
          let temp1 = {};
          temp1 = Object.assign(temp1, {name: x, data: dat, parent: rootNode});
          mainjson.attributes.push(temp1);
        }
      }
    }
    for (let key in xmljson[rootNode]) {
      if (key !== '_attributes' && key !== '_cdata') {
        if (!mainjson.children) {
          mainjson = Object.assign(mainjson, {children: []});
        }
        this.addChildToNormal(key, rootNode, xmljson, mainjson);
      }
    }
  }

  addChildToNormal(key, rootNode, xmljson, mainjson) {
    let temp: any = {};
    let a = undefined;
    if (key.indexOf('*')) {
      a = key.split('*')[0];
    }
    if (a == undefined) {
      temp = Object.assign(temp, {ref: key, parent: rootNode, import: key});
    } else {
      temp = Object.assign(temp, {ref: a, parent: rootNode, import: key});
    }
    mainjson.children.push(temp);
    for (let i = 0; i < mainjson.children.length; i++) {
      if (mainjson.children[i].ref === a && mainjson.children[i].import == key) {
        this.createNormalTreeJson(xmljson[rootNode], key, mainjson.children[i], rootNode);
      }
    }
  }

  removeTag(data) {
    if (data && data.data && data.data.match(/<[^>]+>/gm)) {
      let x = data.data.replace(/<[^>]+>/gm, '');
      x = x.replace('&nbsp;', ' ');
      return x;
    } else {
      return data.data;
    }
  }

  addCkCss(id) {
    setTimeout(() => {
      $(('#') + id + (' .ck.ck-editor__main>.ck-editor__editable:not(.ck-focused)')).addClass('invalid');
    }, 1);
  }

  removeCkCss(id) {
    setTimeout(() => {
      $(('#') + id + (' .ck.ck-editor__main>.ck-editor__editable:not(.ck-focused)')).removeClass('invalid');
    }, 1);
  }

  addContent(data) {
    if (data && data[0] && data[0].data !== undefined) {
      this.myContent = data[0].data;
    } else {
      this.myContent = '';
    }
  }

  passwordLabel(password) {
    if (password !== undefined) {
      let x = password.length;
      let a = '';
      for (let i = 0; i < x; i++) {
        a = a + '*';
      }
      return a;
    }
  }

  calcHeight() {
    let a = $('.top-header-bar').outerHeight(true);
    let b = $('.navbar').outerHeight(true);
    let c = $('.white').outerHeight(true);
    let d = $('.attr').outerHeight(true);
    let e = $('.val').outerHeight(true);
    let f = $(window).outerHeight(true);

    if ((d == null || d == 'null') && (e == null || e == 'null')) {

      let x = f - a - b - c - 160;
      $('.documents').css({
        'max-height': x + 'px'
      });
    } else if ((d == null || d == 'null') && (e !== null || e !== 'null')) {
      let x = f - a - b - c - e - 160;
      $('.documents').css({
        'max-height': x + 'px'
      });
    } else if ((d !== null || d !== 'null') && (e == null || e == 'null')) {
      let x = f - a - b - c - d - 160;
      if (x > 300) {
        $('.documents').css({
          'max-height': x + 'px'
        });
      } else {
        $('.documents').css({
          'max-height': 300 + 'px'
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.autoSave();
    this.coreService.tabs._configuration.state = 'xml';
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunload($event) {
    this.autoSave();
    return true;
  }

  private _showXml() {
    let xml = this.jsonToXml();
    let xmlAsString = new XMLSerializer().serializeToString(xml);
    let a = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>`;
    a = a.concat(xmlAsString);
    return vkbeautify.xml(a);
  }

  private autoSave() {
    if (this.nodes[0] && this.nodes[0].ref) {
      let a = this._showXml();
      sessionStorage.setItem('xsd', a);
    } else {
      sessionStorage.removeItem('xsd');
    }
  }
}