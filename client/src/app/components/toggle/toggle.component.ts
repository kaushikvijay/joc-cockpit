import { Component, OnInit,Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toggle',
  template: `
          <div class="btn-group m-l-sm">
            <button class="btn btn-grey btn-sm" [ngClass]="{'btn-primary': pageView=='grid'}" (click)="setView('grid')"><i class="fa fa-th"></i>
            </button>
            <button class="btn btn-grey btn-sm"  [ngClass]="{'btn-primary': pageView=='list'}" (click)="setView('list')"><i class="fa fa-bars"></i>
            </button>
        </div>
        `
})
export class ToggleComponent implements OnInit {

    view:string = 'list';
    pageView:string;
    views:any = {};

    @Output() messageEvent = new EventEmitter<string>();

    constructor(public router:Router) {

    }

    ngOnInit() {
        this.views = {
            dailyPlan: this.view,
            jobChain: this.view,
            job: this.view,
            order: this.view,
            agent: this.view,
            lock: this.view,
            processClass: this.view,
            schedule: this.view,
            calendar: this.view,
            jobChainOrder: this.view,
            orderOverView: this.view,
            jobOverView: this.view,
            permission: this.view
        };
        if (sessionStorage.preferences) {
            if (JSON.parse(sessionStorage.preferences).pageView) {
                this.view = JSON.parse(sessionStorage.preferences).pageView;
            }
        }
        if (!localStorage.views) {
            localStorage.views = JSON.stringify(this.views);
        } else {
            this.views = JSON.parse(localStorage.views);
        }
        if (this.router.url === '/daily_plan') {
            this.pageView = this.views.dailyPlan;
        } else if (this.router.url === '/job_chain') {
            this.pageView = this.views.jobChain;
        } else if (this.router.url === '/job') {
            this.pageView = this.views.job;
        } else if (this.router.url === '/order') {
            this.pageView = this.views.order;
        } else if (this.router.url.match('/resource/agent_cluster')) {
            this.pageView = this.views.agent;
        } else if (this.router.url === '/resource/lock') {
            this.pageView = this.views.lock;
        } else if (this.router.url === '/resource/process_class') {
            this.pageView = this.views.processClass;
        } else if (this.router.url === '/resource/calendar') {
            this.pageView = this.views.calendar || this.view;
        } else if (this.router.url.match('/job_chain_detail/')) {
            this.pageView = this.views.jobChainOrder;
        } else if (this.router.url.match('/orders_overview')) {
            this.pageView = this.views.orderOverView;
        } else if (this.router.url.match('/tasks_overview')) {
            this.pageView = this.views.jobOverView || 'list';
        } else if (this.router.url.match('/users/')) {
            this.pageView = this.views.permission;
        } else {
            this.pageView = this.view;
        }

    }


    setView(view) {
        this.pageView = view;
        if (this.router.url === '/daily_plan') {
            this.views.dailyPlan = view;
        } else if (this.router.url === '/job_chain') {
            this.views.jobChain = view;
        } else if (this.router.url === '/job') {
            this.views.job = view;
        } else if (this.router.url === '/order') {
            this.views.order = view;
        } else if (this.router.url.match('/resource/agent_cluster')) {
            this.views.agent = view;
        } else if (this.router.url === '/resource/lock') {
            this.views.lock = view;
        } else if (this.router.url === '/resource/process_class') {
            this.views.processClass = view;
        } else if (this.router.url === '/resource/calendar') {
            this.views.calendar = view || this.view;
        } else if (this.router.url.match('/job_chain_detail/')) {
            this.views.jobChainOrder = view;
        } else if (this.router.url.match('/orders_overview')) {
            this.views.orderOverView = view;
        } else if (this.router.url.match('/tasks_overview')) {
            this.views.jobOverView = view;
        } else if (this.router.url.match('/users/')) {
            this.views.permission = view;
        }
        localStorage.views = JSON.stringify(this.views);
        this.messageEvent.emit(this.pageView)
    }

}
