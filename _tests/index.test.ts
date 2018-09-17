import { interceptAsync } from "../src/index";
import { observable, when } from "mobx";
import sleep from "then-sleep";

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
    await when(() => data.value === "hello world");
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

    await when(() => data.value === "second 2");
    expect(data.value).toEqual("second 2");
    disposer();
});