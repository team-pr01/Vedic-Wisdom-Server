"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrencyCode = void 0;
/**
 * Converts a currency symbol or string to its standard ISO 4217 3-letter code.
 * Defaults to "BDT" if the currency is unrecognized or empty.
 */
const getCurrencyCode = (currencyInput) => {
    if (!currencyInput)
        return "BDT";
    const currency = currencyInput.trim().toUpperCase();
    // If it's already a 3-letter code (e.g., USD, BDT, EUR), return it
    if (/^[A-Z]{3}$/.test(currency)) {
        return currency;
    }
    // Map common symbols to ISO codes
    const currencyMap = {
        "$": "USD",
        "US$": "USD",
        "€": "EUR",
        "£": "GBP",
        "₹": "INR",
        "৳": "BDT",
        "BDT": "BDT", // Just in case
        "¥": "JPY",
        "C$": "CAD",
        "A$": "AUD",
        "CHF": "CHF",
        "﷼": "SAR",
        "د.إ": "AED",
    };
    // Return the mapped 3-letter code, or fallback to BDT
    return currencyMap[currencyInput] || currencyMap[currency] || "BDT";
};
exports.getCurrencyCode = getCurrencyCode;
