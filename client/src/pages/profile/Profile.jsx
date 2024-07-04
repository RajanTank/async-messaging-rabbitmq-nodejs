import "./profile.css";
import Topbar from "../../components/topbar/Topbar";
import Rightbar from "../../components/rightbar/Rightbar";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { AuthContext } from "../../context/AuthContext";
import { useHistory } from 'react-router-dom'

export default function Profile() {
  const [user, setUser] = useState({});
  const username = useParams().username;

  const { dispatch } = useContext(AuthContext);
  const history = useHistory();


  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`/users?username=${username}`);
      setUser(res.data);
    };
    fetchUser();
  }, [username]);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT", });
    history.push("/login");

  }

  const location = window.location
  return (
    <>
      <Topbar />
      <div className="profile">
        {/* <Sidebar /> */}
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <img
                className="profileCoverImg"
                src={
                  location.origin + "/assets/person/noCover.png"
                }
                alt=""
              />
              <img
                className="profileUserImg"
                src={location.origin + "/assets/person/noAvatar.png"
                }
                alt=""
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{user.username}</h4>
            </div>
          </div>
          <div className="profileRightBottom">
            <Rightbar user={user} handleLogout={handleLogout} />
          </div>
        </div>
      </div>
    </>
  );
}
