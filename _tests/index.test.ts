import { interceptAsync } from "../src/index";
import { observable, when } from "mobx";
import sleep from "then-sleep";

it("Works", async () => {
    jest.setTimeout(150);

    const data = observable({
        value: "..."
    });

    interceptAsync(data, async (change) => {
        if (change.type !== "update")
            return change;

        await sleep(30);
        change.newValue += " world";
        return change;
    });

    data.value = "hello";
    await when(() => data.value === "hello world");
});