import {
    intercept,
    IObjectWillChange,
    isObservableObject,
    isObservableArray,
    isObservableMap,
    isBoxedObservable,
    IValueWillChange,
    IArrayWillChange,
    IMapWillChange,
    IObservableValue,
    IObservableObject,
    IObservableArray,
    ObservableMap,
    IArrayWillSplice,
    Lambda
} from "mobx";

// #region Overloads
type ArrayHandlerType<T> = IArrayWillChange<T>|IArrayWillSplice<T>;

export function interceptAsync<T>(
    target: IObservableValue<T>,
    change: (change: IValueWillChange<T>) => Promise<IValueWillChange<T>>
): Lambda;

export function interceptAsync<T>(
    target: IObservableArray<T>,
    change: (change: ArrayHandlerType<T>) => Promise<ArrayHandlerType<T>>
): Lambda;

export function interceptAsync<K, V>(
    target: ObservableMap<K, V>|Map<K, V>,
    change: (change: IMapWillChange<K, V>) => Promise<IMapWillChange<K, V>>
): Lambda;

export function interceptAsync(
    target: IObservableObject,
    change: (change: IObjectWillChange) => Promise<IObjectWillChange>
): Lambda;
// #endregion

export function interceptAsync(
    target: any,
    handler: (change: any) => Promise<any>,
){
    let acceptedChange;
    let activePromise: Promise<any>;

    const disposer = intercept(target as any, (change) => {
        if (acceptedChange) {
            const t = acceptedChange;
            acceptedChange = undefined;
            return t;
        }

        const thisPromise = activePromise = handler(change).then((handlerChange: any) => {
            if (thisPromise !== activePromise || handlerChange === null || !handlerChange)
                return;

            acceptedChange = handlerChange;

            if (isObservableObject(target))
                target[handlerChange.name] = Math.random();

            else if (isObservableArray(target))
                target.push(0);

            else if (isObservableMap(target))
                target.set(handlerChange.name, Math.random());

            else if (isBoxedObservable(target))
                target.set(Math.random());
        });

        return null;
    });

    return disposer;
}

type HandlerOutput = IObjectWillChange|IValueWillChange<any>|IArrayWillChange|IMapWillChange|null;
export default interceptAsync;