"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
function interceptAsync(target, handler) {
    let accepted = false;
    let activePromise;
    mobx_1.intercept(target, (change) => {
        if (accepted) {
            return change;
            accepted = false;
        }
        const thisPromise = activePromise = handler(change).then(handlerChange => {
            if (thisPromise !== activePromise || handlerChange === null)
                return;
            accepted = true;
            target[handlerChange.name] = handlerChange.newValue;
        });
        return null;
    });
}
exports.interceptAsync = interceptAsync;
