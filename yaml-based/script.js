const yamlInput = document.getElementById("yamlInput");
const select = document.getElementById("functionSelect");

/**
 * Load functions into dropdown
 */
function loadFunctions() {
  select.innerHTML = `<option value="">-- Chọn chức năng --</option>`;

  FUNCTIONS.forEach((fn) => {
    const opt = document.createElement("option");
    opt.value = fn.name;
    opt.textContent = fn.label;
    select.appendChild(opt);
  });
}

/**
 * Change placeholder when select function
 */
select.addEventListener("change", () => {
  const fn = FUNCTIONS.find((f) => f.name === select.value);
  if (fn) {
    yamlInput.value = fn.placeholder;
  }
});

/**
 * TAB / SHIFT+TAB handling
 */
yamlInput.addEventListener("keydown", function (e) {
  const start = this.selectionStart;
  const end = this.selectionEnd;

  if (e.key === "Tab") {
    e.preventDefault();

    if (e.shiftKey) {
      // un-indent
      const before = this.value.substring(0, start);
      const lineStart = before.lastIndexOf("\n") + 1;

      if (this.value.substring(lineStart, lineStart + 2) === "  ") {
        this.value =
          this.value.substring(0, lineStart) +
          this.value.substring(lineStart + 2);

        this.selectionStart = this.selectionEnd = start - 2;
      }
    } else {
      // indent
      this.value =
        this.value.substring(0, start) + "  " + this.value.substring(end);

      this.selectionStart = this.selectionEnd = start + 2;
    }
  }
});

/**
 * Render table
 */
function renderTable(data) {
  const thead = document.querySelector("#responseTable thead");
  const tbody = document.querySelector("#responseTable tbody");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  if (!data || typeof data !== "object") return;

  const keys = Object.keys(data);

  thead.innerHTML = `<tr>${keys.map((k) => `<th>${k}</th>`).join("")}</tr>`;
  tbody.innerHTML = `<tr>${keys.map((k) => `<td>${data[k]}</td>`).join("")}</tr>`;
}

/**
 * Fetch user info
 */
async function loadUserInfo() {
  try {
    const res = await fetch("oauth2/userinfo");
    const data = await res.json();

    document.getElementById("userInfo").innerText =
      `${data.username} | Groups: ${data.groups?.join(", ")}`;
  } catch {
    document.getElementById("userInfo").innerText = "Unknown user";
  }
}

/**
 * Execute API
 */
document.getElementById("executeBtn").addEventListener("click", async () => {
  const func = select.value;
  if (!func) return alert("Chọn function");

  let jsonData;
  try {
    jsonData = jsyaml.load(yamlInput.value);
  } catch (e) {
    return alert("YAML không hợp lệ");
  }

  try {
    const res = await fetch("/api/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        function: func,
        data: jsonData,
      }),
    });

    const result = await res.json();

    document.getElementById("status").innerText = res.status;
    document.getElementById("description").innerText = result.description || "";

    renderTable(result.data);
  } catch (err) {
    document.getElementById("status").innerText = "ERROR";
    document.getElementById("description").innerText = err.message;
  }
});

/**
 * Init
 */
loadFunctions();
loadUserInfo();
