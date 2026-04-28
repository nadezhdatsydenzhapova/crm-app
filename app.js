let users = [
  { name: "Иван", progress: 90 },
  { name: "Мария", progress: 70 },
  { name: "Алексей", progress: 40 },
  { name: "Дима", progress: 20 }
];
function updateAnalytics() {

  let total = users.length;

  let sum = users.reduce((acc, u) => acc + u.progress, 0);
  let avg = Math.round(sum / total);

  let best = users.reduce((prev, current) =>
    (prev.progress > current.progress) ? prev : current
  );

  let low = users.filter(u => u.progress < 50).length;

  document.getElementById("totalUsers").innerText = total;
  document.getElementById("avgProgress").innerText = avg + "%";
  document.getElementById("bestUser").innerText = best.name + " — " + best.progress + "%";
  document.getElementById("lowUsers").innerText = low;
}

updateAnalytics();

document.addEventListener('DOMContentLoaded', () => {
    // LocalStorage Helpers
    const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
    const saveUsers = (users) => localStorage.setItem('users', JSON.stringify(users));
    const getTasks = () => JSON.parse(localStorage.getItem('tasks') || '[]');
    const saveTasks = (tasks) => localStorage.setItem('tasks', JSON.stringify(tasks));
    const getAssignedTasks = () => JSON.parse(localStorage.getItem('assignedTasks') || '[]');
    const saveAssignedTasks = (tasks) => localStorage.setItem('assignedTasks', JSON.stringify(tasks));

    // UI Elements
    const loginSection = document.getElementById('login-section');
    const mentorDashboard = document.getElementById('mentor-dashboard');
    const memberDashboard = document.getElementById('member-dashboard');
    const loginError = document.getElementById('login-error');

    // Show/Hide Sections
    const hideAllSections = () => {
        loginSection.style.display = 'none';
        mentorDashboard.style.display = 'none';
        memberDashboard.style.display = 'none';
    };

    const showLogin = () => {
        hideAllSections();
        loginSection.style.display = 'block';
        loginError.textContent = '';
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
    };

    const showMentorDashboard = () => {
        hideAllSections();
        mentorDashboard.style.display = 'block';
        renderMentorUI();
    };

    const showMemberDashboard = () => {
        hideAllSections();
        memberDashboard.style.display = 'block';
        renderMemberUI();
    };

    // Render Mentor UI
    const renderMentorUI = () => {
        renderUsersList();
        populateAssignSelects();
    };

    const renderUsersList = () => {
        const users = getUsers().filter(user => user.role === 'member');
        const usersListEl = document.getElementById('users-list');
        usersListEl.innerHTML = '';

        if (users.length === 0) {
            usersListEl.innerHTML = '<p>No members added yet.</p>';
            return;
        }

        users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.className = 'user-item';
            const assignedTasks = getAssignedTasks().filter(task => task.user_id === user.id);
            let tasksHtml = '<ul>';
            assignedTasks.forEach(task => {
                const taskTemplate = getTasks().find(t => t.id === task.task_id);
                const title = taskTemplate ? taskTemplate.title : 'Unknown Task';
                const statusClass = task.current >= task.target ? 'completed' : 'active';
                const statusText = task.current >= task.target ? 'Completed' : 'Active';
                tasksHtml += `<li>${title}: ${task.current}/${task.target} <span class="${statusClass}">(${statusText})</span></li>`;
            });
            tasksHtml += '</ul>';
            userEl.innerHTML = `
                <h3>${user.name}</h3>
                <p>Tasks:</p>
                ${assignedTasks.length > 0 ? tasksHtml : '<p>No tasks assigned yet.</p>'}
            `;
            usersListEl.appendChild(userEl);
        });
    };

    const populateAssignSelects = () => {
        const members = getUsers().filter(user => user.role === 'member');
        const tasks = getTasks();
        const userSelect = document.getElementById('assign-user-select');
        const taskSelect = document.getElementById('assign-task-select');

        userSelect.innerHTML = members.length > 0 
            ? members.map(u => `<option value="${u.id}">${u.name}</option>`).join('')
            : '<option value="">No members available</option>';
        
        taskSelect.innerHTML = tasks.length > 0 
            ? tasks.map(t => `<option value="${t.id}">${t.title} (Target: ${t.target})</option>`).join('')
            : '<option value="">No tasks available</option>';
    };

    // Render Member UI
    const renderMemberUI = () => {
        const currentUserId = localStorage.getItem('currentUserId');
        const assignedTasks = getAssignedTasks().filter(task => task.user_id === currentUserId);
        const tasksListEl = document.getElementById('member-tasks-list');
        tasksListEl.innerHTML = '';

        if (assignedTasks.length === 0) {
            tasksListEl.innerHTML = '<p>No tasks assigned yet.</p>';
            return;
        }

        assignedTasks.forEach(task => {
            const taskTemplate = getTasks().find(t => t.id === task.task_id);
            const title = taskTemplate ? taskTemplate.title : 'Unknown Task';
            const isCompleted = task.current >= task.target;
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            taskEl.innerHTML = `
                <h3>${title}</h3>
                <p>Progress: ${task.current}/${task.target}</p>
                <p>Status: <span class="${isCompleted ? 'completed' : 'active'}">${isCompleted ? 'Completed' : 'Active'}</span></p>
                ${!isCompleted ? `<button class="increment-btn" data-task-id="${task.id}">+1</button>` : ''}
            `;
            tasksListEl.appendChild(taskEl);
        });

        // Add event listeners to increment buttons
        document.querySelectorAll('.increment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                incrementProgress(e.target.dataset.taskId);
            });
        });
    };

    // Increment Progress
    const incrementProgress = (taskId) => {
        const assignedTasks = getAssignedTasks();
        const taskIndex = assignedTasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;

        const task = assignedTasks[taskIndex];
        if (task.current >= task.target) return; // Prevent increasing if already completed

        task.current += 1;
        if (task.current >= task.target) {
            task.status = 'completed';
        }
        assignedTasks[taskIndex] = task;
        saveAssignedTasks(assignedTasks);
        renderMemberUI();
    };

    // Login Handler
    const handleLogin = () => {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        // Mentor Login
        if (username === 'mentor' && password === '123') {
            localStorage.setItem('role', 'mentor');
            localStorage.setItem('currentUserId', 'mentor');
            showMentorDashboard();
            loginError.textContent = '';
        } 
        // Member Login
        else if (username === 'member' && password === '123') {
            const members = getUsers().filter(user => user.role === 'member');
            if (members.length > 0) {
                // Use first member for login (simplified for MVP)
                localStorage.setItem('role', 'member');
                localStorage.setItem('currentUserId', members[0].id);
                showMemberDashboard();
                loginError.textContent = '';
            } else {
                loginError.textContent = 'No member accounts exist. Contact your mentor to create one.';
            }
        } 
        // Invalid Credentials
        else {
            loginError.textContent = 'Invalid username or password.';
        }
    };

    // Logout Handler
    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('currentUserId');
        showLogin();
    };

    // Event Listeners
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('member-logout-btn').addEventListener('click', handleLogout);

    // Mentor: Add User
    document.getElementById('add-user-btn').addEventListener('click', () => {
        const nameInput = document.getElementById('new-user-name');
        const name = nameInput.value.trim();
        if (!name) {
            alert('Please enter a user name.');
            return;
        }
        const users = getUsers();
        users.push({
            id: Date.now().toString(),
            name,
            role: 'member',
            mentor_id: 'mentor'
        });
        saveUsers(users);
        nameInput.value = '';
        renderMentorUI();
    });

    // Mentor: Create Task
    document.getElementById('create-task-btn').addEventListener('click', () => {
        const titleInput = document.getElementById('task-title');
        const targetInput = document.getElementById('task-target');
        const title = titleInput.value.trim();
        const target = Number(targetInput.value);

        if (!title || !target || target < 1) {
            alert('Please enter a valid task title and target (minimum 1).');
            return;
        }

        const tasks = getTasks();
        tasks.push({
            id: Date.now().toString(),
            title,
            target
        });
        saveTasks(tasks);
        titleInput.value = '';
        targetInput.value = '';
        renderMentorUI();
    });

    // Mentor: Assign Task
    document.getElementById('assign-task-btn').addEventListener('click', () => {
        const userSelect = document.getElementById('assign-user-select');
        const taskSelect = document.getElementById('assign-task-select');
        const userId = userSelect.value;
        const taskId = taskSelect.value;

        if (!userId || !taskId || userId === '' || taskId === '') {
            alert('Please select a user and a task to assign.');
            return;
        }

        const taskTemplate = getTasks().find(t => t.id === taskId);
        if (!taskTemplate) {
            alert('Selected task not found.');
            return;
        }

        const assignedTasks = getAssignedTasks();
        // Check if task is already assigned to user
        const existingAssignment = assignedTasks.find(t => t.user_id === userId && t.task_id === taskId);
        if (existingAssignment) {
            alert('This task is already assigned to the selected user.');
            return;
        }

        assignedTasks.push({
            id: Date.now().toString(),
            task_id: taskId,
            user_id: userId,
            current: 0,
            target: taskTemplate.target,
            status: 'active'
        });
        saveAssignedTasks(assignedTasks);
        renderMentorUI();
    });

    // Allow login on Enter key press
    document.getElementById('login-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('login-username').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Initialize App
    const currentRole = localStorage.getItem('role');
    if (currentRole === 'mentor') {
        showMentorDashboard();
    } else if (currentRole === 'member') {
        const members = getUsers().filter(user => user.role === 'member');
        const currentUserId = localStorage.getItem('currentUserId');
        if (members.some(m => m.id === currentUserId)) {
            showMemberDashboard();
        } else {
            // Invalid member ID, log out
            handleLogout();
        }
    } else {
        showLogin();
    }
});
document.addEventListener("DOMContentLoaded", function () {

  const loginBox = document.getElementById("loginBox");
  const app = document.getElementById("app");
  const button = document.querySelector("button");

  button.addEventListener("click", function () {

    const login = document.querySelector("input[type='text']").value;
    const password = document.querySelector("input[type='password']").value;

    if ((login === "mentor" || login === "member") && password === "123") {
      loginBox.style.display = "none";
      app.style.display = "block";
    } else {
      alert("Неверный логин или пароль");
    }

  });

});
