"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = require("loader-utils");
const querystring_1 = require("querystring");
const json5_1 = __importDefault(require("json5"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const loader = function (source, sourceMap) {
    const options = (0, loader_utils_1.getOptions)(this);
    const locales = normalizeLocales(options.locales);
    if (this.version && Number(this.version) >= 2) {
        try {
            this.cacheable && this.cacheable();
            this.callback(null, `module.exports = ${generateCode(source, (0, querystring_1.parse)(this.resourceQuery), locales)}`, sourceMap);
        }
        catch (err) {
            if (err instanceof Error) {
                this.emitError(err.message);
                this.callback(err);
            }
        }
    }
    else {
        const message = 'support webpack 2 later';
        this.emitError(message);
        this.callback(new Error(message));
    }
};
function normalizeLocales(locales) {
    if (typeof locales === 'string') {
        return [locales];
    }
    if (!Array.isArray(locales)) {
        return [];
    }
    return locales.map(String);
}
function generateCode(source, query, locales) {
    const data = convert(source, query.lang);
    let value = JSON.parse(data);
    if (query.locale && typeof query.locale === 'string') {
        value = Object.assign({}, { [query.locale]: value });
    }
    if (locales.length > 0) {
        for (const key in value) {
            if (!locales.includes(key)) {
                delete value[key];
            }
        }
    }
    value = JSON.stringify(value)
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029')
        .replace(/\\/g, '\\\\');
    let code = '';
    code += `function (Component) {
  Component.options.__i18n = Component.options.__i18n || []
  Component.options.__i18n.push('${value.replace(/\u0027/g, '\\u0027')}')
  delete Component.options._Ctor
}\n`;
    return code;
}
function convert(source, lang) {
    const value = Buffer.isBuffer(source) ? source.toString() : source;
    switch (lang) {
        case 'yaml':
        case 'yml':
            const data = js_yaml_1.default.safeLoad(value);
            return JSON.stringify(data, undefined, '\t');
        case 'json5':
            return JSON.stringify(json5_1.default.parse(value));
        default:
            return value;
    }
}
exports.default = loader;
