import { checkAliasType } from "../../../util/type-utils"

export const ParserLanguageEnum = ({
	HTML: "HTML",
	// JAVASCRIPT: "JAVASCRIPT",
	PLAINTEXT: "PLAINTEXT"
} as const)

export type ParserLanguageEnumType = keyof typeof ParserLanguageEnum
export type ParserLanguageAliasType = Record<ParserLanguageEnumType, string>

export const ParserLanguageAliases = checkAliasType<ParserLanguageAliasType>()({
	HTML: "HTML",
	// JAVASCRIPT: "JavaScript",
	PLAINTEXT: "Plain Text"
} as const)