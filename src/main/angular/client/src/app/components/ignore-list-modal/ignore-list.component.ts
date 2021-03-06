import {Component, Input, OnInit} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'ngbd-modal-content',
     templateUrl: './ignore-list.component.html'
})
export class EditIgnoreListModal {

  @Input() savedIgnoreList: any;
  @Input() historyFilters: any;
  @Input() action: Function;
  @Input() self;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }

 removeOrderIgnoreList(name) {
/*    this.savedIgnoreList.orders.splice(this.savedIgnoreList.orders.indexOf(name), 1);
    configObj.configurationType = "IGNORELIST";
    configObj.configurationItem = JSON.stringify(this.savedIgnoreList);
    configObj.id = this.ignoreListConfigId;
    UserService.saveConfiguration(configObj).then(function (res) {
      this.ignoreListConfigId = res.id;
    });
    if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
      if ((jobChainSearch && this.historyFilters.type == 'jobChain')) {
        this.search(true);
      } else
        this.init();
    }*/
  }

  removeJobChainIgnoreList(name) {
/*    this.savedIgnoreList.jobChains.splice(this.savedIgnoreList.jobChains.indexOf(name), 1);
    configObj.configurationType = "IGNORELIST";
    configObj.configurationItem = JSON.stringify(this.savedIgnoreList);
    configObj.id = this.ignoreListConfigId;
    UserService.saveConfiguration(configObj).then(function (res) {
      this.ignoreListConfigId = res.id;
    });
    if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
      if ((jobChainSearch && this.historyFilters.type == 'jobChain')) {
        this.search(true);
      } else
        this.init();
    }*/
  }

  removeJobIgnoreList(name) {
/*    this.savedIgnoreList.jobs.splice(this.savedIgnoreList.jobs.indexOf(name), 1);
    configObj.configurationType = "IGNORELIST";
    configObj.configurationItem = JSON.stringify(this.savedIgnoreList);
    configObj.id = this.ignoreListConfigId;
    UserService.saveConfiguration(configObj).then(function (res) {
      this.ignoreListConfigId = res.id;
    });
    if ((this.savedIgnoreList.isEnable == 'true' || this.savedIgnoreList.isEnable == true)) {
      if ((jobSearch && this.historyFilters.type != 'jobChain')) {
        this.search(true);
      } else
        this.init();
    }*/
  }
}
