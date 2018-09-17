TODO: Write an actual README

## Caveat
Any new values intercepted will discard previous promises

```ts
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
```