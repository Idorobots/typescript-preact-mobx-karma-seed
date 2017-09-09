import * as preact from "preact";
import { MainContainer } from "./containers/main/mainContainer";
import { mainStore } from "./store/main";

(function () {

  const render = () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    preact.render(<MainContainer store={mainStore}/>, container);
  };

  const DOMContentLoaded = document.readyState === "interactive";

  if (DOMContentLoaded) {
    render();
  } else {
    document.addEventListener("DOMContentLoaded", render);
  }

})();
