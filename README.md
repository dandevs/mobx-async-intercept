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
    target: ObservableMap<K, V>|Map<K, V>,
    change: (change: IMapWillChange<K, V>) => Promise<IMapWillChange<K, V>>
): Lambda;

export function interceptAsync(
    target: IObservableObject,
    change: (change: IObjectWillChange) => Promise<IObjectWillChange>
): Lambda;

export function interceptAsync<T=any>(
    target: IObservableObject,
    property: string,
    change: (change: IValueWillChange<T>) => Promise<IValueWillChange<T>>
): Lambda;
```