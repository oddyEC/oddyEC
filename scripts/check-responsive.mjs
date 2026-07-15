const baseUrl = process.env.RESPONSIVE_BASE_URL || "http://127.0.0.1:4321";
const cdpUrl = process.env.CDP_URL || "http://127.0.0.1:9223";

const viewports = [
  { name: "mobile", width: 390, height: 900, mobile: true },
  { name: "tablet", width: 768, height: 1000, mobile: false },
  { name: "desktop", width: 1440, height: 1000, mobile: false },
];

const paths = ["/", "/projects/agentic-operations-platform/", "/notes/"];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getPageWebSocketUrl() {
  const response = await fetch(`${cdpUrl}/json/list`);
  if (!response.ok) {
    throw new Error(`Could not read CDP targets from ${cdpUrl}: ${response.status}`);
  }

  const targets = await response.json();
  const page = targets.find((target) => target.type === "page");
  if (!page?.webSocketDebuggerUrl) {
    throw new Error("No page target available from the browser debugging endpoint.");
  }

  return page.webSocketDebuggerUrl;
}

function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let nextId = 1;
  const pending = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          const id = nextId++;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((commandResolve, commandReject) => {
            pending.set(id, { resolve: commandResolve, reject: commandReject });
          });
        },
        close() {
          socket.close();
        },
      });
    });
    socket.addEventListener("error", () => reject(new Error("CDP WebSocket connection failed")));
  });
}

function pageUrl(path) {
  return new URL(path, baseUrl).toString();
}

function evaluationExpression() {
  return String.raw`
    (() => {
      const doc = document.documentElement;
      const body = document.body;
      const horizontalOverflow = Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
      const hasScrollableAncestor = (element) => {
        let current = element.parentElement;
        while (current && current !== document.body) {
          const style = getComputedStyle(current);
          const rect = current.getBoundingClientRect();
          if (["auto", "scroll", "hidden"].includes(style.overflowX) && rect.left >= -2 && rect.right <= window.innerWidth + 2) {
            return true;
          }
          current = current.parentElement;
        }
        return false;
      };
      const visible = Array.from(document.querySelectorAll("body *")).filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      });
      const offenders = visible
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === "string" ? element.className : "",
            text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            scrollableRegion: hasScrollableAncestor(element),
          };
        })
        .filter((item) => !item.scrollableRegion && (item.left < -2 || item.right > window.innerWidth + 2))
        .slice(0, 10);
      const textOverflow = visible
        .filter((element) => !hasScrollableAncestor(element))
        .filter((element) => ["A", "BUTTON", "H1", "H2", "H3", "P", "LI"].includes(element.tagName))
        .filter((element) => element.scrollWidth > element.clientWidth + 2)
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className : "",
          text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        }))
        .slice(0, 10);
      const desktopNav = document.querySelector(".desktop-nav");
      const mobileToggle = document.querySelector(".mobile-nav-toggle");
      const workflow = document.querySelector(".workflow-visual");
      const workflowRect = workflow ? workflow.getBoundingClientRect() : null;

      return {
        url: location.pathname,
        width: window.innerWidth,
        horizontalOverflow,
        offenders,
        textOverflow,
        desktopNavDisplay: desktopNav ? getComputedStyle(desktopNav).display : null,
        mobileToggleDisplay: mobileToggle ? getComputedStyle(mobileToggle).display : null,
        workflowRect: workflowRect
          ? {
              left: Math.round(workflowRect.left),
              right: Math.round(workflowRect.right),
              width: Math.round(workflowRect.width),
            }
          : null,
      };
    })()
  `;
}

const wsUrl = await getPageWebSocketUrl();
const page = await connect(wsUrl);
await page.send("Page.enable");
await page.send("Runtime.enable");

const failures = [];
const results = [];

for (const viewport of viewports) {
  await page.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });

  for (const path of paths) {
    await page.send("Page.navigate", { url: pageUrl(path) });
    await wait(900);
    const evaluation = await page.send("Runtime.evaluate", {
      expression: evaluationExpression(),
      returnByValue: true,
      awaitPromise: true,
    });
    const value = evaluation.result.value;
    results.push({ viewport: viewport.name, path, ...value });

    if (value.horizontalOverflow > 2) {
      failures.push(`${viewport.name} ${path}: horizontal overflow ${value.horizontalOverflow}px`);
    }
    if (value.offenders.length > 0) {
      failures.push(`${viewport.name} ${path}: elements outside viewport ${JSON.stringify(value.offenders)}`);
    }
    if (value.textOverflow.length > 0) {
      failures.push(`${viewport.name} ${path}: text overflow ${JSON.stringify(value.textOverflow)}`);
    }
    if (viewport.name === "mobile" && value.mobileToggleDisplay === "none") {
      failures.push(`${viewport.name} ${path}: mobile menu toggle is hidden`);
    }
    if (viewport.name === "desktop" && value.desktopNavDisplay === "none") {
      failures.push(`${viewport.name} ${path}: desktop navigation is hidden`);
    }
    if (path === "/" && value.workflowRect && value.workflowRect.right > viewport.width + 2) {
      failures.push(`${viewport.name} ${path}: workflow visual exceeds viewport`);
    }
  }
}

page.close();

for (const result of results) {
  console.log(
    `${result.viewport} ${result.path}: overflow=${result.horizontalOverflow}px, desktopNav=${result.desktopNavDisplay}, mobileToggle=${result.mobileToggleDisplay}`
  );
}

if (failures.length > 0) {
  console.error(`Responsive checks failed:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log("Responsive checks passed for mobile, tablet, and desktop.");