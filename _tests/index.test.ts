import { interceptAsync } from "../src/index";
import { observable, when, ObservableMap, intercept } from "mobx";
import sleep from "then-sleep";

//TODO: Clean these tests up / seperate files?
jest.setTimeout(150);

it("Works", async () => {
    const data = observable({
        value: "..."
    });

    const disposer = interceptAsync(data, async (change) => {
        if (change.type !== "update")
            return change;

        await sleep(30);
        change.newValue += " world";
        return change;
    });

    data.value = "hello";
    await when(() => data.value !== "...");
    expect(data.value).toEqual("hello world");
    disposer();
});

it("Ignore old intercepts", async () => {
    const data = observable({
        value: "..."
    });
    let n = 1;

    const disposer = interceptAsync(data, async (change) => {
        if (change.type !== "update")
            return change;

        await sleep(20 / n);
        change.newValue += ` ${n}`;
        n++;
        return change;
    });

    data.value = "first";
    data.value = "second";

    await when(() => data.value !== "...");
    expect(data.value).toEqual("second 2");
    disposer();
});

it("Handles intercept with property", async () => {
    const data = observable({
        value: "...",
        other: "...",
    });

    interceptAsync(data, "value", async (change) => {
        change.newValue += " world";
        await sleep(10);
        return change;
    });

    data.value = "hello";
    data.other = "foo";

    await when(() => data.value === "hello world");
    expect(data.value).toEqual("hello world");
    expect(data.other).toEqual("foo");
});

it("Handles observable.box", async () => {
    const value = observable.box("...");

    interceptAsync(value, async (change) => {
        change.newValue += " world";
        await sleep(10);
        return change;
    });

    value.set("hello");
    await when(() => value.get() !== "...");
    expect(value.get()).toEqual("hello world");
});

it("Handles observable.array", async () => {
    const arr = observable(["hello"]);

    interceptAsync(arr, async (change) => {
        if (change.type !== "splice")
            return;

        change.added = ["world"];
        await sleep(10);
        return change;
    });

    arr.push("...");
    await when(() => arr.length !== 1);
    expect(arr[1]).toEqual("world");
});

it("Handles observable.map", async () => {
    const map = new ObservableMap();

    interceptAsync(map, async (change) => {
        change.newValue = "world";
        await sleep(10);
        return change;
    });

    map.set("hello", "...");
    await when(() => map.size !== 0);
    expect(map.get("hello")).toEqual("world");
});

describe("Handles multiple changes in objects", () => {
    it("Object", async () => {
        const data = observable({ a: 1, b: 2, c: 3 });
        interceptAsync(data, (change) => Promise.resolve(change));

        data.a = 2;
        data.b = 3;
        data.c = 4;

        await sleep(0);

        expect(data.a === 2).toEqual(true);
        expect(data.b === 3).toEqual(true);
        expect(data.c === 4).toEqual(true);
    });

    it("Array", async () => {
        const data = observable([0, 1, 2]);
        interceptAsync(data, (change) => Promise.resolve(change));

        data[0] = 1;
        data[1] = 2;
        data[2] = 3;


        await sleep(0);

        expect(data[0] === 1).toEqual(true);
        expect(data[1] === 2).toEqual(true);
        expect(data[2] === 3).toEqual(true);
    });

    it("Map", async () => {
        const data = observable.map();
        interceptAsync(data, (change) => Promise.resolve(change));

        data.set("a", 1);
        data.set("b", 2);
        data.set("c", 3);

        await sleep(0);

        expect(data.get("a") === 1).toBe(true);
        expect(data.get("b") === 2).toBe(true);
        expect(data.get("c") === 3).toBe(true);
    });
});