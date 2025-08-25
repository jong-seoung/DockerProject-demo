const API_BASE = "http://localhost:3001/api";

// 연결 상태 확인
async function checkConnection() {
  try {
    const response = await fetch("http://localhost:3001/health");
    const data = await response.json();
    document.getElementById("status").textContent = `✅ ${data.service} 연결됨`;
    document.getElementById("status").style.color = "green";
  } catch (error) {
    document.getElementById("status").textContent = "❌ 백엔드 연결 실패";
    document.getElementById("status").style.color = "red";
  }
}

// 투두 목록 로드
async function loadTodos() {
  try {
    const response = await fetch(`${API_BASE}/todos`);
    const todos = await response.json();

    const todoList = document.getElementById("todoList");
    todoList.innerHTML = "";

    todos.forEach((todo) => {
      const todoItem = document.createElement("div");
      todoItem.className = "todo-item";
      todoItem.innerHTML = `
                <span>${todo.text}</span>
                <button onclick="deleteTodo(${todo.id})">삭제</button>
            `;
      todoList.appendChild(todoItem);
    });
  } catch (error) {
    console.error("투두 로드 실패:", error);
  }
}

// 투두 추가
async function addTodo() {
  const input = document.getElementById("todoInput");
  const text = input.value.trim();

  if (!text) return;

  try {
    await fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    input.value = "";
    loadTodos();
  } catch (error) {
    console.error("투두 추가 실패:", error);
  }
}

// 투두 삭제
async function deleteTodo(id) {
  try {
    await fetch(`${API_BASE}/todos/${id}`, { method: "DELETE" });
    loadTodos();
  } catch (error) {
    console.error("투두 삭제 실패:", error);
  }
}

// Enter 키로 투두 추가
document.getElementById("todoInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") addTodo();
});

// 초기 로드
checkConnection();
loadTodos();