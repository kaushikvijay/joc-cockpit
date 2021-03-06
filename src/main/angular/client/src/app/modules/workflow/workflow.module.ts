import { NgModule } from '@angular/core';
import {FilterModalComponent, SearchComponent, WorkflowComponent} from './workflow.component';
import {SharedModule} from '../shared/shared.module';
import {WorkflowRoutingModule} from './workflow-routing.module';
import {WorkflowService} from '../../services/workflow.service';

@NgModule({
    imports: [
        SharedModule,
        WorkflowRoutingModule
    ],
    providers: [WorkflowService],
    declarations: [WorkflowComponent, FilterModalComponent, SearchComponent],
    entryComponents: [
        FilterModalComponent
    ]
})
export class WorkflowModule { }
