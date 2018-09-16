import { intercept, IObjectWillChange } from "mobx";

export function interceptAsync(
    target: any,
    handler: (change: IObjectWillChange) => Promise<HandlerOutput>,
){
    let accepted = false;
    let activePromise: Promise<any>;

    intercept(target as {}, (change) => {
        if (accepted) {
            return change;
            accepted = false;
        }

        const thisPromise = activePromise = handler(change).then(handlerChange => {
            if (thisPromise !== activePromise || handlerChange === null)
                return;

            accepted = true;
            target[handlerChange.name] = (handlerChange as any).newValue;
        });

        return null;
    });
}

type HandlerOutput = IObjectWillChange|null;