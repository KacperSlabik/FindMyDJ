import React, { useState, useEffect } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

const StatusIndicator = ({ isOnline, lastActiveSession }) => {
  const [timeSinceLastModified, setTimeSinceLastModified] = useState(
    lastActiveSession ? moment(lastActiveSession).fromNow() : "brak informacji"
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSinceLastModified(
        lastActiveSession
          ? moment(lastActiveSession).fromNow()
          : "brak informacji"
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActiveSession]);

  return (
    <div style={{ display: "flex" }}>
      <FontAwesomeIcon
        icon={faCircle}
        style={{
          color: isOnline ? "#52c41a" : "#ff4d4f",
          marginTop: "5px",
          marginRight: "5px",
          fontSize: "8px",
        }}
      />
      <p style={{ margin: "0", fontSize: "12px" }}>
        {isOnline ? (
          <>
            Aktywny(a) <br />
            <span style={{ color: "#999" }}>(teraz)</span>
          </>
        ) : (
          <>
            Nieaktywny(a) <br />
            <span style={{ color: "#999" }}>
              (ostatnio {timeSinceLastModified})
            </span>
          </>
        )}
      </p>
    </div>
  );
};

export default StatusIndicator;
