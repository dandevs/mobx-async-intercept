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

export function interceptAsync<T extends Object, K extends keyof T>(
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
        acceptedChange: any;

    const changedIndexes = new Map(),
          targetType     = getTargetType(target);

    if (typeof handlerOrProperty === "string") {
        handler = handlerBackfill;
        property = handlerOrProperty as string;
    }
    else
        handler = handlerOrProperty as any;

    const interceptor = (change: any) => {
        if (acceptedChange) {
            const t = acceptedChange;
            acceptedChange = undefined;
            return t;
        }

        const updateByIndex = (index: string | number, updateType: "index" | "map" | "box" = "index") => {
            const thisPromise = handler(change).then((handlerChange: any) => {
                if (changedIndexes.get(index) !== thisPromise)
                    return;

                acceptedChange = handlerChange;

                switch (updateType) {
                    case "index":
                        target[index] = 0;
                        break;

                    case "map": case "box":
                        target.set(index, 0);
                }
            });

            changedIndexes.set(index, thisPromise);
        };

        switch (targetType) {
            case TargetType.OBJECT:
                updateByIndex(property || change.name);
                break;

            case TargetType.ARRAY:
                updateByIndex(change.index);
                break;

            case TargetType.MAP:
                updateByIndex(change.name, "map");
                break;

            case TargetType.BOX:
                updateByIndex(change.name, "box");
                break;
        }

        return null;
    };

    const disposer = property ?
        intercept(target, property, interceptor) :
        intercept(target, interceptor);

    return disposer;
}

function getTargetType(target: any) {
    if (isObservableObject(target))
        return TargetType.OBJECT;

    else if (isObservableArray(target))
        return TargetType.ARRAY;

    else if (isObservableMap(target))
        return TargetType.MAP;

    else if (isBoxedObservable(target))
        return TargetType.BOX;
}

const enum TargetType { OBJECT, ARRAY, MAP, BOX }

export default interceptAsync;