import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';

@Component({
  selector: 'app-job-class',
  templateUrl: './job-class.component.html',
  styleUrls: ['./job-class.component.css']
})
export class JobClassComponent implements OnDestroy, OnChanges {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;
  @Input() copyObj: any;

  jobClass: any = {};
  isUnique = true;
  objectType = 'JOBCLASS';
  priorities = ['idle', 'below normal', 'normal', 'above normal', 'high'];

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.jobClass.actual) {
      this.saveJSON();
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.jobClass = {};
      }
    }
  }

  ngOnDestroy() {
    if (this.jobClass.name) {
      this.saveJSON();
    }
  }

  private getObject() {
    this.coreService.post('inventory/read/configuration', {
      id: this.data.id,
    }).subscribe((res: any) => {
      this.jobClass = res;
      this.jobClass.path1 = this.data.path;
      this.jobClass.name = this.data.name;
      this.jobClass.actual = JSON.stringify(res.configuration);
    });
  }

  rename() {
    this.coreService.post('inventory/rename', {
      id: this.data.id,
      name: this.jobClass.name
    }).subscribe((res) => {
      this.data.name = this.jobClass.name;
      this.dataService.reloadTree.next({rename: true});
    }, (err) => {
      this.jobClass.name = this.data.name;
    });
  }

  deploy() {
    this.dataService.reloadTree.next({deploy: this.jobClass});
  }

  backToListView() {
    this.dataService.reloadTree.next({back: this.jobClass});
  }

  saveJSON() {
    if (this.jobClass.actual !== JSON.stringify(this.jobClass.configuration)) {
      const _path = this.jobClass.path1 + (this.jobClass.path1 === '/' ? '' : '/') + this.jobClass.name;
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: this.jobClass.configuration,
        path: _path,
        valid: !!this.jobClass.configuration.maxProcesses,
        id: this.jobClass.id,
        objectType: this.objectType
      }).subscribe(res => {
        if (this.jobClass.id === this.data.id) {
          this.jobClass.actual = JSON.stringify(this.jobClass.configuration);
          this.jobClass.valid = !!this.jobClass.configuration.maxProcesses;
          this.data.valid = this.jobClass.valid;
        }
      }, (err) => {
        console.log(err);
      });
    }
  }
}
