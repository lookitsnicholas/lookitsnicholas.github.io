import { Injectable } from "@angular/core"
import { Subject } from "rxjs"
import { SubselectionMouseOverInterface } from "../interface/subselection-mouse-over.interface"

@Injectable({
	providedIn: "root"
})
export class EditorService {

	subselectionMouseOverSubject = new Subject<SubselectionMouseOverInterface>()
	subselectionMouseLeaveSubject = new Subject<MouseEvent>()

}