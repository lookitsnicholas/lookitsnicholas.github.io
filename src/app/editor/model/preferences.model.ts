import { EditorThemeModel } from "../interface/editor-theme.interface"

export class PreferencesModel {

	constructor(
		public newLineStr: string,
		public theme: EditorThemeModel
	) { }

}