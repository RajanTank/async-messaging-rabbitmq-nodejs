import "./online.css";

export default function Online({ user }) {

  const location = window.location

  const PF = location.origin + "/assets/noAvatar.png"

  return (
    <li className="rightbarFriend">
      <div className="rightbarProfileImgContainer">
        <img className="rightbarProfileImg" src={PF} alt="" />
        <span className="rightbarOnline"></span>
      </div>
      <span className="rightbarUsername">{user.username}</span>
    </li>
  );
}
