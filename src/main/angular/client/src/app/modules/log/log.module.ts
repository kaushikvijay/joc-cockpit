import {NgModule} from '@angular/core';
import {LogComponent} from './log.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  declarations: [LogComponent]
})
export class LogModule {
}