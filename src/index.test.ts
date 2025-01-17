import {
  getSearchParams,
  setSearchParams,
  updateQuery,
  updateQueries,
  updateQueryString,
  clearQuery,
  clearQueries,
  clearAllQuery,
  getParams,
  getParamString,
} from "./index";

// Mock window location and history
const mockPushState = jest.fn();
Object.defineProperty(window, "location", {
  value: {
    search: "",
    pathname: "/test",
  },
  writable: true,
});
Object.defineProperty(window, "history", {
  value: {
    pushState: mockPushState,
  },
});

describe("URL Parser", () => {
  beforeEach(() => {
    window.location.search = "";
    mockPushState.mockClear();
  });

  describe("getSearchParams", () => {
    it("should return URLSearchParams object", () => {
      window.location.search = "?test=123";
      const params = getSearchParams();
      expect(params instanceof URLSearchParams).toBe(true);
      expect(params.get("test")).toBe("123");
    });

    it("should handle empty search string", () => {
      const params = getSearchParams();
      expect(params.toString()).toBe("");
    });
  });

  describe("setSearchParams", () => {
    it("should update URL with new params", () => {
      const params = new URLSearchParams("test=123");
      setSearchParams(params);
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test?test=123");
    });

    it("should handle empty params", () => {
      const params = new URLSearchParams();
      setSearchParams(params);
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test");
    });
  });

  describe("updateQuery", () => {
    it("should update existing parameter", () => {
      window.location.search = "?test=123";
      updateQuery({ key: "test", value: "456" });
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test?test=456");
    });

    it("should handle boolean values", () => {
      updateQuery({ key: "flag", value: true });
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test?flag=true");
    });

    it("should handle number values", () => {
      updateQuery({ key: "count", value: 42 });
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test?count=42");
    });

    it("should throw error for invalid key type", () => {
      expect(() => updateQuery({ key: "", value: "123" })).toThrow(
        "Key must be a non-empty string"
      );
    });
  });

  describe("updateQueries", () => {
    it("should handle multiple updates", () => {
      updateQueries([
        { key: "a", value: "1" },
        { key: "b", value: "2" },
        { key: "c", value: null },
      ]);
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test?a=1&b=2");
    });

    it("should preserve existing unmodified parameters", () => {
      window.location.search = "?existing=value";
      updateQueries([{ key: "new", value: "param" }]);
      expect(mockPushState).toHaveBeenCalledWith(
        {},
        "",
        "/test?existing=value&new=param"
      );
    });
  });

  describe("updateQueryString", () => {
    it("should handle query string with multiple parameters", () => {
      updateQueryString("?a=1&b=2&c=3");
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test?a=1&b=2&c=3");
    });

    it("should handle query string without question mark", () => {
      updateQueryString("a=1&b=2");
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test?a=1&b=2");
    });

    it("should merge with existing parameters", () => {
      window.location.search = "?existing=value";
      updateQueryString("new=param");
      expect(mockPushState).toHaveBeenCalledWith(
        {},
        "",
        "/test?existing=value&new=param"
      );
    });
  });

  describe("clearQueries", () => {
    beforeEach(() => {
      window.location.search = "?a=1&b=2&c=3&d=4";
    });

    it("should clear multiple specified parameters", () => {
      clearQueries(["a", "c"]);
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test?b=2&d=4");
    });

    it("should handle non-existent keys", () => {
      clearQueries(["x", "y"]);
      expect(mockPushState).toHaveBeenCalledWith(
        {},
        "",
        "/test?a=1&b=2&c=3&d=4"
      );
    });

    it("should handle empty array", () => {
      clearQueries([]);
      expect(mockPushState).toHaveBeenCalledWith(
        {},
        "",
        "/test?a=1&b=2&c=3&d=4"
      );
    });
  });

  describe("clearQuery", () => {
    beforeEach(() => {
      window.location.search = "?a=1&b=2&c=3&d=4";
    });

    it("should clear single parameter when string is provided", () => {
      clearQuery("a");
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test?b=2&c=3&d=4");
    });

    it("should clear multiple parameters when array is provided", () => {
      clearQuery(["a", "c"]);
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test?b=2&d=4");
    });

    it("should handle non-existent key", () => {
      clearQuery("nonexistent");
      expect(mockPushState).toHaveBeenCalledWith(
        {},
        "",
        "/test?a=1&b=2&c=3&d=4"
      );
    });

    it("should throw error for invalid key type", () => {
      expect(() => clearQuery(123 as any)).toThrow("Key must be a string");
    });

    it("should throw error for invalid key type in array", () => {
      expect(() => clearQuery([123] as any)).toThrow("Keys must be strings");
    });
  });

  describe("clearAllQuery", () => {
    beforeEach(() => {
      window.location.search = "?a=1&b=2&c=3&d=4";
    });

    it("should remove all query parameters", () => {
      clearAllQuery();
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test");
    });

    it("should handle empty query string", () => {
      window.location.search = "";
      clearAllQuery();
      expect(mockPushState).toHaveBeenCalledWith({}, "", "/test");
    });
  });

  describe("getParams", () => {
    it("should return empty object for no parameters", () => {
      expect(getParams()).toEqual({});
    });

    it("should return object with all parameters", () => {
      window.location.search = "?a=1&b=2&empty=&space=value%20with%20spaces";
      expect(getParams()).toEqual({
        a: "1",
        b: "2",
        empty: "",
        space: "value with spaces",
      });
    });
  });

  describe("getParamString", () => {
    it("should return empty string for no parameters", () => {
      expect(getParamString()).toBe("");
    });

    it("should return encoded parameter string", () => {
      window.location.search = "?key=value&space=hello%20world";
      expect(getParamString()).toBe("key=value&space=hello+world");
    });
  });
});
