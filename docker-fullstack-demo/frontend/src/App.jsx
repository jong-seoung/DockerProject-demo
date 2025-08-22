import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// API 기본 URL 설정
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const App = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [showForm, setShowForm] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  // API 상태 확인
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/posts/health`);
        setApiStatus(response.data);
      } catch (error) {
        console.error("API 상태 확인 실패:", error);
        setApiStatus({
          status: "DOWN",
          message: "API 서버에 연결할 수 없습니다",
        });
      }
    };

    checkApiHealth();
  }, []);

  // 게시글 목록 조회
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/posts`);
        setPosts(response.data);
        setError(null);
      } catch (error) {
        console.error("게시글 조회 실패:", error);
        setError(
          "게시글을 불러오는데 실패했습니다. 백엔드 서버가 실행되고 있는지 확인해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 새 게시글 작성
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/posts`, {
        title: newPost.title,
        content: newPost.content,
        authorId: 1, // 기본 작성자
      });

      setPosts([response.data, ...posts]);
      setNewPost({ title: "", content: "" });
      setShowForm(false);
      alert("게시글이 작성되었습니다!");
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      alert("게시글 작성에 실패했습니다.");
    }
  };

  // 게시글 삭제
  const handleDelete = async (postId) => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`);
      setPosts(posts.filter((post) => post.id !== postId));
      alert("게시글이 삭제되었습니다.");
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR");
  };

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>🐳 Docker 블로그</h1>
          <div className="loading">게시글을 불러오는 중...</div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐳 Docker 블로그</h1>
        <p>React + Spring Boot + MySQL 연동 데모</p>

        {/* API 상태 표시 */}
        {apiStatus && (
          <div
            className={`api-status ${
              apiStatus.status === "UP" ? "healthy" : "unhealthy"
            }`}
          >
            API 상태: {apiStatus.status} | {apiStatus.message}
            {apiStatus.posts_count !== undefined &&
              ` | 총 게시글: ${apiStatus.posts_count}개`}
          </div>
        )}
      </header>

      <main className="App-main">
        {error ? (
          <div className="error-message">
            <h2>⚠️ 오류 발생</h2>
            <p>{error}</p>
            <p>해결 방법:</p>
            <ul>
              <li>
                백엔드 서버가 실행되고 있는지 확인 (http://localhost:8080)
              </li>
              <li>네트워크 연결 상태 확인</li>
              <li>
                Docker 컨테이너 상태 확인: <code>docker ps</code>
              </li>
            </ul>
          </div>
        ) : (
          <>
            {/* 게시글 작성 폼 */}
            <div className="post-form-section">
              <button
                className="toggle-form-btn"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "작성 취소" : "새 게시글 작성"}
              </button>

              {showForm && (
                <form className="post-form" onSubmit={handleSubmit}>
                  <h3>새 게시글 작성</h3>
                  <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    className="form-input"
                  />
                  <textarea
                    placeholder="내용을 입력하세요"
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    className="form-textarea"
                    rows="5"
                  />
                  <div className="form-buttons">
                    <button type="submit" className="submit-btn">
                      작성
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="cancel-btn"
                    >
                      취소
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 게시글 목록 */}
            <div className="posts-section">
              <h2>게시글 목록 ({posts.length}개)</h2>

              {posts.length === 0 ? (
                <div className="no-posts">
                  <p>아직 게시글이 없습니다.</p>
                  <p>첫 번째 게시글을 작성해보세요!</p>
                </div>
              ) : (
                <div className="posts-grid">
                  {posts.map((post) => (
                    <article key={post.id} className="post-card">
                      <header className="post-header">
                        <h3 className="post-title">{post.title}</h3>
                        <div className="post-meta">
                          <span>작성자 ID: {post.authorId}</span>
                          <span>작성일: {formatDate(post.createdAt)}</span>
                        </div>
                      </header>

                      <div className="post-content">
                        <p>{post.content}</p>
                      </div>

                      <footer className="post-footer">
                        <small>최종 수정: {formatDate(post.updatedAt)}</small>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="delete-btn"
                        >
                          삭제
                        </button>
                      </footer>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="App-footer">
        <p>Docker 네트워킹 & 볼륨 실습 - React + Spring Boot + MySQL</p>
        <p>
          백엔드 API:{" "}
          <a
            href="http://localhost:8080/api/posts/health"
            target="_blank"
            rel="noopener noreferrer"
          >
            http://localhost:8080/api/posts/health
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;