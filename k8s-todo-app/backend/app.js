const express = require("express");
const redis = require("redis");
const cors = require("cors");

const app = express();
const port = 3001;

// Redis 클라이언트 설정
const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || "redis-service"}:6379`,
});

client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

app.use(cors());
app.use(express.json());

// 헬스체크
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "todo-api" });
});

// 투두 목록 조회
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await client.lRange("todos", 0, -1);
    res.json(todos.map((todo) => JSON.parse(todo)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 투두 추가
app.post("/api/todos", async (req, res) => {
  try {
    const todo = {
      id: Date.now(),
      text: req.body.text,
      completed: false,
    };
    await client.lPush("todos", JSON.stringify(todo));
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 투두 삭제
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const todos = await client.lRange("todos", 0, -1);
    const filtered = todos.filter((todo) => {
      const parsed = JSON.parse(todo);
      return parsed.id !== parseInt(req.params.id);
    });

    await client.del("todos");
    for (const todo of filtered) {
      await client.lPush("todos", todo);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Todo API server running on port ${port}`);
});