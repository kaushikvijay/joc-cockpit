import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';
import {EmptyDataComponent} from '../../components/empty-data/empty-data.component';
import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {CommonModule} from '@angular/common';
import {NzResultModule} from 'ng-zorro-antd/result';
import {FormsModule} from '@angular/forms';
import {
  DecodeSpacePipe,
  SafeHtmlPipe,
  StringDatePipe
} from '../../filters/filter.pipe';
import {ConfigurationModalComponent} from '../../components/configuration-modal/configuration.component';
import {SubLinkComponent} from '../resource/sub-link/sub-link.component';
import {BreadcrumbsComponent} from '../../components/breadcrumbs/breadcrumbs.component';
import {TypeComponent} from '../../components/workflow-type/type.component';

const MODULES = [CommonModule, FormsModule, NgbModalModule, NzDropDownModule, NzResultModule, TranslateModule, NzEmptyModule];
const PIPES = [StringDatePipe, DecodeSpacePipe, SafeHtmlPipe];
const EXPORTS = [...PIPES,  EmptyDataComponent, SubLinkComponent, BreadcrumbsComponent, TypeComponent];
const COMPONENTS = [ConfigurationModalComponent];
@NgModule({
  imports: [
    ...MODULES,
    RouterModule
  ],
  declarations: [
    ...COMPONENTS,
    ...EXPORTS
  ],
  exports: [...MODULES, ...EXPORTS],
  entryComponents: [...COMPONENTS]
})
export class Shared2Module {
}
