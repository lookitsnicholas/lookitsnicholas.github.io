import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { EditorComponent } from "./editor/component/editor/editor.component"

const routes: Routes = [
  {
    component: EditorComponent,
    path: ""
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }