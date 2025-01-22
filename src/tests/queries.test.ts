import {
  updateQuery,
  updateQueries,
  clearQuery,
  clearAllQuery,
  getParams,
  getParamString,
  getParamArray,
  getTypedParam,
  updateQueryString,
} from "../base-utils";
import { decodeValue } from "../utils/encode-or-decode";

describe("Basic Query Operations", () => {
  // Setup and teardown
  beforeEach(() => {
    // Clear URL parameters before each test
    window.history.pushState({}, "", "/");
  });

  describe("updateQuery", () => {
    it("should add a single query parameter", () => {
      updateQuery({ key: "name", value: "john" });
      expect(window.location.search).toBe("?name=john");
    });

    it("should update existing query parameter", () => {
      updateQuery({ key: "name", value: "john" });
      updateQuery({ key: "name", value: "jane" });
      expect(window.location.search).toBe("?name=jane");
    });

    it("should remove parameter when value is null", () => {
      updateQuery({ key: "name", value: "john" });
      updateQuery({ key: "name", value: null });
      expect(window.location.search).toBe("");
    });

    it("should handle special characters", () => {
      const specialValue = "hello world & more";
      updateQuery({ key: "query", value: specialValue });

      // Test encoded URL
      expect(window.location.search).toBe("?query=hello%20world%20%26%20more");

      // Test decoded value
      const params = getParams();
      expect(decodeValue(params.query)).toBe(specialValue);
    });
  });

  describe("updateQueries", () => {
    it("should update multiple parameters at once", () => {
      updateQueries([
        { key: "name", value: "john" },
        { key: "age", value: "25" },
      ]);
      expect(window.location.search).toContain("name=john");
      expect(window.location.search).toContain("age=25");
    });

    it("should handle mixed updates and deletions", () => {
      updateQueries([
        { key: "name", value: "john" },
        { key: "age", value: null },
      ]);
      expect(window.location.search).toBe("?name=john");
    });
  });

  describe("updateQueryString", () => {
    it("should update from query string", () => {
      updateQueryString("name=john&age=25");
      expect(window.location.search).toBe("?name=john&age=25");
    });

    it("should handle empty query string", () => {
      updateQueryString("");
      expect(window.location.search).toBe("");
    });
  });

  describe("clearQuery", () => {
    beforeEach(() => {
      updateQueries([
        { key: "name", value: "john" },
        { key: "age", value: "25" },
        { key: "city", value: "NY" },
      ]);
    });

    it("should clear single parameter", () => {
      clearQuery("name");
      expect(window.location.search).not.toContain("name=");
      expect(window.location.search).toContain("age=25");
    });

    it("should clear multiple parameters", () => {
      clearQuery(["name", "age"]);
      expect(window.location.search).toBe("?city=NY");
    });
  });

  describe("clearAllQuery", () => {
    it("should remove all query parameters", () => {
      updateQueries([
        { key: "name", value: "john" },
        { key: "age", value: "25" },
      ]);
      clearAllQuery();
      expect(window.location.search).toBe("");
    });
  });

  describe("getParams", () => {
    it("should return all parameters as object", () => {
      updateQueries([
        { key: "name", value: "john" },
        { key: "age", value: "25" },
      ]);
      const params = getParams();
      expect(params).toEqual({
        name: "john",
        age: "25",
      });
    });
  });

  describe("getParamString", () => {
    it('should return query string without "?"', () => {
      updateQueries([
        { key: "name", value: "john" },
        { key: "age", value: "25" },
      ]);
      const queryString = getParamString();
      expect(queryString).toBe("name=john&age=25");
    });
  });

  describe("getParamArray", () => {
    it("should return array from comma-separated values", () => {
      updateQuery({ key: "tags", value: ["one", "two", "three"] });
      const tags = getParamArray("tags");
      expect(tags).toEqual(["one", "two", "three"]);
    });

    it("should return empty array for non-existent parameter", () => {
      const tags = getParamArray("nonexistent");
      expect(tags).toEqual([]);
    });
  });

  describe("getTypedParam", () => {
    beforeEach(() => {
      updateQueries([
        { key: "age", value: "25" },
        { key: "active", value: "true" },
        { key: "name", value: "john" },
      ]);
    });

    it("should return number for number default", () => {
      const age = getTypedParam("age", 0);
      expect(typeof age).toBe("number");
      expect(age).toBe(25);
    });

    it("should return boolean for boolean default", () => {
      const active = getTypedParam("active", false);
      expect(typeof active).toBe("boolean");
      expect(active).toBe(true);
    });

    it("should return default value for missing parameter", () => {
      const missing = getTypedParam("missing", "default");
      expect(missing).toBe("default");
    });
  });
});
