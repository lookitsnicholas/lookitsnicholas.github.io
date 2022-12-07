import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"

import { FormsModule } from "@angular/forms"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { AppRoutingModule } from "./app-routing.module"
import { AppComponent } from "./app.component"
import { EditorOutlineNodeComponent } from "./editor/component/editor-outline-node/editor-outline-node.component"
import { EditorComponent } from './editor/component/editor/editor.component'
import { SafePipe } from "./editor/pipe/safe.pipe"
import { MaterialModule } from "./material.module"

@NgModule({
	declarations: [
		AppComponent,
		EditorComponent,
		EditorOutlineNodeComponent,
		SafePipe
	],
	imports: [
		AppRoutingModule,
		BrowserAnimationsModule,
		BrowserModule,
		FormsModule,
		MaterialModule
	],
	providers: [],
	bootstrap: [AppComponent]
})

export class AppModule { }