import { BaseParserInterface } from "../../interface/base-parser.interface"
import { BaseParserResultModel } from "../base-parser-result.model"
import { CharacterNodeModel } from "../character-node.model"
import { EditorOutlineNodeModel } from "../editor-outline-node.model"
import { EditorRowModel } from "../editor-row.model"
import { PreferencesModel } from "../preferences.model"

export class PlaintextParserModel implements BaseParserInterface {

	parse(
		preferences: PreferencesModel,
		sourceStr: string
	): BaseParserResultModel {

		const newLineStrLength = preferences.newLineStr.length
		const rowAndColumns = [
			new EditorRowModel(
				0,
				0,
				[]
			)
		]
		let currentRow = rowAndColumns[0]
		let i = 0
		while ((i < sourceStr.length)) {
			const currentChar = sourceStr.charAt(i)
			const seekAheadReturnStr = sourceStr.slice(i, (i + newLineStrLength))
			if ((preferences.newLineStr === seekAheadReturnStr)) {
				currentRow.endSourceIndex += newLineStrLength
				i += newLineStrLength
				rowAndColumns.push(
					new EditorRowModel(
						currentRow.endSourceIndex,
						currentRow.endSourceIndex,
						[]
					)
				)
				currentRow = rowAndColumns[(rowAndColumns.length - 1)]
			} else {
				currentRow.editorNodes.push(
					new CharacterNodeModel(
						currentChar,
						preferences.theme.text,
						null
					)
				)
				currentRow.endSourceIndex++
				i++
			}
		}

		return new BaseParserResultModel(
			false,
			new EditorOutlineNodeModel("Plain Text", 0, (sourceStr.length - 1), []),
			rowAndColumns
		)

	}


}