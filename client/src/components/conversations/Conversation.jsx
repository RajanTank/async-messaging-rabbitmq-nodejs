import axios from "axios";
import { useEffect, useState } from "react";
import "./conversation.css";

export default function Conversation({ conversation, currentUser, newMessageCount }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const friendId = conversation.members.find((m) => m !== currentUser._id);

    const getUser = async () => {
      try {
        const res = await axios("/users?userId=" + friendId);
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    getUser();
  }, [currentUser, conversation]);

  const location = window.location

  const PF = location.origin + "/assets/"
  return (
    <div className="conversation">
      <img
        className="conversationImg"
        src={
          PF + "person/noAvatar.png"
        }
        alt=""
      />
      <div className="conversationDiv">
        <span className="conversationName">{user?.username}</span>
        {Boolean(newMessageCount) && <span > you have {newMessageCount} new message </span>}
      </div>
    </div>
  );
}
