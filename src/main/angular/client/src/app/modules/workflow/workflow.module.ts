import { NgModule } from '@angular/core';
import { WorkflowComponent } from './workflow.component';
import {SharedModule} from '../shared/shared.module';
import {WorkflowRoutingModule} from './workflow-routing.module';

@NgModule({
  imports: [
    SharedModule,
    WorkflowRoutingModule
  ],
  declarations: [WorkflowComponent]
})
export class WorkflowModule { }
