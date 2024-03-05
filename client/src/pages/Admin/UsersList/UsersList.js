import React, { useEffect } from "react";
import Layout from "../../../components/Layout/Layout";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../../redux/alertsSlice";
import axiosInstance from "../../../services/axiosInstance";
import { Button, Popconfirm, Table, Tag, Empty, Tooltip } from "antd";
import moment from "moment";
import toast from "react-hot-toast";
import UserDetailsModal from "../../../components/UserDetailsModal/UserDetailsModal";

function UsersList() {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [searchText, setSearchText] = useState("");
  const dispatch = useDispatch();

  const handleUserModalOpen = (user) => {
    setUserModalOpen(true);
    setSelectedUser(user);
  };

  const handleCancel = () => {
    setModalOpen(false);
    setUserModalOpen(false);
  };

  const getUsersData = async () => {
    try {
      dispatch(showLoading());
      const response = await axiosInstance.get("/api/admin/get-all-users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());
      if (response.data.success) {
        setUsers(response.data.data);
        toast.success(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
    }
  };
  useEffect(() => {
    getUsersData();
  }, []);

  const blockUser = async (userId, status) => {
    try {
      dispatch(showLoading());
      const response = await axiosInstance.post(
        "/api/admin/block-user",
        { userIdToBlock: userId, status: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());

      if (response.data.success) {
        toast.success(response.data.message);
        getUsersData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(error);
    }
  };

  const unblockUser = async (userId, status) => {
    try {
      dispatch(showLoading());
      const response = await axiosInstance.post(
        "/api/admin/unblock-user",
        { userIdToUnblock: userId, status: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());

      if (response.data.success) {
        toast.success(response.data.message);
        getUsersData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      dispatch(showLoading());
      const response = await axiosInstance.post(
        "/api/admin/delete-user",
        { userIdToDelete: userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());

      if (response.data.success) {
        toast.success(response.data.message);
        getUsersData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Użytkownik",
      render: (text, record) => (
        <span>
          <Button onClick={() => handleUserModalOpen(record)}>Szczegóły</Button>
        </span>
      ),
    },
    {
      title: "Utworzony",
      dataIndex: "createdAt",
      render: (text, record) => (
        <span>
          {moment(record.createdAt).format("DD-MM-YYYY HH:mm")}
          <br />
          <span style={{ color: "#999" }}>
            ({moment(record.createdAt).fromNow()})
          </span>
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text, record) => {
        let tagType = "";

        switch (text) {
          case "Aktywny":
            tagType = "success";
            break;
          case "Zablokowany":
            tagType = "error";
            break;
          default:
            tagType = "default";
            break;
        }

        return (
          <Tag
            color={tagType}
            style={{
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Akcje",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex " style={{ gap: "10px" }}>
          {record.isBlocked ? (
            <Popconfirm
              title="Odblokuj użytkownika"
              description={`Czy na pewno chcesz odblokować użytkownika: ${record.firstName} ${record.lastName} ?`}
              onConfirm={() => {
                unblockUser(record._id, "Aktywny");
              }}
              okText="Tak"
              cancelText="Nie"
            >
              <Button type="primary">Odblokuj</Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Zablokuj użytkownika"
              description={`Czy na pewno chcesz zablokować użytkownika: ${record.firstName} ${record.lastName} ?`}
              onConfirm={() => {
                blockUser(record._id, "Zablokowany");
              }}
              okText="Tak"
              cancelText="Nie"
            >
              <Button danger>Zablokuj</Button>
            </Popconfirm>
          )}

          <Popconfirm
            title="Usuń użytkownika"
            description={`Czy na pewno chcesz usunąć użytkownika: ${record.firstName} ${record.lastName} ?`}
            onConfirm={() => deleteUser(record._id)}
            okText="Tak"
            cancelText="Nie"
          >
            <Button danger>Usuń</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const filteredData = users.filter(
    (item) =>
      (item.firstName &&
        item.firstName.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.lastName &&
        item.lastName.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.email &&
        item.email.toLowerCase().includes(searchText.toLowerCase())) ||
      (item._id && item._id.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <Layout>
      <h1 className="page-title">Użytkownicy</h1>

      <div className="d-flex flex-column mb-2">
        <p className="d-flex align-items-center">
          Wyszukaj:
          <Tooltip title="Użytkownika można wyszukać po: ID, imię, nazwisko, email">
            <span>
              <i className="ri-question-fill fs-5 text-secondary"></i>
            </span>
          </Tooltip>
        </p>

        <input
          type="text"
          placeholder="Szukaj..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: "300px" }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        style={{ overflowX: "auto" }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_DEFAULT}
              description="Brak danych."
            />
          ),
        }}
      />

      <UserDetailsModal
        modalOpen={userModalOpen}
        handleCancel={handleCancel}
        user={selectedUser}
      />
    </Layout>
  );
}

export default UsersList;
