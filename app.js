let currentRole = null;

// ===== ТЕСТОВЫЕ ЗАДАЧИ =====
let tasks = [
  { title: "Добавить 10 контактов", user: "member", progress: 40 },
  { title: "Созвон с клиентом", user: "member", progress: 70 },
  { title: "Обучение команды", user: "mentor", progress: 90 }
];

// ===== ОЖИДАЕМ ЗАГРУЗКУ СТРАНИЦЫ =====

document.addEventListener("DOMContentLoaded", function () {
  const loginBox = document.getElementById("loginBox");
const app = document.getElementById("app");

// 👉 при старте
loginBox.style.display = "block";
app.style.display = "none";

  const loginBox = document.getElementById("loginBox");
  const app = document.getElementById("app");
  const button = document.querySelector("button");

  button.addEventListener("click", function () {

    const login = document.querySelector("input[type='text']").value;
    const password = document.querySelector("input[type='password']").value;

    if (login === "mentor" && password === "123") {

      currentRole = "mentor";

      loginBox.style.display = "none";
      app.style.display = "block";

      showMentorPanel();
      renderTasks();

    } else if (login === "member" && password === "123") {

      currentRole = "member";

      loginBox.style.display = "none";
      app.style.display = "block";

      showMemberPanel();
      renderTasks();

    } else {
      alert("Неверный логин или пароль");
    }

  });

});

// ===== ФУНКЦИИ РОЛЕЙ =====
function showMentorPanel() {
  document.querySelector("h1").innerText = "Панель наставника";

  const analytics = document.getElementById("analyticsBlock");
  if (analytics) {
    analytics.style.display = "block";
  }
}

function showMemberPanel() {
  document.querySelector("h1").innerText = "Мои задачи";

  const analytics = document.getElementById("analyticsBlock");
  if (analytics) {
    analytics.style.display = "none";
  }
}

// ===== ОТРИСОВКА ЗАДАЧ =====
function renderTasks() {

  let container = document.getElementById("tasksContainer");

  if (!container) return;

  container.innerHTML = "";

  let visibleTasks;

  if (currentRole === "mentor") {
    visibleTasks = tasks;
  } else {
    visibleTasks = tasks.filter(t => t.user === "member");
  }

  visibleTasks.forEach(task => {
    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${task.title}</h3>
      <p>Прогресс: ${task.progress}%</p>
      <div class="progress">
        <div class="progress-bar" style="width: ${task.progress}%"></div>
      </div>
    `;

    container.appendChild(div);
  });
}

