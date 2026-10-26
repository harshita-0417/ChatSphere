import React, { useState, useEffect } from "react";
import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

export default function Chat({ user, socket, onSignOut }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!activeChat) return;
    axios.get(`${SERVER_URL}/api/messages/${user.uid}/${activeChat.uid}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));
  }, [activeChat, user.uid]);

  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      if (
        (msg.from === activeChat?.uid && msg.to === user.uid) ||
        (msg.from === user.uid && msg.to === activeChat?.uid)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on("private_message", handler);
    socket.on("message_sent", handler);

    return () => {
      socket.off("private_message", handler);
      socket.off("message_sent", handler);
    };
  }, [socket, activeChat, user.uid]);

  const doSearch = async () => {
    if (!search) return setResults([]);

    try {
      const res = await axios.get(`${SERVER_URL}/api/users?search=${encodeURIComponent(search)}`);
      setResults(res.data.filter(u => u.uid !== user.uid));
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = () => {
    if (!text.trim() || !socket || !activeChat) return;

    socket.emit("private_message", {
      from: user.uid,
      to: activeChat.uid,
      text: text.trim()
    });

    setText("");
  };

  const openChat = (other) => {
    setActiveChat(other);
    setMessages([]);
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="me">
          <img src={user.photoURL} className="avatar" />
          <div>
            <div className="bold">{user.name}</div>
            <div className="muted">{user.username}</div>
          </div>
          <button className="small-btn" onClick={onSignOut}>Logout</button>
        </div>

        <div className="search-area">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search username" />
          <button className="btn full" onClick={doSearch}>Search</button>

          <div className="results">
            {results.map(r => (
              <div key={r.uid} className="result" onClick={() => openChat(r)}>
                <img src={r.photoURL} className="avatar-sm" />
                <div>
                  <strong>{r.name}</strong>
                  <div className="muted">{r.username}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="chat-area">
        {activeChat ? (
          <>
            <div className="chat-header">
              <img src={activeChat.photoURL} className="avatar" />
              <div>
                <strong>{activeChat.name}</strong>
                <div className="muted">{activeChat.username}</div>
              </div>
            </div>

            <div className="messages">
              {messages.map((m, i) => {
                const isMe = m.from === user.uid;
                return (
                  <div key={i} className={`message ${isMe ? "me" : "them"}`}>
                    <div className="bubble">
                      <div>{m.text}</div>
                      <div className="time">
                        {new Date(m.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="composer">
              <input 
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type a message"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="btn" onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="empty">Search a user and click to chat</div>
        )}
      </main>
    </div>
  );
}
