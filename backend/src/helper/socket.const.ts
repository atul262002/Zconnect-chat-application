export const ChatEvents = Object.freeze({
  // once user is ready to go
  CONNECTED_EVENT: "connected",
  // when user gets disconnected
  DISCONNECT_EVENT: "disconnect",
  // when user joins a socket room
  JOIN_CHAT_EVENT: "joinChat",
  // when participant gets removed from group, chat gets deleted or leaves a group
  LEAVE_CHAT_EVENT: "leaveChat",
  // when admin updates a group name
  UPDATE_GROUP_NAME_EVENT: "updateGroupName",
  // when new message is Sent by user 
  NEW_MESSAGE_SEND: "MessageSent",
  // when new message is receive 
  NEW_MESSAGE_RECEIVE: "MessageReceive",
  // when there is an error in socket
  SOCKET_ERROR_EVENT: "socketError",
  // when participant stops typing
  STOP_TYPING_EVENT: "stopTyping", 
  // when participant starts typing
  TYPING_EVENT: "typing",
});
