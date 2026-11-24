const openHost = document.querySelector("#open-host");
const openRoot = openHost.attachShadow({ mode: "open" });

openRoot.innerHTML = `
  <div>
    <h2>Accessible open shadow content</h2>
    <label for="open-name">Open name</label>
    <input id="open-name" name="openName" aria-label="Open name">
  </div>
`;

// This root is deliberately closed. Ordinary document APIs cannot return it.
const closedHost = document.querySelector("#closed-host");
const closedRoot = closedHost.attachShadow({ mode: "closed" });
closedRoot.innerHTML = `
  <div>
    <h2>Closed shadow content</h2>
    <label for="closed-name">Closed name</label>
    <input id="closed-name" name="closedName" aria-label="Closed name">
  </div>
`;

// A nested closed root demonstrates that even holding a parent root is not enough
// to traverse a closed descendant without the reference retained at attachment.
const nestedClosedHost = document.createElement("div");
nestedClosedHost.setAttribute("aria-label", "Nested closed host");
openRoot.append(nestedClosedHost);
const nestedClosedRoot = nestedClosedHost.attachShadow({ mode: "closed" });
nestedClosedRoot.innerHTML = '<button aria-label="Nested closed action">Closed action</button>';

const result = document.querySelector("#result");
const openInput = openRoot.querySelector("input");
const ordinaryClosedResult = closedHost.querySelector("#closed-name");
const ordinaryNestedResult = openRoot.querySelector("button");

result.textContent = [
  `document.querySelector("#closed-name"): ${ordinaryClosedResult === null ? "null (closed root not traversed)" : "unexpected access"}`,
  `closedHost.shadowRoot: ${closedHost.shadowRoot === null ? "null (closed root hidden)" : "unexpected access"}`,
  `openRoot.querySelector("input"): ${openInput?.getAttribute("aria-label")}`,
  `Nested closed query from openRoot: ${ordinaryNestedResult === null ? "null (closed descendant hidden)" : "unexpected access"}`,
  "Captured closed-root reference exists only in this script: " +
    (closedRoot.querySelector("#closed-name") ? "yes, before/at attachment scope" : "no"),
].join("\n");
