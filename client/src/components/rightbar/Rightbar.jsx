import "./rightbar.css";

export default function Rightbar({ user, handleLogout }) {


  return (
    <div className="rightbar">
      <div className="rightbarWrapper">
        <span onClick={handleLogout}>Logout</span>
      </div>
    </div>
  );
}
