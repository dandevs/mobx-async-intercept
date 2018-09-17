import { intercept, IObjectWillChange } from "mobx";

export function interceptAsync(
    target: any,
    handler: (change: IObjectWillChange) => Promise<HandlerOutput>,
){
    let accepted = false;
    let activePromise: Promise<any>;

    const disposer = intercept(target as {}, (change) => {
        if (accepted) {
            return change;
            accepted = false;
        }

        const thisPromise = activePromise = handler(change).then(handlerChange => {
            if (thisPromise !== activePromise || handlerChange === null || !handlerChange)
                return;

            accepted = true;
            target[handlerChange.name] = ((handlerChange || change) as any).newValue;
        });

        return null;
    });

    return disposer;
}

type HandlerOutput = IObjectWillChange|null;
export default interceptAsync;