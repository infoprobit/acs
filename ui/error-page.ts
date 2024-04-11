 import { ClosureComponent, Component } from "mithril";
import { m } from "./components.ts";

export const component: ClosureComponent = (): Component => {
  return {
    view: function (vnode) {
      document.title = "Error! - ProACS";
      return m("p.error", vnode.attrs["error"]);
    },
  };
};
