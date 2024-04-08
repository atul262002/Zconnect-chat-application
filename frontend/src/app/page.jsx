"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';

const ChatApp = () => {
  const [chatMessages, setChatMessages] = useState({});
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [routerReady, setRouterReady] = useState(false);
  const messagesEndRef = React.useRef(null);
  const router = useRouter();

  useEffect(() => {
    setRouterReady(true);
  }, []);

  useEffect(() => {
    if (routerReady) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            router.push('/api/auth/login');
            return;
          }

          const response = await fetch('http://localhost:8080/api/chat', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              authorization: `${token}`,
            },
          });

          if (response.ok) {
            const responseData = await response.json();
            const filteredData = responseData.map((chat) => ({
              _id: chat._id,
              chatName: chat.chatName,
              isGroup: chat.isGroup,
              latestMessage: chat.latestMessage,
              users: chat.users,
            }));
            setFilteredData(filteredData);
          } else {
            console.error('Failed to fetch data');
            router.push('api/auth/login');
          }
        } catch (error) {
          console.error('Error:', error);
          router.push('/api/auth/login/');
        }
      };

      fetchData();
    }
  }, [routerReady]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/api/auth/login');
          return;
        }

        const response = await fetch('http://localhost:8080/api/user/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          localStorage.setItem('userId', userData._id);
          setUserProfile(userData);
        } else {
          console.error('Failed to fetch user profile data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const newSocket = io('http://localhost:8080', {
        query: { token },
        transportOptions: {
          polling: {
            extraHeaders: {
              'authorization': `${token}`
            }
          }
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  const handleChatSelection = (chatId) => {
    const selectedChatData = filteredData.find((chat) => chat._id === chatId);
    setSelectedChat(selectedChatData);
    setChatMessages({});
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/api/auth/login');
        return;
      }

      if (selectedChat) {
        try {
          const response = await fetch(`http://localhost:8080/api/chat/message/${selectedChat._id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              authorization: `${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setMessages(data);
          } else {
            console.error('Failed to fetch chat messages');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };

    fetchMessages();
  }, [selectedChat]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (socket && inputValue.trim() !== '') {
      const payload = {
        content: inputValue,
        sender: userProfile._id,
        chat: selectedChat._id,
      };
      socket.emit('MessageSent', payload);
      setInputValue('');
    }
  };

  useEffect(() => {
    const handleMessageReceived = (message) => {
      setChatMessages((prevMessages) => {
        if (selectedChat && message.chat === selectedChat._id) {
          return {
            ...prevMessages,
            [selectedChat._id]: [
              ...(prevMessages[selectedChat._id] || []),
              message,
            ],
          };
        }
        return prevMessages;
      });
    };

    if (socket) {
      socket.on('MessageReceive', handleMessageReceived);

      return () => {
        socket.off('MessageReceive', handleMessageReceived);
      };
    }
  }, [socket, selectedChat]);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatMessages]);

  const handleLogout = () => {

    localStorage.clear();
    socket.disconnect();
    // Trigger socket disconnect event (if applicable)

    router.push('/api/auth/login');
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-200 p-4">
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Link href="/">
              <h1 className="text-2xl font-bold mr-2">Zconnect</h1>
            </Link>
            <Link href="/api/chat/create">
              <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                +
              </div>
            </Link>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-2">Chats</h2>
          <ul>
            {filteredData
              .filter((chat) =>
                chat.chatName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((chat) => (
                <li
                  key={chat._id}
                  onClick={() => handleChatSelection(chat._id)}
                  className={`p-2 rounded-md mb-2 cursor-pointer ${selectedChat?._id === chat._id
                    ? 'bg-gray-300'
                    : 'bg-white hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-400 rounded-full mr-2 relative">
                      <Image
                        src="/Untitled.jpeg"
                        alt="Profile Picture"
                        fill
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">
                        {chat.isGroup ? chat.chatName : chat.users.find((user) => user._id !== userProfile._id).username}
                      </h3>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 bg-gray-100 p-4 flex flex-col justify-between h-full">
        <div className="flex-1 overflow-y-auto">
          {selectedChat && (
            <div className="sticky top-0 bg-white p-4 rounded-t-lg z-10">
              <h2 className="text-lg font-bold">
                {selectedChat.isGroup ? selectedChat.chatName : selectedChat.users.find((user) => user._id !== userProfile._id).username}
              </h2>
            </div>
          )}
          {Object.values(messages)[0]?.map((message) => (
            <div
              key={message._id}
              className={`p-2 rounded-md mb-2 flex ${message.senderId === userProfile._id ? "flex-row-reverse" : "flex-row"
                }`}
            >
              <div
                className={`${message.senderId === userProfile._id
                    ? "ml-auto bg-gray-300"
                    : "bg-white"
                  } rounded-md p-2`}
                ref={messagesEndRef} >
                <p>{message.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {chatMessages[selectedChat?._id]?.map((message) => (
            <div
              key={message._id}
              className={`p-2 rounded-md mb-2 flex ${message.sender === userProfile._id ? "flex-row-reverse" : "flex-row"
                }`}
            >
              <div
                className={`${message.sender === userProfile._id
                    ? "ml-auto bg-gray-300"
                    : "bg-white"
                  } rounded-md p-2`}
              >
                <p>{message.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        {selectedChat && (
          <div className="bg-white p-4 rounded-t-lg">
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                placeholder="Send message"
                value={inputValue}
                onChange={handleInputChange}
                className="border border-gray-400 p-2 rounded-l-md flex-grow"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-r-md hover:bg-blue-700 transition-colors duration-300"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
      <div className="w-64 bg-gray-200 p-4">
        {userProfile && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-1 relative">
              <Image
                src={userProfile.photo || "/Untitled.jpeg"}
                alt="Profile Picture"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h2 className="text-lg font-bold mb-1">{userProfile.username}</h2>
            <p className="text-gray-600">{userProfile.email}</p>
            {/* <p className="text-gray-600">{userProfile._id}</p> */}
          </div>
        )}
        <div className="flex justify-center mt-4">
          <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-300">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatApp;