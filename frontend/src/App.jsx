import { useState, useRef, useEffect } from 'react'
import './App.css'
import { io } from 'socket.io-client'

const socket = io("http://localhost:5000")

function App() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const inputRef = useRef(null)
  const messageEndRef = useRef(null)

  // receive message  logic
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          text: data,
          sender: "other",
          name: "Other",
          time: new Date().toLocaleTimeString()
        }
      ])

      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({
          behavior: "smooth"
        })
      }, 100)
    })

    return () => {
      socket.off("receive_message")
    }
  }, [])

  // send message 
  const sendMessage = () => {
    if (message.trim() === "") return

    setMessages((prev) => [
      ...prev,
      {
        text: message,
        sender: "me",
        name: "Me",
        time: new Date().toLocaleTimeString()
      }
    ])

    socket.emit("send_message", message)

    setMessage("")
    inputRef.current.focus()

    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({
        behavior: "smooth"
      })
    }, 100)
  }

  return (
    <>
      <div className="container-fluid bg-dark text-light p-0 app-wrapper">
        <div className="row h-100 m-0">
          <div className="col-12 d-flex flex-column p-0 h-100">

            <div className="bg-black py-3 border-bottom border-secondary flex-shrink-0">
              <h2 className='text-center mb-0 fw-bold fs-4 fs-md-3'> Real Time Chat App</h2>
            </div>

            {/* message area */}
            <div className="flex-grow-1 overflow-auto p-3 chat-messages">
              <div className="d-flex flex-column gap-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`d-flex
                       ${msg.sender === "me"
                        ? "justify-content-end"
                        : "justify-content-start"
                      }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-3 shadow-sm 
                        ${msg.sender === "me"
                          ? "bg-primary text-white"
                          : "bg-secondary text-white"
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
            </div>


            {/* input */}
            <div className="bg-black p-3 border-top border-secondary flex-shrink-0">
              <div className="row g-2 align-items-center">

                <div className="col-9 col-md-10">
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendMessage()
                      }
                    }}
                  />
                </div>
                <div className="col-3 col-md-2">
                  <button type='submit' className="btn btn-primary w-100 fw-semibold"
                    onClick={sendMessage}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  )
}

export default App
