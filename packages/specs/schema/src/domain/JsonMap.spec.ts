import {JsonMap} from "@tsed/schema";

describe("JsonMap", () => {
  it("should serialize a JsonMap", () => {
    const map = new JsonMap({
      id: "id"
    });

    expect(map.toJSON()).toEqual({
      id: "id"
    });
  });
});
