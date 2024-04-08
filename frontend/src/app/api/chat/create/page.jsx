

"use client";
import React, { useState } from 'react';
import Link from "next/link";
const ChatCreateForm = () => {
    const [chatName, setChatName] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchedUser, setSearchedUser] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [userNotFound, setUserNotFound] = useState(false);
    const [addedUsers, setAddedUsers] = useState([]);
    const [chatCreatedSuccess, setChatCreatedSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const userId = localStorage.getItem("userId");

    const handleChatNameChange = (e) => {
        setChatName(e.target.value);
    };

    const handleIsGroupChange = () => {
        setIsGroup(!isGroup);
    };

    const handleSearchUser = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/user?search-user=${searchedUser}&offset=0`, {
                method: 'GET',
                headers: {
                    'Authorization': `${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            if (data.length === 0) {
                setUserNotFound(true);
            } else {
                setSearchResults(data);
                setUserNotFound(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUserAdd = (user) => {
        if (!isGroup && addedUsers.length === 0) {
            setUsers([user._id]);
            setAddedUsers([user]);
        } else if (isGroup) {
            setUsers([...users, user._id]);
            setAddedUsers([...addedUsers, user]);
        }
        setSearchedUser('');
        setSearchResults([]);
    };

    const handleCreateChat = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/chat/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    chatName: isGroup ? chatName : addedUsers[0].username,
                    users,
                    isGroup,
                    admin: userId,
                }),
            });

            if (response.ok) {
                setChatCreatedSuccess(true);
                if (isGroup) {
                    console.log('Group chat created successfully');
                } else {
                    console.log('One-to-one chat created successfully');
                }
            } else {
                const errorData = await response.json();
                setErrorMessage(`Error creating chat: ${errorData.message}`);
                console.error('Error creating chat:', errorData);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="w-1/2 p-4">
            <h1 className="text-2xl font-bold mb-4">Create One-to-One Chat/Group Chat</h1>
            <form onSubmit={handleCreateChat} className="space-y-4">
                <div className="flex items-center">
                    <label className="flex items-center">
                        <input type="checkbox" checked={isGroup} onChange={handleIsGroupChange} className="form-checkbox h-5 w-5 text-blue-600" />
                        <span className="ml-2 text-gray-700">Create Group Chat</span>
                    </label>
                </div>
                {isGroup && (
                    <div>
                        <label className="block">
                            <span className="text-gray-700">Group Name:</span>
                            <input type="text" value={chatName} onChange={handleChatNameChange} className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
                        </label>
                    </div>
                )}
                <div>
                    <label className="block">
                        <span className="text-gray-700">Search User:</span>
                        <input type="text" value={searchedUser} onChange={(e) => setSearchedUser(e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
                        <button type="button" onClick={handleSearchUser} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">Search</button>
                    </label>
                    {userNotFound && <p className="text-red-500 mt-2">No user with this username</p>}
                    {Array.isArray(searchResults) && searchResults.map((user) => (
                        <div key={user._id} className="mt-2 flex items-center">
                            <span>{user.username}</span>
                            <button type="button" onClick={() => handleUserAdd(user)} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md">Add</button>
                        </div>
                    ))}
                </div>
                {addedUsers.length > 0 && (
                    <div>
                        <span className="text-gray-700">Added Users:</span>
                        {addedUsers.map((user) => (
                            <div key={user._id} className="mt-2 flex items-center">
                                <span>{user.username}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div>
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Create Chat</button>
                </div>
            </form>
            {chatCreatedSuccess && (
                <div className="mt-4">
                    <p className={`text-green-500 ${isGroup ? 'Group' : 'One-to-One'} chat created successfully`}>
                        {isGroup ? 'Group chat' : 'One-to-one chat'} created successfully
                    </p>
                </div>
            )}
            {errorMessage && (
                <div className="mt-4">
                    <p className="text-red-500">{errorMessage}</p>
                </div>
            )}

            <Link
                href="/"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
                Click here to return main page
            </Link>
        </div>
    );
};

export default ChatCreateForm;