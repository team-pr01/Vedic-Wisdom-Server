"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plans = void 0;
exports.Plans = {
    free: {
        id: "free",
        aiChatDaily: 5,
        aiRecipesMonthly: 5,
        vastuAiMonthly: 0,
        kundliMonthly: 0,
        muhurtaMonthly: 0,
        ads: true,
    },
    basic: {
        id: "basic",
        aiChatDaily: 20,
        aiRecipesMonthly: 20,
        vastuAiMonthly: 5,
        kundliMonthly: 5,
        muhurtaMonthly: 5,
        ads: false,
    },
    pro: {
        id: "pro",
        aiChatDaily: 50,
        aiRecipesMonthly: 50,
        vastuAiMonthly: 20,
        kundliMonthly: 20,
        muhurtaMonthly: 20,
        ads: false,
    },
    premium: {
        id: "premium",
        aiChatDaily: Infinity,
        aiRecipesMonthly: Infinity,
        vastuAiMonthly: Infinity,
        kundliMonthly: Infinity,
        muhurtaMonthly: Infinity,
        ads: false,
    },
};
