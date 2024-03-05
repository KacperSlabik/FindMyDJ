import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfileImage } from "../../redux/userSlice";

function AvatarImage({ userId, size, isDj, isAdmin }) {
  const dispatch = useDispatch();
  const profileImage = useSelector((state) => state.user.profileImage);
  const imageSize = size === "small" ? "100px" : "50px";

  useEffect(() => {
    if (userId) {
      dispatch(getUserProfileImage(userId, isDj));
    }
  }, [dispatch, userId, isDj]);

  return (
    <div>
      {isAdmin ? (
        <i className="ri-admin-line" style={{ fontSize: "50px" }}></i>
      ) : profileImage ? (
        <img
          src={profileImage}
          alt="Awatar użytkownika"
          style={{ width: imageSize, height: imageSize }}
        />
      ) : (
        <span
          className="dj-default-icon d-flex flex-column align-items-center"
          style={{ width: imageSize, height: imageSize, display: "block" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13Z"></path>
          </svg>
        </span>
      )}
    </div>
  );
}

export default AvatarImage;
