import * as preact from "preact";
import { onLoad } from "./index";

describe("index", () => {
  it("should render stuff", () => {
    spyOn(preact, "render");
    onLoad();
    expect(preact.render).toHaveBeenCalled();
  });
});
