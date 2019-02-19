import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { CoreService } from '../../services/core.service';
import { AuthService } from '../../components/guard';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    providers: [CoreService]
})
export class LoginComponent implements OnInit {

  user: any = {};
  schedulerIds: any = {};
  submitted = false;
  rememberMe = false;
  errorMsg = false;
  returnUrl: string;

  constructor(private route: ActivatedRoute, private router: Router, public coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit() {
    if (localStorage.$SOS$REMEMBER === 'true' || localStorage.$SOS$REMEMBER === true) {
      const urs = crypto.AES.decrypt(localStorage.$SOS$FOO.toString(), '$SOSJOBSCHEDULER2');
      const pwd = crypto.AES.decrypt(localStorage.$SOS$BOO.toString(), '$SOSJOBSCHEDULER2');
      this.user.userName = urs.toString(crypto.enc.Utf8);
      this.user.password = pwd.toString(crypto.enc.Utf8);
      this.rememberMe = true;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  private getComments(): void {
    let result: any;
    this.coreService.post('audit_log/comments', {}).subscribe(res => {
      result = res;
      sessionStorage.$SOS$FORCELOGING = result.forceCommentsForAuditLog;
      sessionStorage.comments = JSON.stringify(result.comments);
    });
  }

  private getPermissions(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.coreService.post('security/joc_cockpit_permissions', {jobschedulerId: this.schedulerIds.selected}).subscribe((permission) => {
      this.authService.setPermissions(permission);
      this.authService.savePermission(this.schedulerIds.selected);
      this.authService.save();
      if (this.schedulerIds) {
        this.authService.savePermission(this.schedulerIds.selected);
      } else {
        this.authService.savePermission('');
      }
      this.submitted = false;
      this.router.navigateByUrl(this.returnUrl);
    }, () => {
      this.submitted = false;
    });
  }

  private getSchedulerIds(): void {
    this.coreService.post('jobscheduler/ids', {}).subscribe((res) => {
      this.authService.setIds(res);
      this.authService.save();
      this.getComments();
      this.getPermissions();
    }, () => {
      this.getPermissions();
    });
  }

  onSubmit(values): void {
    this.submitted = true;
    this.errorMsg = false;
    this.coreService.post('security/login', values).subscribe((data) => {
      this.authService.rememberMe = this.rememberMe;
      if (this.rememberMe) {
        const urs = crypto.AES.encrypt(values.userName, '$SOSJOBSCHEDULER2');
        const pwd = crypto.AES.encrypt(values.password, '$SOSJOBSCHEDULER2');
        localStorage.$SOS$FOO = urs;
        localStorage.$SOS$BOO = pwd;
        localStorage.$SOS$REMEMBER = this.rememberMe;
      } else {
        localStorage.removeItem('$SOS$FOO');
        localStorage.removeItem('$SOS$BOO');
        localStorage.removeItem('$SOS$REMEMBER');
      }
      this.authService.setUser(data);
      this.authService.save();
      this.getSchedulerIds();
    }, () => {
      this.submitted = false;
      this.errorMsg = true;
    });
  }
}
