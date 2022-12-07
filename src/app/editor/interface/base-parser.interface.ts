import { BaseParserResultModel } from "../model/base-parser-result.model"
import { PreferencesModel } from "../model/preferences.model"

export interface BaseParserInterface {

	parse(
		preferences: PreferencesModel,
		sourceStr: string
	): BaseParserResultModel

}