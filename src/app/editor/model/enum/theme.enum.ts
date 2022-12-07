import { checkAliasType } from "../../../util/type-utils"

export const ThemeEnum = ({
	DARK: "DARK",
	LIGHT: "LIGHT",
	PURPLE: "PURPLE"
} as const)

export type ThemeEnumType = keyof typeof ThemeEnum
export type ThemeAliasType = Record<ThemeEnumType, string>

export const ThemeAliases = checkAliasType<ThemeAliasType>()({
	DARK: "Dark",
	LIGHT: "Light",
	PURPLE: "Purple"
} as const)