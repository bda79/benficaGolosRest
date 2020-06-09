const i18n = require('../startup/i18n.config');

class LocalService {
    constructor(i18n) {
        this.i18nProvider = i18n;
    }

    getCurrentLocale() {
        return this.i18nProvider.getLocale();
    }

    getLocales() {
        return this.i18nProvider.getLocales();
    }

    setLocale(locale) {
        if (this.getLocales().indexOf(locale) !== -1) {
          this.i18nProvider.setLocale(locale)
        }
    }

    translate(string, args = undefined) {
        return this.i18nProvider.__(string, args)
    }
}

module.exports = new LocalService(i18n);