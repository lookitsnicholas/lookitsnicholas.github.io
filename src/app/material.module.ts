import { NgModule } from "@angular/core"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatSelectModule } from "@angular/material/select"
import { MatSidenavModule } from "@angular/material/sidenav"
import { MatTabsModule } from "@angular/material/tabs"
import { MatToolbarModule } from "@angular/material/toolbar"

const materialModules = [
	MatButtonModule,
	MatIconModule,
	MatSelectModule,
	MatSidenavModule,
	MatTabsModule,
	MatToolbarModule
]

@NgModule({
	imports: [
		...materialModules
	],
	exports: [
		...materialModules
	],
})

export class MaterialModule { }