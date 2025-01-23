import {
  updateQuery,
  updateQueries,
  getParam,
  getTypedParam,
  getParamArray,
  updateQueryArray,
  clearQuery,
  clearAllQuery,
  URLTransaction,
  URLSubscriber,
  URLMiddlewareManager,
  URLPresets,
  serializeObject,
  deserializeObject,
} from "../../../src/index";

// DOM Elements
const setup = () => {
  URLMiddlewareManager.use((params, next) => {
    // Validate price range
    if (params.minPrice && params.maxPrice) {
      const min = Number(params.minPrice);
      const max = Number(params.maxPrice);
      if (min > max) {
        updateQuery({ key: "minPrice", value: max });
      }
    }
    next();
  });

  // Setup URL change subscriber
  URLSubscriber.subscribe((params) => {
    updateResults(params);
  });

  // Create UI elements
  const app = document.querySelector<HTMLDivElement>("#app")!;
  app.innerHTML = `
    <div class="filters">
      <input id="search" type="text" placeholder="Search...">
      <input id="minPrice" type="number" placeholder="Min Price">
      <input id="maxPrice" type="number" placeholder="Max Price">
      <select id="category" multiple>
        <option value="electronics">Electronics</option>
        <option value="books">Books</option>
        <option value="clothing">Clothing</option>
      </select>
      <button id="applyFilters">Apply Filters</button>
      <button id="savePreset">Save Preset</button>
      <button id="loadPreset">Load Preset</button>
      <button id="clearFilters">Clear Filters</button>
    </div>
    <div id="results"></div>
  `;

  // Initialize with URL values
  const searchInput = document.querySelector<HTMLInputElement>("#search")!;
  const minPriceInput = document.querySelector<HTMLInputElement>("#minPrice")!;
  const maxPriceInput = document.querySelector<HTMLInputElement>("#maxPrice")!;
  const categorySelect =
    document.querySelector<HTMLSelectElement>("#category")!;

  // Set initial values from URL
  searchInput.value = getParam("search") || "";
  minPriceInput.value = getTypedParam("minPrice", "0");
  maxPriceInput.value = getTypedParam("maxPrice", "1000");
  const selectedCategories = getParamArray("categories");
  Array.from(categorySelect.options).forEach((option) => {
    option.selected = selectedCategories.includes(option.value);
  });

  // Event Handlers
  document.querySelector("#applyFilters")?.addEventListener("click", () => {
    new URLTransaction()
      .updates([
        { key: "search", value: searchInput.value || null },
        { key: "minPrice", value: minPriceInput.value || null },
        { key: "maxPrice", value: maxPriceInput.value || null },
      ])
      .commit();

    // Handle multi-select separately
    const selectedOptions = Array.from(categorySelect.selectedOptions).map(
      (opt) => opt.value
    );
    updateQueryArray("categories", selectedOptions);
  });

  document.querySelector("#savePreset")?.addEventListener("click", () => {
    const currentParams = {
      search: searchInput.value,
      minPrice: minPriceInput.value,
      maxPrice: maxPriceInput.value,
      categories: Array.from(categorySelect.selectedOptions).map(
        (opt) => opt.value
      ),
    };

    // Save current state as preset
    URLPresets.save("lastUsed", serializeObject(currentParams));
  });

  document.querySelector("#loadPreset")?.addEventListener("click", () => {
    const preset = URLPresets.apply("lastUsed");
    if (preset) {
      const params = deserializeObject<any>(preset);
      searchInput.value = params.search || "";
      minPriceInput.value = params.minPrice || "";
      maxPriceInput.value = params.maxPrice || "";

      // Update select options
      Array.from(categorySelect.options).forEach((option) => {
        option.selected = params.categories?.includes(option.value) || false;
      });
    }
  });

  document.querySelector("#clearFilters")?.addEventListener("click", () => {
    clearAllQuery();
    searchInput.value = "";
    minPriceInput.value = "";
    maxPriceInput.value = "";
    Array.from(categorySelect.options).forEach((option) => {
      option.selected = false;
    });
  });
};

// Mock API call
const updateResults = async (params: Record<string, string>) => {
  const resultsDiv = document.querySelector<HTMLDivElement>("#results")!;
  resultsDiv.innerHTML = `
    <pre>
      Current Filters:
      ${JSON.stringify(params, null, 2)}
    </pre>
  `;
};

// Initialize the app
document.addEventListener("DOMContentLoaded", setup);
