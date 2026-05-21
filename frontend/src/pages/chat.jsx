import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import { io } from 'socket.io-client'
import axios from 'axios'


const socket = io("http://localhost:5000")

function Chat() {
  const [message, setMessage] = useState("") //fro the one message
  const [messages, setMessages] = useState([]) // all message
  const [users, setUsers] = useState([]) // all user in app
  const [showScrollButton, setShowScrollButton] = useState(false) // toggle scroll button
  const [selectedUser, setSelectedUser] = useState(null) // for store selected user
  const [unreadCounts, setUnreadCounts] = useState({}) // for count unreadCounts

  const inputRef = useRef(null)//for focus on input 
  const messageEndRef = useRef(null) //for message end 
  const chatContainerRef = useRef(null) //for whole message container ref

  const loggedInUser = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/")
    }
  }, [])



  // receive message  logic
  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (selectedUser && selectedUser._id === data.senderId) {
        setMessages((prev) => [
          ...prev,
          {
            text: data.text,
            sender: "other",
            name: data.senderName,
            time: data.time
          }
        ])
      }
      else {
        setUnreadCounts((prev) => ({
          ...prev,
          [data.senderId]: (prev[data.senderId] || 0) + 1
        }))
      }

      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({
          behavior: "smooth"
        })
      }, 100)
    })

    return () => {
      socket.off("receive_message")
    }
  }, [selectedUser])

  //get all user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let response = await axios.get("http://localhost:5000/api/auth/users")

        setUsers(response.data.users)
        console.log(response.data.users);

      } catch (error) {
        console.log(error)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    if (loggedInUser?.id) {
      socket.emit("register_user", loggedInUser.id)
    }
  }, [])

  // fetch unread counts 
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/message/unread/${loggedInUser.id}`)
        //console.log(response)

        const count = {}

        response.data.unreadMessages.forEach((item) => {
          count[item._id] = item.count
        })
        setUnreadCounts(count)

      } catch (error) {
        console.log(error);

      }
    }
    if (loggedInUser?.id) {
      fetchUnreadCounts()
    }
  }, [loggedInUser])



  // handle scroll event
  const handleScroll = () => {
    const chatBox = chatContainerRef.current//full messages container DOM element.

    if (!chatBox) return

    const totalHeight = chatBox.scrollHeight
    const scrolledHeight = chatBox.scrollTop
    const visibleHeight = chatBox.clientHeight

    const isBottom =
      totalHeight - scrolledHeight <= visibleHeight + 50 //2000-1400 <= 550 +50   // 600 <= 600 

    setShowScrollButton(!isBottom)
  }
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth"
    })
  }
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    navigate("/", { replace: true })
  }
  // send message 
  const sendMessage = async () => {
    if (message.trim() === "" || !selectedUser) return

    const messageData = {
      senderId: loggedInUser.id,
      receiverId: selectedUser._id,
      text: message,
      senderName: loggedInUser.username,
      time: new Date().toLocaleTimeString()
    }

    try {
      await axios.post(
        "http://localhost:5000/api/message/save",
        {
          senderId: loggedInUser.id,
          receiverId: selectedUser._id,
          text: message
        }
      )

      setMessages((prev) => [
        ...prev,
        {
          text: message,
          sender: "me",
          name: "Me",
          time: messageData.time
        }
      ])

      socket.emit("send_message", messageData)

      setMessage("")
      inputRef.current.focus()

      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({
          behavior: "smooth"
        })
      }, 100)

    } catch (error) {
      console.log(error)
    }
  }

  const handleSelectUser = async (user) => {
    setSelectedUser(user)

    setUnreadCounts((prev) => ({
      ...prev,
      [user._id]: 0
    }))

    try {
      const response = await axios.get(
        `http://localhost:5000/api/message/conversation/${loggedInUser.id}/${user._id}`
      )

      //console.log(response.data)

      const formattedMessages = response.data.messages.map((msg) => ({
        text: msg.text,
        sender: msg.senderId === loggedInUser.id ? "me" : "other",
        name: msg.senderId === loggedInUser.id ? "Me" : user.username,
        time: new Date(msg.createdAt).toLocaleTimeString()
      }))

      setMessages(formattedMessages)



    } catch (error) {
      console.log(error)
    }
  }


  if (!loggedInUser) {
    return null
  }
  return (
    <>
      <div className="container-fluid bg-dark text-light p-0 vh-100 d-flex flex-column overflow-hidden">

        {/* Navbar (Header) */}
        <div className="bg-black py-3 px-3 border-bottom border-secondary flex-shrink-0">
          <div className="d-flex justify-content-between align-items-center">

            <h2 className="mb-0 fw-bold fs-4 fs-md-3 text-light">
              Real Time Chat App
            </h2>

            <div className="d-flex align-items-center gap-3">

              {/* Profile Avatar Hover */}
              <div
                className="position-relative profile-avatar"
                style={{ cursor: "pointer" }}
              >
                <div
                  className="rounded-circle d-flex justify-content-center align-items-center fw-bold"
                  style={{
                    width: "42px",
                    height: "42px",
                    backgroundColor: "#50D0D0",
                    color: "#000",
                    fontSize: "16px"
                  }}
                >
                  {loggedInUser.username.slice(0, 2).toUpperCase()}
                </div>

                {/* Hover Popup */}
                <div
                  className="position-absolute bg-dark border border-secondary rounded shadow p-3 profile-popup"
                  style={{
                    top: "55px",
                    right: "0",
                    minWidth: "220px",
                    zIndex: 2000
                  }}
                >
                  <div className="fw-bold text-light">
                    {loggedInUser.username}
                  </div>

                  <small className="text-secondary">
                    {loggedInUser.email}
                  </small>
                </div>
              </div>

              {/* Logout Button */}
              <button
                className="btn btn-sm fw-semibold"
                onClick={handleLogout}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#3BB8B8"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#50D0D0"
                }}
                style={{
                  backgroundColor: "#50D0D0",
                  color: "#000",
                  border: "none",
                  transition: "0.3s ease"
                }}
              >
                Logout
              </button>

            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="d-flex flex-grow-1 overflow-hidden">

          {/* 2. Sidebar: Added d-flex flex-column so the inner list scrolls properly */}
          <div
            className="bg-black border-end border-secondary d-flex flex-column flex-shrink-0"
            style={{ width: "300px" }}
          >
            <h5 className="p-3 mb-0 text-light border-bottom border-secondary flex-shrink-0">
              Your Contact
            </h5>

            <div className="overflow-auto flex-grow-1">


              {/* other users */}
              {users
                .filter((user) => user._id !== loggedInUser.id)
                .map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleSelectUser(user)}
                    className="p-3 border-bottom border-secondary"
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedUser?._id === user._id ? "#2a2a2a" : "transparent",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="fw-semibold text-light">
                        {user.username}
                      </div>

                      {unreadCounts[user._id] > 0 && (
                        <span
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: "#25D366",
                            color: "#000",
                            minWidth: "24px",
                            fontSize: "12px"
                          }}
                        >
                          {unreadCounts[user._id]}
                        </span>
                      )}
                    </div>

                    <small className="text-secondary">
                      {user.email}
                    </small>
                  </div>

                ))}
            </div>
          </div>

          {/* Right Chat Panel */}
          {selectedUser &&
            (<div className="flex-grow-1 d-flex flex-column overflow-hidden">

              {/* Selected user chat header */}
              {selectedUser && (
                <div className="bg-black px-3 py-3 border-bottom border-secondary flex-shrink-0">
                  <div className="fw-bold text-light fs-5">
                    {selectedUser.username}
                  </div>
                  <small className="text-secondary">
                    {selectedUser.email}
                  </small>
                </div>
              )}

              {/* Messages */}
              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-grow-1 overflow-auto p-3 chat-messages"
              >
                <div className="d-flex flex-column gap-3">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`d-flex ${msg.sender === "me" ? "justify-content-end" : "justify-content-start"
                        }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-3 shadow-sm ${msg.sender === "me" ? "bg-primary text-white" : "bg-secondary text-white"
                          }`}
                      >
                        <div>{msg.text}</div>
                        <small className="d-block mt-1 opacity-75">
                          {msg.name} • {msg.time}
                        </small>
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef}></div>
                </div>

                {showScrollButton && (
                  <button
                    className="btn btn-primary rounded-circle position-absolute shadow"
                    onClick={scrollToBottom}
                    style={{
                      bottom: "90px",
                      right: "20px",
                      width: "50px",
                      height: "50px",
                      zIndex: 1000,
                    }}
                  >
                    ↓
                  </button>
                )}
              </div>

              {/* 3. Input Panel: Added flex-shrink-0 and replaced grid with flexbox */}
              <div className="bg-black p-3 border-top border-secondary flex-shrink-0">
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary flex-grow-1"
                    placeholder="Type your message..."
                    value={message}
                    ref={inputRef}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                  />
                  <button
                    className="btn btn-primary fw-semibold px-4 flex-shrink-0"
                    onClick={sendMessage}
                  >
                    Send
                  </button>
                </div>
              </div>

            </div>)}
        </div>
      </div>
    </>
  )
}

export default Chat