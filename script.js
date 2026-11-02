
// DATA STORAGE

let employees = JSON.parse(localStorage.getItem("employees")) || [
    {id:1,name:"Arun Sharma",department:"Finance",role:"Finance Manager",status:"Active"},
    {id:2,name:"Priya Nair",department:"Technology",role:"Software Engineer",status:"Active"},
    {id:3,name:"Rahul Kumar",department:"Operations",role:"Operations Analyst",status:"Active"},
    {id:4,name:"Meera Iyer",department:"HR",role:"HR Executive",status:"On Leave"}
];

let tasks = JSON.parse(localStorage.getItem("tasks")) || [
    {id:1,title:"Prepare monthly finance report",owner:"Arun Sharma",priority:"High",status:"Pending"},
    {id:2,title:"Review access permissions",owner:"Priya Nair",priority:"Medium",status:"In Progress"},
    {id:3,title:"Update operations handbook",owner:"Rahul Kumar",priority:"Low",status:"Completed"}
];

let documents = JSON.parse(localStorage.getItem("documents")) || [];

let knowledge = JSON.parse(localStorage.getItem("knowledge")) || [
    {
        id:1,
        question:"Where are company documents stored?",
        answer:"Use the Document Vault to access organizational documents."
    },
    {
        id:2,
        question:"What should a handover include?",
        answer:"Include responsibilities, pending tasks, contacts and important procedures."
    },
    {
        id:3,
        question:"Who manages critical tasks?",
        answer:"The assigned department manager should monitor critical tasks."
    }
];

// SAVE DATA

function saveData() {
    localStorage.setItem("employees", JSON.stringify(employees));
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("documents", JSON.stringify(documents));
    localStorage.setItem("knowledge", JSON.stringify(knowledge));
}

// HTML SECURITY

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#39;"
    })[c]);
}

// LOGIN AND SIGNUP

function showSignup(event) {
    event.preventDefault();

    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("signupForm").classList.remove("hidden");

    document.getElementById("authSubtitle").textContent =
        "Create your employee account";

    document.getElementById("authMessage").textContent = "";
}

function showLogin(event) {
    event.preventDefault();

    document.getElementById("signupForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");

    document.getElementById("authSubtitle").textContent =
        "Sign in to your workspace";

    document.getElementById("authMessage").textContent = "";
}

document.getElementById("showSignupLink").addEventListener("click", showSignup);
document.getElementById("showLoginLink").addEventListener("click", showLogin);

// CREATE ACCOUNT

document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const id = document.getElementById("signupId").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const department = document.getElementById("signupDepartment").value.trim();
    const role = document.getElementById("signupRole").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    let users = JSON.parse(localStorage.getItem("shadowUsers")) || [];

    if (password.length < 6) {
        document.getElementById("authMessage").textContent =
            "Password must contain at least 6 characters.";
        return;
    }

    if (password !== confirm) {
        document.getElementById("authMessage").textContent =
            "Passwords do not match.";
        return;
    }

    if (users.some(user => user.id.toLowerCase() === id.toLowerCase())) {
        document.getElementById("authMessage").textContent =
            "Employee ID already exists.";
        return;
    }

    const newUser = {
        name,
        id,
        email,
        department,
        role,
        password
    };

    users.push(newUser);
    localStorage.setItem("shadowUsers", JSON.stringify(users));

    employees.push({
        id:Date.now(),
        name,
        department,
        role,
        status:"Active"
    });

    saveData();

    document.getElementById("signupForm").reset();
    document.getElementById("loginId").value = id;

    alert("Account created successfully! Please login.");

    showLogin(event);
});

// LOGIN

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const id = document.getElementById("loginId").value.trim();
    const password = document.getElementById("loginPassword").value;

    const users = JSON.parse(localStorage.getItem("shadowUsers")) || [];

    const user = users.find(
        u => u.id.toLowerCase() === id.toLowerCase() &&
             u.password === password
    );

    if (!user) {
        document.getElementById("authMessage").textContent =
            "Invalid Employee ID or Password.";
        return;
    }

    localStorage.setItem("shadowLoggedIn", JSON.stringify({
        id:user.id,
        name:user.name,
        department:user.department,
        role:user.role
    }));

    openDashboard(user);
});

// OPEN DASHBOARD

function openDashboard(user) {
    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("appShell").classList.remove("hidden");

    document.getElementById("profileName").innerHTML =
        escapeHTML(user.name) + " <span>" +
        escapeHTML(user.role || "Employee") + "</span>";

    refresh();
}

// LOGOUT

function logout() {
    localStorage.removeItem("shadowLoggedIn");
    location.reload();
}

// NAVIGATION

document.querySelectorAll(".nav").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".nav").forEach(b =>
            b.classList.remove("active")
        );

        document.querySelectorAll(".page").forEach(p =>
            p.classList.remove("active-page")
        );

        button.classList.add("active");

        const page = button.dataset.page;

        document.getElementById(page).classList.add("active-page");

        document.getElementById("pageTitle").textContent = {
            dashboard:"Dashboard Overview",
            employees:"Employee Directory",
            tasks:"Task Management",
            documents:"Document Vault",
            handover:"Handover Desk",
            knowledge:"Knowledge Base",
            reports:"Reports & Analytics"
        }[page];

        refresh();
    });
});

// DASHBOARD

function renderDashboard() {
    document.getElementById("employeeCount").textContent = employees.length;
    document.getElementById("taskCount").textContent = tasks.length;

    document.getElementById("pendingCount").textContent =
        tasks.filter(t => t.status !== "Completed").length;

    document.getElementById("knowledgeCount").textContent = knowledge.length;

    const container = document.getElementById("dashboardTasks");
    const pending = tasks.filter(t => t.status !== "Completed");

    container.innerHTML = pending.length ? pending.map(t => `
        <div class="article">
            <h3>${escapeHTML(t.title)}</h3>
            <p>Owner: ${escapeHTML(t.owner)} · ${escapeHTML(t.priority)} Priority</p>
            <span class="status">${escapeHTML(t.status)}</span>
        </div>
    `).join("") : "<p>No pending tasks. Great work!</p>";
}

// EMPLOYEES

function renderEmployees() {
    const search = document.getElementById("employeeSearch").value.toLowerCase();

    const filtered = employees.filter(e =>
        [e.name,e.department,e.role].some(v =>
            v.toLowerCase().includes(search)
        )
    );

    document.getElementById("employeeTable").innerHTML = filtered.length ?
        filtered.map(e => `
            <tr>
                <td>${escapeHTML(e.name)}</td>
                <td>${escapeHTML(e.department)}</td>
                <td>${escapeHTML(e.role)}</td>
                <td><span class="status">${escapeHTML(e.status)}</span></td>
                <td>
                    <button class="delete-btn" onclick="deleteEmployee(${e.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join("") : `
            <tr><td colspan="5">No employees found.</td></tr>
        `;
}

function addEmployee() {
    const name = prompt("Enter employee name:");
    if (!name || !name.trim()) return;

    const department = prompt("Enter department:") || "General";
    const role = prompt("Enter employee role:") || "Employee";

    employees.push({
        id:Date.now(),
        name:name.trim(),
        department:department.trim(),
        role:role.trim(),
        status:"Active"
    });

    saveData();
    refresh();
}

function deleteEmployee(id) {
    if (!confirm("Delete this employee?")) return;

    employees = employees.filter(e => e.id !== id);

    saveData();
    refresh();
}

// TASK MANAGEMENT

function renderTasks() {
    document.getElementById("taskList").innerHTML = tasks.length ?
        tasks.map(t => `
            <div class="task-card">
                <div>
                    <h3>${escapeHTML(t.title)}</h3>
                    <p>Assigned: ${escapeHTML(t.owner)} · Priority: ${escapeHTML(t.priority)}</p>
                </div>

                <select onchange="updateTask(${t.id},this.value)">
                    ${["Pending","In Progress","Completed"].map(s =>
                        `<option ${t.status === s ? "selected" : ""}>${s}</option>`
                    ).join("")}
                </select>

                <button class="delete-btn" onclick="deleteTask(${t.id})">
                    Delete
                </button>
            </div>
        `).join("") : "<p>No tasks available.</p>";
}

function addTask() {
    const title = prompt("Enter task name:");
    if (!title || !title.trim()) return;

    const names = employees.map(e => e.name);

    if (!names.length) {
        alert("Add an employee first.");
        return;
    }

    const owner = prompt(
        "Assign to employee:\n" + names.join(", "),
        names[0]
    );

    if (!owner || !names.includes(owner)) {
        alert("Please enter an existing employee name.");
        return;
    }

    const priority = prompt("Priority: High, Medium or Low", "Medium");

    if (!["High","Medium","Low"].includes(priority)) {
        alert("Enter High, Medium or Low.");
        return;
    }

    tasks.push({
        id:Date.now(),
        title:title.trim(),
        owner,
        priority,
        status:"Pending"
    });

    saveData();
    refresh();
}

function updateTask(id,status) {
    const task = tasks.find(t => t.id === id);

    if (task) task.status = status;

    saveData();
    refresh();
}

function deleteTask(id) {
    if (!confirm("Delete this task?")) return;

    tasks = tasks.filter(t => t.id !== id);

    saveData();
    refresh();
}

// DOCUMENT VAULT

async function uploadDocuments() {
    const files = document.getElementById("documentInput").files;

    if (!files.length) {
        alert("Please select a document.");
        return;
    }

    for (const file of files) {
        if (file.size > 2 * 1024 * 1024) {
            alert(file.name + " is larger than 2 MB. Skipped.");
            continue;
        }

        const reader = new FileReader();

        await new Promise(resolve => {
            reader.onload = () => {
                documents.push({
                    id:Date.now() + Math.random(),
                    name:file.name,
                    type:file.type,
                    content:reader.result
                });

                resolve();
            };

            reader.onerror = resolve;
            reader.readAsDataURL(file);
        });
    }

    saveData();
    renderDocuments();

    document.getElementById("documentInput").value = "";

    alert("Document upload completed.");
}

function renderDocuments() {
    document.getElementById("documentList").innerHTML = documents.length ?
        documents.map(d => `
            <div class="article">
                <h3>▣ ${escapeHTML(d.name)}</h3>

                <a href="${d.content}"
                   download="${encodeURIComponent(d.name)}"
                   class="status">Download</a>

                <button class="delete-btn"
                    onclick="deleteDocument('${d.id}')">
                    Delete
                </button>
            </div>
        `).join("") : "<p>No documents uploaded yet.</p>";
}

function deleteDocument(id) {
    if (!confirm("Delete document?")) return;

    documents = documents.filter(d => String(d.id) !== String(id));

    saveData();
    renderDocuments();
}

// HANDOVER DESK

function generateHandover() {
    const outgoing = document.getElementById("outgoing").value.trim();
    const incoming = document.getElementById("incoming").value.trim();

    const responsibilities =
        document.getElementById("responsibilities").value.trim();

    const pending =
        document.getElementById("pendingWork").value.trim();

    const contacts =
        document.getElementById("contacts").value.trim();

    if (!outgoing || !incoming) {
        alert("Enter both employee names.");
        return;
    }

    const result = `
SHADOWMAP - HANDOVER SUMMARY

Outgoing Employee: ${outgoing}
Incoming Employee: ${incoming}

KEY RESPONSIBILITIES:
${responsibilities || "Not provided"}

PENDING WORK:
${pending || "Not provided"}

IMPORTANT CONTACTS / SYSTEMS:
${contacts || "Not provided"}

Generated on: ${new Date().toLocaleString()}
`;

    document.getElementById("handoverResult").innerHTML = `
        <div class="article">
            <h3>Handover Generated Successfully</h3>

            <pre style="white-space:pre-wrap;color:#cbd5f0;font-size:12px">${escapeHTML(result)}</pre>

            <button class="primary" onclick="downloadHandover()">
                Download Summary
            </button>
        </div>
    `;

    window.lastHandover = result;
}

function downloadHandover() {
    if (!window.lastHandover) return;

    const blob = new Blob([window.lastHandover], {
        type:"text/plain"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "ShadowMap_Handover.txt";
    a.click();

    URL.revokeObjectURL(url);
}

// KNOWLEDGE BASE

function renderKnowledge() {
    const search =
        document.getElementById("knowledgeSearch").value.toLowerCase();

    const filtered = knowledge.filter(k =>
        (k.question + " " + k.answer).toLowerCase().includes(search)
    );

    document.getElementById("knowledgeList").innerHTML = filtered.length ?
        filtered.map(k => `
            <div class="article">
                <h3>${escapeHTML(k.question)}</h3>
                <p>${escapeHTML(k.answer)}</p>

                <button class="delete-btn" onclick="deleteKnowledge(${k.id})">
                    Delete
                </button>
            </div>
        `).join("") : "<p>No matching articles.</p>";
}

function addKnowledge() {
    const question = prompt("Enter article question:");
    if (!question || !question.trim()) return;

    const answer = prompt("Enter article answer:");
    if (!answer || !answer.trim()) return;

    knowledge.push({
        id:Date.now(),
        question:question.trim(),
        answer:answer.trim()
    });

    saveData();
    refresh();
}

function deleteKnowledge(id) {
    if (!confirm("Delete article?")) return;

    knowledge = knowledge.filter(k => k.id !== id);

    saveData();
    refresh();
}

// REPORTS

function renderReports() {
    document.getElementById("reportEmployees").textContent = employees.length;

    document.getElementById("completedTasks").textContent =
        tasks.filter(t => t.status === "Completed").length;

    document.getElementById("reportDocuments").textContent = documents.length;

    const counts = ["Pending","In Progress","Completed"].map(status => ({
        status,
        count:tasks.filter(t => t.status === status).length
    }));

    document.getElementById("taskChart").innerHTML = counts.map(c => `
        <div class="article">
            <p>${c.status}: ${c.count}</p>

            <div class="progress">
                <div style="width:${tasks.length ? c.count / tasks.length * 100 : 0}%"></div>
            </div>
        </div>
    `).join("");
}

function exportReport() {
    const rows = [
        ["Task","Owner","Priority","Status"],
        ...tasks.map(t => [t.title,t.owner,t.priority,t.status])
    ];

    const csv = rows.map(row =>
        row.map(value =>
            '"' + String(value).replace(/"/g,'""') + '"'
        ).join(",")
    ).join("\n");

    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "ShadowMap_Report.csv";
    a.click();

    URL.revokeObjectURL(url);
}

// REFRESH ALL SECTIONS

function refresh() {
    saveData();

    renderDashboard();
    renderEmployees();
    renderTasks();
    renderDocuments();
    renderKnowledge();
    renderReports();
}

// CHECK LOGIN SESSION

const currentUser = JSON.parse(localStorage.getItem("shadowLoggedIn"));

if (currentUser) {
    openDashboard(currentUser);
}
