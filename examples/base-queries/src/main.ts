import {
  updateQuery,
  getParams,
  getTypedParam,
  getParam,
} from "../../../src/index";

window.addEventListener("load", () => {
  updateQuery({ key: "search", value: "hello this is normal" });
  console.log(getParam("male"));
});
