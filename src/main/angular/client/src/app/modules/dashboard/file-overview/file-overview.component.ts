import {Component, OnInit, OnDestroy} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-file-overview',
  templateUrl: './file-overview.component.html'
})
export class FileOverviewComponent implements OnInit, OnDestroy {
  yadeOverview: any = {};
  schedulerIds: any = {};
  notAuthenticate = false;
  isLoaded = false;
  subscription: Subscription;

  constructor(public authService: AuthService, public coreService: CoreService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'YADEFileStateChanged') {
              this.getSnapshot();
              break;
            }
          }
        }
        break;
      }
    }
  }

  getSnapshot(): void {
    this.coreService.post('yade/overview/snapshot', {jobschedulerId: this.schedulerIds.selected}).subscribe(res => {
      this.yadeOverview = res;
      this.isLoaded = true;
    }, (err) => {
      this.notAuthenticate = !err.isPermitted;
      this.isLoaded = true;
    });
  }

  ngOnInit() {
    this.yadeOverview = {transfers: {}};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if(this.schedulerIds.selected) {
      this.getSnapshot();
    }else{
      this.notAuthenticate = true;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
