export default {
	en: () => import("ajv-i18n/localize/en").then((v) => v.default),
	ar: () => import("ajv-i18n/localize/ar").then((v) => v.default),
	ca: () => import("ajv-i18n/localize/ca").then((v) => v.default),
	cs: () => import("ajv-i18n/localize/cs").then((v) => v.default),
	de: () => import("ajv-i18n/localize/de").then((v) => v.default),
	es: () => import("ajv-i18n/localize/es").then((v) => v.default),
	fi: () => import("ajv-i18n/localize/fi").then((v) => v.default),
	fr: () => import("ajv-i18n/localize/fr").then((v) => v.default),
	hu: () => import("ajv-i18n/localize/hu").then((v) => v.default),
	id: () => import("ajv-i18n/localize/id").then((v) => v.default),
	it: () => import("ajv-i18n/localize/it").then((v) => v.default),
	ja: () => import("ajv-i18n/localize/ja").then((v) => v.default),
	ko: () => import("ajv-i18n/localize/ko").then((v) => v.default),
	nb: () => import("ajv-i18n/localize/nb").then((v) => v.default),
	nl: () => import("ajv-i18n/localize/nl").then((v) => v.default),
	pl: () => import("ajv-i18n/localize/pl").then((v) => v.default),
	"pt-BR": () => import("ajv-i18n/localize/pt-BR").then((v) => v.default),
	ru: () => import("ajv-i18n/localize/ru").then((v) => v.default),
	sk: () => import("ajv-i18n/localize/sk").then((v) => v.default),
	sv: () => import("ajv-i18n/localize/sv").then((v) => v.default),
	th: () => import("ajv-i18n/localize/th").then((v) => v.default),
	zh: () => import("ajv-i18n/localize/zh").then((v) => v.default),
	"zh-TW": () => import("ajv-i18n/localize/zh-TW").then((v) => v.default)
};
