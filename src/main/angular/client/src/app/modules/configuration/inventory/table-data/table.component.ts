import {Component, Input} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from 'src/app/services/core.service';
import {DataService} from 'src/app/services/data.service';
import {ConfirmModalComponent} from '../../../../components/comfirm-modal/confirm.component';
import * as _ from 'underscore';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html'
})
export class TableComponent {
  @Input() schedulerId: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() dataObj: any;
  @Input() objectType: any;
  @Input() copyObj: any;
  searchKey: any;
  filter: any = {sortBy: 'name', reverse: false};

  constructor(public coreService: CoreService, private modalService: NgbModal, private dataService: DataService) {
  }

  add() {
    let name_type, configuration = {};
    if (this.objectType === 'WORKFLOW') {
      name_type = 'workflow';
    } else if (this.objectType === 'JUNCTION') {
      name_type = 'junction';
      configuration = {lifetime: 60};
    } else if (this.objectType === 'AGENTCLUSTER') {
      name_type = 'agent-cluster';
      configuration = {maxProcesses: 1};
    } else if (this.objectType === 'JOBCLASS') {
      name_type = 'job-class';
      configuration = {maxProcesses: 1};
    } else if (this.objectType === 'ORDER') {
      name_type = 'order';
    } else if (this.objectType === 'LOCK') {
      name_type = 'lock';
    } else if (this.objectType === 'CALENDAR') {
      name_type = 'calendar';
      configuration = {type: 'WORKING_DAYS'};
    }
    const name = this.coreService.getName(this.dataObj.children, name_type + '1', 'name', name_type);
    const _path = this.dataObj.path + (this.dataObj.path === '/' ? '' : '/') + name;
    let obj: any = {
      type: this.objectType,
      name: name,
      path: this.dataObj.path
    };
    if (!this.dataObj.path) {
      return;
    }
    if (this.objectType === 'ORDER') {
      configuration = {orderTemplateName: name, jobschedulerId: this.schedulerId};
    }
    this.coreService.post('inventory/store', {
      jobschedulerId: this.schedulerId,
      objectType: this.objectType,
      path: _path,
      valid: !(this.objectType === 'ORDER' || this.objectType === 'AGENTCLUSTER' || this.objectType === 'WORKFLOW'),
      configuration: configuration
    }).subscribe((res: any) => {
      obj.id = res.id;
      obj.valid = !(this.objectType === 'ORDER' || this.objectType === 'AGENTCLUSTER' || this.objectType === 'WORKFLOW');
      this.dataObj.children.push(obj);
      this.dataObj.children = [...this.dataObj.children];
      this.dataService.reloadTree.next({add: true});
    });
  }

  paste() {
    this.dataService.reloadTree.next({paste: this.dataObj});
  }

  copyObject(data) {
    this.dataService.reloadTree.next({copy: data});
  }

  editObject(data) {
    this.dataService.reloadTree.next({set: data});
  }

  removeObject(object) {
    let _path;
    if (object.path === '/') {
      _path = object.path + object.name;
    } else {
      _path = object.path + '/' + object.name;
    }

    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteObject';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = _path;
    modalRef.result.then((res: any) => {
      this.deleteObject(_path, object);
    }, () => {

    });
  }

  deleteDraft(object) {
    let _path;
    if (object.path === '/') {
      _path = object.path + object.name;
    } else {
      _path = object.path + '/' + object.name;
    }

    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteDraftObject';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = _path;
    modalRef.result.then((res: any) => {
      this.coreService.post('inventory/deletedraft', {
        jobschedulerId: this.schedulerId,
        objectType: object.type,
        path: _path,
        id: object.id
      }).subscribe((res: any) => {
        for (let i = 0; i < this.dataObj.children.length; i++) {
          if (this.dataObj.children[i].id === object.id) {
            this.dataObj.children.splice(i, 1);
            break;
          }
        }
        this.dataObj.children = [...this.dataObj.children];
        this.dataService.reloadTree.next({reload: true});
      });
    }, () => {

    });
  }

  restoreObject(data) {
    this.dataService.reloadTree.next({restore: data});
  }

  deployObject(data) {
    this.dataService.reloadTree.next({deploy: data});
  }

  sort(sort: { key: string; value: string }): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = sort.key;
  }

  private deleteObject(_path, object) {
    this.coreService.post('inventory/delete', {
      id: object.id
    }).subscribe((res: any) => {
      object.deleted = true;
      this.dataService.reloadTree.next({reload: true});
    });
  }

}
