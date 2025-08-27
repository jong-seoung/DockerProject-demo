// backend/app.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// 미들웨어 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// 환경변수에서 설정 읽기
const config = {
  // ConfigMap에서 주입된 설정들
  environment: process.env.ENVIRONMENT || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  timezone: process.env.TIMEZONE || 'UTC',

  // 데이터베이스 설정 (ConfigMap + Secret)
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'testdb',
    user: process.env.DB_USERNAME || 'root',        // Secret에서
    password: process.env.DB_PASSWORD || 'password' // Secret에서
  },

  // API 설정
  port: parseInt(process.env.API_PORT) || 3001,

  // JWT 설정 (Secret에서)
  jwtSecret: process.env.JWT_SECRET || 'default-secret',

  // 기능 플래그 (ConfigMap에서)
  features: {
    comments: process.env.FEATURE_COMMENTS === 'true',
    userRegistration: process.env.FEATURE_USER_REGISTRATION === 'true'
  }
};

// 설정 파일 읽기 (ConfigMap에서 파일로 마운트된 것)
let appProperties = {};
try {
  const propertiesPath = '/app/config/app.properties';
  if (fs.existsSync(propertiesPath)) {
    const content = fs.readFileSync(propertiesPath, 'utf8');
    console.log('📄 설정 파일 내용:', content);

    // 간단한 properties 파싱
    content.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          appProperties[key.trim()] = value.trim();
        }
      }
    });
  }
} catch (error) {
  console.log('⚠️ 설정 파일을 읽을 수 없습니다:', error.message);
}

// 데이터베이스 연결
let db;
async function connectDatabase() {
  try {
    db = await mysql.createConnection(config.db);
    console.log(`✅ 데이터베이스 연결 성공: ${config.db.host}:${config.db.port}/${config.db.database}`);

    // 테이블 생성
    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 샘플 데이터 생성
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM posts');
    if (rows[0].count === 0) {
      await db.execute(`
        INSERT INTO posts (title, content, author) VALUES
        ('🎉 환영합니다!', '쿠버네티스 ConfigMap과 Secret 실습용 블로그입니다.', 'K8s 관리자'),
        ('⚙️ 설정 관리', 'ConfigMap으로 환경별 설정을 안전하게 관리할 수 있습니다.', '개발자'),
        ('🔐 보안 관리', 'Secret으로 민감한 정보를 암호화하여 저장합니다.', '보안팀')
      `);
      console.log('📝 샘플 데이터가 추가되었습니다.');
    }
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    process.exit(1);
  }
}

// API 라우트들
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: config.environment,
    timestamp: new Date().toISOString(),
    config: {
      logLevel: config.logLevel,
      timezone: config.timezone,
      dbHost: config.db.host,
      features: config.features,
      appProperties: appProperties
    }
  });
});

app.get('/posts', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('❌ 게시글 조회 실패:', error);
    res.status(500).json({ error: '게시글을 가져올 수 없습니다.' });
  }
});

app.post('/posts', async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ error: '제목, 내용, 작성자는 필수입니다.' });
    }

    const [result] = await db.execute(
      'INSERT INTO posts (title, content, author) VALUES (?, ?, ?)',
      [title, content, author]
    );

    res.status(201).json({
      id: result.insertId,
      message: '게시글이 작성되었습니다.',
      features: config.features
    });
  } catch (error) {
    console.error('❌ 게시글 작성 실패:', error);
    res.status(500).json({ error: '게시글을 작성할 수 없습니다.' });
  }
});

// 설정 정보 확인 API
app.get('/config', (req, res) => {
  res.json({
    environment: config.environment,
    logLevel: config.logLevel,
    timezone: config.timezone,
    features: config.features,
    appProperties: appProperties,
    databaseInfo: {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user
      // 비밀번호는 절대 노출하지 않음!
    }
  });
});

// 서버 시작
async function startServer() {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`🚀 블로그 API 서버가 포트 ${config.port}에서 실행 중입니다.`);
    console.log(`📊 환경: ${config.environment}`);
    console.log(`📋 로그 레벨: ${config.logLevel}`);
    console.log(`🌍 타임존: ${config.timezone}`);
    console.log(`🔧 기능 플래그:`, config.features);
    console.log(`📄 앱 설정:`, appProperties);
  });
}

startServer().catch(console.error);