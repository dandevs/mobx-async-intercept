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
    target: ObservableMap<K, V>,
    change: (change: IMapWillChange<K, V>) => Promise<IMapWillChange<K, V>>
): Lambda;

export function interceptAsync(
    target: Object,
    change: (change: IObjectWillChange) => Promise<IObjectWillChange>
): Lambda;

export function interceptAsync<T extends Object, K extends keyof T, F>(
    target: T,
    property: K,
    change: (change: IValueWillChange<T[K]>) => Promise<IValueWillChange<T[K]>>
): Lambda;
// #endregion

export function interceptAsync(
    target:            any,
    handlerOrProperty: ((change: any) => Promise<any>)|string,
    handlerBackfill?:  (change: any) => Promise<any>
){
    let handler:        (change: any) => Promise<any>,
        property:       string,
        acceptedChange: any,
        activePromise:  Promise<any>;

    if (typeof handlerOrProperty === "string") {
        handler = handlerBackfill;
        property = handlerOrProperty as string;
    }
    else
        handler = handlerOrProperty as any;

    const interceptor = (change) => {
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
                target[property||handlerChange.name] = 0;

            else if (isObservableArray(target))
                target.push(0);

            else if (isObservableMap(target))
                target.set(handlerChange.name, 0);

            else if (isBoxedObservable(target))
                target.set(0);
        });

        return null;
    };

    const disposer = property ?
        intercept(target, property, interceptor) :
        intercept(target, interceptor);

    return disposer;
}

export default interceptAsync;