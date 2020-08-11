import {Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-agent-cluster',
  templateUrl: './agent-cluster.component.html',
})
export class AgentClusterComponent implements OnDestroy, OnChanges {
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() copyObj: any;

  agentCluster: any = {};
  isUnique = true;
  objectType = 'AGENTCLUSTER';

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.agentCluster.actual) {
      this.saveJSON();
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.agentCluster = {};
      }
    }
  }

  ngOnDestroy() {
    if (this.agentCluster.name) {
      this.saveJSON();
    }
  }

  addCriteria(): void {
    let param = {
      url: ''
    };
    if (this.agentCluster.configuration.hosts) {
      if (!this.coreService.isLastEntryEmpty(this.agentCluster.configuration.hosts, 'url', '')) {
        this.agentCluster.configuration.hosts.push(param);
      }
    }
  }

  removeCriteria(index): void {
    this.agentCluster.configuration.hosts.splice(index, 1);
  }

  private getObject() {
    const _path  = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
    this.coreService.post('inventory/read/configuration', {
      jobschedulerId: this.schedulerId,
      objectType: this.objectType,
      path: _path,
      id: this.data.id,
    }).subscribe((res: any) => {
      this.agentCluster = res;
      this.agentCluster.path1 = this.data.path;
      this.agentCluster.name = this.data.name;
      this.agentCluster.actual = res.configuration;
      this.agentCluster.configuration = JSON.parse(res.configuration);
      if (!this.agentCluster.configuration.hosts) {
        this.agentCluster.configuration.hosts = [];
      }
      if (this.agentCluster.configuration.hosts.length === 0) {
        this.addCriteria();
      }
    });
  }

  rename () {
    this.coreService.post('inventory/rename', {
      id: this.data.id,
      name: this.agentCluster.name
    }).subscribe((res) => {
      this.data.name = this.agentCluster.name;
    }, (err) => {
      this.agentCluster.name = this.data.name;
    });
  }

  private saveJSON() {
    if (this.agentCluster.actual !== JSON.stringify(this.agentCluster.configuration)) {
      const _path  = this.agentCluster.path1 + (this.agentCluster.path1 === '/' ? '' : '/') + this.agentCluster.name;
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: JSON.stringify(this.agentCluster.configuration),
        path: _path,
        id: this.agentCluster.id,
        objectType: this.objectType
      }).subscribe(res => {
        console.log(res);
      }, (err) => {
        console.log(err);
      });
    }
  }
}
