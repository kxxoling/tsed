import {StoreSet} from "@tsed/core";
import {
  EndpointMetadata,
  Get,
  In,
  JsonEntityStore,
  JsonMethodStore,
  JsonOperation,
  JsonParameter,
  OperationMethods,
  Property,
  Returns
} from "@tsed/schema";
import {Use, UseAfter, UseBefore} from "@tsed/platform-middlewares";

describe("JsonMethodStore", () => {
  describe("endpoint declaration", () => {
    it("should return an endpoint metadata", () => {
      // GIVEN
      const middleware1 = () => {};
      const middleware2 = () => {};
      const middleware3 = () => {};

      class Test {
        @StoreSet("test", "value")
        @Get("/").Use(middleware3).UseAfter(middleware1).UseBefore(middleware2)
        method(): any {}
      }

      const endpoint = JsonEntityStore.fromMethod(Test, "method");

      // THEN
      expect(endpoint.beforeMiddlewares).toHaveLength(1);
      expect(endpoint.middlewares).toHaveLength(1);
      expect(endpoint.beforeMiddlewares).toHaveLength(1);
      expect(endpoint.token).toBe(Test);
      expect(endpoint.store.get("test")).toEqual("value");
    });
  });
  describe("view()", () => {
    it("should return view value", () => {
      // GIVEN
      const middleware3 = () => {};

      class Test {
        @Use(middleware3)
        method(): any {}
      }

      const endpoint = EndpointMetadata.get(Test, "method");

      // @ts-ignore
      endpoint.view = {path: "/", test: 1};

      expect(endpoint.view).toEqual({path: "/", test: 1});
    });
  });
  describe("acceptMimes()", () => {
    it("should return acceptMimes value", () => {
      // GIVEN
      const middleware3 = () => {};

      class Test {
        @Use(middleware3)
        method(): any {}
      }

      const endpoint = EndpointMetadata.get(Test, "method");

      // @ts-ignore
      endpoint.acceptMimes = [];

      expect(endpoint.acceptMimes).toEqual([]);
    });
  });
  describe("endpoint declaration", () => {
    it("should return an endpoint metadata", () => {
      // GIVEN
      const middleware1 = () => {};
      const middleware2 = () => {};
      const middleware3 = () => {};

      class Test {
        @UseAfter(middleware1)
        @UseBefore(middleware2)
        @Use(middleware3)
        @StoreSet("test", "value")
        method(): any {}
      }

      const endpoint = EndpointMetadata.get(Test, "method");

      // THEN
      expect(endpoint.beforeMiddlewares).toHaveLength(1);
      expect(endpoint.middlewares).toHaveLength(1);
      expect(endpoint.beforeMiddlewares).toHaveLength(1);
      expect(endpoint.token).toEqual(Test);
      expect(endpoint.store.get("test")).toEqual("value");
    });
    it("should add endpoint with path", () => {
      // GIVEN
      const middleware = () => {};

      class Test {
        @Use("/", middleware)
        method(): any {}
      }

      const endpoint = EndpointMetadata.get(Test, "method");

      // THEN
      expect(endpoint.middlewares).toHaveLength(1);
    });
    it("should add endpoint with path and method", () => {
      // GIVEN
      const middleware = () => {};

      class Test {
        @Use("get", "/", middleware)
        method(): any {}
      }

      const endpoint = EndpointMetadata.get(Test, "method");

      // THEN
      expect(endpoint.middlewares).toHaveLength(1);

      expect([...endpoint.operationPaths.values()]).toEqual([
        {
          method: OperationMethods.GET,
          path: "/"
        }
      ]);
    });
  });
  describe("static get()", () => {
    it("should return the endpoint metadata", () => {
      const middleware1 = () => {};
      const middleware2 = () => {};
      const middleware3 = () => {};

      class Test {
        @UseAfter(middleware1)
        @UseBefore(middleware2)
        @Use(middleware3)
        @StoreSet("test", "Test")
        method(): any {}

        @Use(middleware3)
        @StoreSet("test", "Test")
        method3() {}
      }

      const endpoint = JsonMethodStore.get(Test, "method");
      expect(endpoint).toBeInstanceOf(JsonMethodStore);
    });
  });
  describe("get()", () => {
    it("should return the endpoint metadata", () => {
      const middleware1 = () => {};
      const middleware2 = () => {};
      const middleware3 = () => {};

      class Test {
        @UseAfter(middleware1)
        @UseBefore(middleware2)
        @Use(middleware3)
        @StoreSet("test", "Test")
        method(): any {}

        @Use(middleware3)
        @StoreSet("test", "Test")
        method3() {}
      }

      const endpoint = JsonMethodStore.get(Test, "method");
      expect(endpoint.get("test")).toEqual("Test");
    });
  });
  it("should create JsonEntityStore", () => {
    class Model {
      @Property()
      id: string;

      @Get("/")
      @Returns(200, Object)
      method(@In("path") param: string) {}
    }

    // CLASS
    const storeClass = JsonEntityStore.from(Model);
    expect(storeClass).toBeInstanceOf(JsonEntityStore);
    expect(storeClass.decoratorType).toBe("class");
    expect(storeClass.propertyName).toBe("undefined");
    expect(storeClass.propertyKey).toBeUndefined();
    expect(storeClass.index).toBeUndefined();
    expect(storeClass.parent).toBe(storeClass);

    // PROPERTY
    const storeProp = JsonEntityStore.from(Model).children.get("id");
    expect(storeProp).toBeInstanceOf(JsonEntityStore);
    expect(storeProp?.decoratorType).toBe("property");
    expect(storeProp?.propertyKey).toBe("id");
    expect(storeProp?.propertyName).toBe("id");
    expect(storeProp?.index).toBeUndefined();
    expect(storeProp?.parameter).toBeUndefined();
    expect(storeProp?.operation).toBeUndefined();
    expect(storeProp?.nestedGenerics).toEqual([]);
    expect(storeProp?.parent).toEqual(storeClass);

    // METHOD
    const storeMethod = JsonEntityStore.from(Model).children.get("method");
    expect(storeMethod).toBeInstanceOf(JsonEntityStore);
    expect(storeMethod?.propertyKey).toBe("method");
    expect(storeMethod?.propertyName).toBe("method");
    expect(storeMethod?.decoratorType).toBe("method");
    expect(storeMethod?.index).toBeUndefined();
    expect(storeMethod?.parameters.length).toEqual(1);
    expect(storeMethod?.params.length).toEqual(1);

    expect([...storeMethod?.operationPaths.entries()]).toEqual([
      [
        "GET/",
        {
          method: "GET",
          path: "/"
        }
      ]
    ]);
    expect(storeMethod?.getResponseOptions(200)).toEqual({
      groups: undefined,
      type: Object
    });
    expect(storeMethod?.getResponseOptions(201)).toEqual({
      type: Object
    });
    expect(storeMethod?.operation).toBeInstanceOf(JsonOperation);
    expect(storeMethod?.nestedGenerics).toEqual([]);
    expect(storeProp?.parent).toEqual(storeClass);

    // PARAMETERS
    const storeParam = JsonEntityStore.from(Model).children.get("method")?.children.get(0);

    expect(storeParam).toBeInstanceOf(JsonEntityStore);
    expect(storeParam?.propertyKey).toBe("method");
    expect(storeParam?.propertyName).toBe("method");
    expect(storeParam?.index).toBe(0);
    expect(storeParam?.decoratorType).toBe("parameter");
    expect(storeParam?.parameter).toBeInstanceOf(JsonParameter);
    expect(storeParam?.operation).toBeUndefined();
    expect(storeParam?.nestedGenerics).toEqual([]);
    expect(storeParam?.nestedGenerics).toEqual([]);
    expect(storeParam?.parent).toEqual(storeMethod);
  });
});
