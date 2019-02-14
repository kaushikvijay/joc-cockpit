import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ConfigurationComponent} from './configuration.component';
import {XmlEditorComponent} from './xml-editor/xml-editor.component';
import {JoeComponent} from './joe/joe.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      {path: 'joe', component: JoeComponent},
      {path: 'xml', component: XmlEditorComponent}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule {
}
