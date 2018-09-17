import { interceptAsync } from "../src/index";
import { observable, when, ObservableMap } from "mobx";
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