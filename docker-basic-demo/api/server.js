const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "secret",
  database: process.env.DB_NAME || "simple_blog",
  timezone: "+09:00",
  charset: "utf8mb4",
  supportBigNumbers: true,
  bigNumberStrings: true,
};

let connection;

async function connectDatabase() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ MySQL 데이터베이스 연결 성공");
    console.log(
      `📍 연결 정보: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
    );
  } catch (error) {
    console.error("❌ 데이터베이스 연결 실패:", error.message);
    console.log("🔄 5초 후 재시도...");
    setTimeout(connectDatabase, 5000);
  }
}

app.get("/health", async (req, res) => {
  try {
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM posts"
    );
    res.json({
      status: "OK",
      message: "API 서버가 정상 동작합니다.",
      timestamps: new Date().toISOString(),
      database: "connected",
      posts_count: rows[0].count,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const [rows] = await connection.execute(
      "SELECT id, title, content, created_at FROM posts ORDER BY created_at DESC"
    );
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("게시글 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "게시글 조회에 실패했습니다",
      error: error.message,
    });
  }
});

app.post("/posts", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: "제목과 내용은 필수입니다",
    });
  }

  try {
    const [result] = await connection.execute(
      "INSERT INTO posts (title, content) VALUES (?, ?)",
      [title, content]
    );

    const [newPost] = await connection.execute(
      "SELECT id, title, content, created_at FROM posts WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "게시글이 작성되었습니다",
      data: newPost[0],
    });
  } catch (error) {
    console.error("게시글 작성 오류:", error);
    res.status(500).json({
      success: false,
      message: "게시글 작성에 실패했습니다",
      error: error.message,
    });
  }
});

app.get("/posts/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    const [rows] = await connection.execute(
      "SELECT id, title, content, created_at FROM posts WHERE id = ?",
      [postId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "게시글을 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("게시글 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "게시글 조회에 실패했습니다",
      error: error.message,
    });
  }
});

app.delete("/posts/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    const [result] = await connection.execute(
      "DELETE FROM posts WHERE id = ?",
      [postId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "게시글을 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      message: "게시글이 삭제되었습니다",
    });
  } catch (error) {
    console.error("게시글 삭제 오류:", error);
    res.status(500).json({
      success: false,
      message: "게시글 삭제에 실패했습니다",
      error: error.message,
    });
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 API 서버가 포트 ${PORT}에서 실행중입니다`);
  console.log(`📋 API 문서: http://localhost:${PORT}/health`);

  await connectDatabase();
});

process.on("SIGINT", async () => {
  console.log("\n🛑 서버를 종료합니다...");
  if (connection) {
    await connection.end();
    console.log("✅ 데이터베이스 연결 종료");
  }
  process.exit(0);
});