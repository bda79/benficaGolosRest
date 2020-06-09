const localeService = require('../service/localeService');

module.exports = (msg, lng) => {
    
    if (lng) return translate(msg, lng);

    return translate(msg);
}

function translate(msg) {
    return translate(msg, null);
}

function translate(msg, lng) {
    const currentLocale = localeService.getCurrentLocale();
    if (lng != null && lng != currentLocale) {
        localeService.setLocale(lng);
    }

    return localeService.translate(msg);
}