import * as n from "../src/notify";

jest.mock("../src/notify");
const notify = n.notify as jest.Mock;
import { handle } from "../src/handler";

describe("handler", () => {
  const EVT = { Records: [] };

  const toRes = (success: boolean, error?: string, statusCode = 200) => ({
    body: JSON.stringify({ error, success }),
    statusCode,
  });

  it("resolves to true", async () => {
    notify.mockResolvedValue({ status: 200 });

    await expect(handle(EVT)).resolves.toEqual(toRes(true));

    expect(notify).toHaveBeenCalledWith(EVT);
  });

  it("resolves to false", async () => {
    const status = 500;
    notify.mockResolvedValue({ status });

    await expect(handle(EVT)).resolves.toEqual(
      toRes(false, `Expected 200, got ${status}`)
    );

    expect(notify).toHaveBeenCalledWith(EVT);
  });

  it("returns error on exception", async () => {
    const err = "my-error";
    notify.mockRejectedValue(new Error(err));

    await expect(handle(EVT)).resolves.toEqual(toRes(false, err, 500));

    expect(notify).toHaveBeenCalledWith(EVT);
  });
});
