# Param Wizard

A powerful and type-safe utility package for managing URL query parameters in browser applications.

## Features

- 🔒 Type-safe parameter handling
- 🔄 URL history management
- 🎯 Parameter validation
- 📦 Transaction support
- 🔌 Middleware system
- 💾 Preset management
- 📝 Complex object serialization
- 🎨 Array parameter support
- 👀 URL change subscriptions

## API Reference

| Function/Class         | Parameters                                                   | Options/Types                                                                                                          | Return Value             | Description                      |
| ---------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------- |
| `updateQuery`          | `{ key: string, value: QueryValue }`                         | `QueryValue = string \| number \| boolean \| null \| undefined \| string[]`                                            | `void`                   | Updates single URL parameter     |
| `updateQueries`        | `QueryUpdate[]`                                              | Same as `updateQuery`                                                                                                  | `void`                   | Batch update multiple parameters |
| `updateQueryString`    | `query: string`                                              | Query string format                                                                                                    | `void`                   | Updates from raw query string    |
| `getParams`            | None                                                         | -                                                                                                                      | `Record<string, string>` | Get all parameters as object     |
| `getParamString`       | None                                                         | -                                                                                                                      | `string`                 | Get full query string            |
| `getTypedParam<T>`     | `key: string, defaultValue: T`                               | `T = string \| number \| boolean`                                                                                      | `T`                      | Get typed parameter value        |
| `updateQueryArray`     | `key: string, values: string[]`                              | -                                                                                                                      | `void`                   | Set array parameter              |
| `getParamArray`        | `key: string`                                                | -                                                                                                                      | `string[]`               | Get array parameter              |
| `clearQuery`           | `keys: string \| string[]`                                   | -                                                                                                                      | `void`                   | Clear specific parameter(s)      |
| `clearAllQuery`        | None                                                         | -                                                                                                                      | `void`                   | Clear all parameters             |
| `validateParams`       | `params: Record<string, QueryValue>, rules: ValidationRules` | `ValidationRules = { pattern?: RegExp; minLength?: number; maxLength?: number; required?: boolean; enum?: string[]; }` | `boolean`                | Validate parameters              |
| `serializeObject`      | `obj: Record<string, any>`                                   | -                                                                                                                      | `string`                 | Serialize complex object         |
| `deserializeObject<T>` | `str: string`                                                | Type parameter `T`                                                                                                     | `T`                      | Deserialize with type safety     |

### Classes

#### URLTransaction

| Method     | Parameters                 | Return | Description               |
| ---------- | -------------------------- | ------ | ------------------------- |
| `update`   | `QueryUpdate`              | `this` | Update single parameter   |
| `updates`  | `QueryUpdate[]`            | `this` | Batch update parameters   |
| `delete`   | `key: string`              | `this` | Delete parameter          |
| `clear`    | `keys: string \| string[]` | `this` | Clear multiple parameters |
| `clearAll` | None                       | `this` | Clear all parameters      |
| `commit`   | None                       | `void` | Apply changes             |

#### URLHistory

| Method    | Parameters                                     | Return | Description          |
| --------- | ---------------------------------------------- | ------ | -------------------- |
| `push`    | `{ data?: any, title?: string, url?: string }` | `void` | Save current state   |
| `back`    | None                                           | `void` | Go to previous state |
| `forward` | None                                           | `void` | Go to next state     |

#### URLSubscriber

| Method      | Parameters                                 | Return       | Description              |
| ----------- | ------------------------------------------ | ------------ | ------------------------ |
| `subscribe` | `(params: Record<string, string>) => void` | `() => void` | Subscribe to URL changes |

#### URLPresets

| Method   | Parameters                                     | Return | Description           |
| -------- | ---------------------------------------------- | ------ | --------------------- |
| `save`   | `name: string, params: Record<string, string>` | `void` | Save parameter preset |
| `apply`  | `name: string`                                 | `void` | Apply saved preset    |
| `remove` | `name: string`                                 | `void` | Remove preset         |

#### URLMiddlewareManager

| Method | Parameters                                                   | Return | Description             |
| ------ | ------------------------------------------------------------ | ------ | ----------------------- |
| `use`  | `(params: Record<string, string>, next: () => void) => void` | `void` | Add middleware function |

## Installation

```bash
npm install param-wizard
```

## API Usage & Explanations

### Basic Query Operations

URL query parameters are the parts of a URL after the `?` symbol. These operations help you manage these parameters programmatically.

```typescript
// Single parameter update
updateQuery({ key: "page", value: 2 }); // ?page=2
updateQuery({ key: "page", value: null }); // removes page parameter

// Multiple parameter update
updateQueries([
  { key: "page", value: 1 },
  { key: "sort", value: "desc" },
]); // Results in: ?page=1&sort=desc

// Update from query string
updateQueryString("?page=1&sort=desc");
```

### Parameter Retrieval & Type Safety

Built-in TypeScript support ensures you get the correct data types when retrieving parameters.

```typescript
// Get all parameters as object
getParams(); // { page: "1", sort: "desc" }

// Get full query string
getParamString(); // "page=1&sort=desc"

// Get typed parameters (automatic type conversion)
const page = getTypedParam<number>("page", 1); // returns number: 1
const isActive = getTypedParam<boolean>("active", false); // returns boolean: true/false
```

### Array Parameter Handling

Work with arrays in URL parameters seamlessly, with automatic encoding and decoding.

```typescript
// Set array parameters
updateQueryArray("tags", ["react", "typescript"]);
// Results in: ?tags=react,typescript

// Get array parameters
const tags = getParamArray("tags"); // ["react", "typescript"]
```

### Transaction Pattern

Batch multiple URL changes together to avoid multiple history entries and improve performance.

```typescript
new URLTransaction()
  .update({ key: "page", value: 2 })
  .updates([
    // bulk updates
    { key: "sort", value: "desc" },
    { key: "filter", value: "active" },
  ])
  .delete("category") // single delete
  .clear(["tag", "search"]) // multiple delete
  .clearAll() // clear all
  .commit(); // apply all changes at once
```

### URL History Management

Manage custom URL history states beyond browser's basic back/forward functionality.

```typescript
const history = new URLHistory();

// Save state with custom data
history.push({
  data: { lastFilter: "active" }, // Custom data
  title: "Filtered View", // Page title
  url: window.location.href, // URL to restore
});

history.back(); // Go to previous saved state
history.forward(); // Go to next saved state
```

### Change Subscriptions

Listen for URL parameter changes anywhere in your application to sync UI or trigger side effects.

```typescript
// Set up a listener
const unsubscribe = URLSubscriber.subscribe((params) => {
  console.log("URL parameters changed to:", params);
  // Update UI, trigger API calls, etc.
});

// Clean up when done
unsubscribe();
```

### Middleware System

Transform or validate URL parameters before they're applied. Useful for data normalization and validation.

```typescript
// Ensure page number is always positive
URLMiddlewareManager.use((params, next) => {
  if (params.page) {
    params.page = Math.max(1, parseInt(params.page));
  }
  next();
});

// Log all URL changes
URLMiddlewareManager.use((params, next) => {
  console.log("URL changing to:", params);
  next();
});
```

### Parameter Presets

Save and reuse common parameter combinations. Perfect for storing filter configurations or common searches.

```typescript
// Save a common filter configuration
URLPresets.save("activeUsers", {
  status: "active",
  role: "user",
  sort: "newest",
});

// Apply the entire configuration at once
URLPresets.apply("activeUsers");
// Results in: ?status=active&role=user&sort=newest

URLPresets.remove("activeUsers"); // Clean up when done
```

### Complex Object Serialization

Store and retrieve complex objects in URL parameters with type safety.

```typescript
const filters = {
  date: { from: "2023-01-01", to: "2023-12-31" },
  categories: ["A", "B", "C"],
  active: true,
};

// Save complex object in URL
updateQuery({
  key: "filters",
  value: serializeObject(filters),
});

// Retrieve and restore object with type safety
const savedFilters = deserializeObject<typeof filters>(
  getTypedParam("filters", "")
);
```

### Parameter Validation

Validate URL parameters against defined rules to ensure data integrity.

```typescript
const rules = {
  username: {
    pattern: /^[a-z0-9]+$/i, // Must match pattern
    minLength: 3, // Minimum length
    maxLength: 20, // Maximum length
    required: true, // Must be present
  },
  role: {
    enum: ["admin", "user"], // Must be one of these values
  },
};

validateParams(
  {
    username: "john_doe",
    role: "admin",
  },
  rules
);
```

## Real World Example

Here's a practical example of using the URL Parser in a React product listing page:

```typescript
import { updateQueries, getTypedParam, URLTransaction } from "query-nexus";

const ProductListing: React.FC = () => {
  // Get initial filters from URL
  const initialFilters = {
    search: getTypedParam("search", ""),
    minPrice: getTypedParam("minPrice", 0),
    categories: getParamArray("categories"),
    page: getTypedParam("page", 1),
  };

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<typeof initialFilters>) => {
    new URLTransaction()
      .updates(
        Object.entries(newFilters).map(([key, value]) => ({
          key,
          value: value ?? null,
        }))
      )
      .commit();
  };

  return (
    <div>
      <input
        value={initialFilters.search}
        onChange={(e) => updateFilters({ search: e.target.value })}
      />
      {/* ...other filter controls */}
    </div>
  );
};
```

See the complete example with all features in `/examples/ProductListingExample.tsx`.

## Browser Compatibility

Works in all modern browsers that support:

- `URLSearchParams`
- `window.history`
- `pushState`

## License

MIT
