import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import { Table, Button, Tooltip, Popconfirm } from 'antd';
import Layout from '../../../components/Layout/Layout';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../../redux/alertsSlice';
import toast from 'react-hot-toast';
import UserDetailsModal from '../../../components/UserDetailsModal/UserDetailsModal';
import DjDetailsModal from '../../../components/DjDetailsModal/DjDetailsModal';

function ReviewsList() {
  const [reviewsData, setReviewsData] = useState([]);
  const dispatch = useDispatch();

  const [userData, setUserData] = useState(null);
  const [djData, setDjData] = useState(null);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [djModalOpen, setDjModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleUserModalOpen = async (userId) => {
    try {
      setUserModalOpen(true);
      const userData = await getUserData(userId);
      setUserData(userData);
    } catch (error) {
      setUserModalOpen(false);
      console.error('Błąd pobierania danych użytkownika:', error);
    }
  };

  const handleDjModalOpen = async (djId) => {
    try {
      setDjModalOpen(true);
      const djData = await getDjData(djId);
      setDjData(djData);
    } catch (error) {
      setUserModalOpen(false);
      console.error('Błąd pobierania danych DJ-a:', error);
    }
  };

  const handleCancel = () => {
    setUserModalOpen(false);
    setUserData({});
    setDjModalOpen(false);
    setDjData({});
  };

  const getReviews = async () => {
    try {
      dispatch(showLoading());
      const response = await axiosInstance.get('/api/reviews/get-all-reviews', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      if (response.data.success) {
        const reviews = response.data.data;

        console.log(reviews);

        setReviewsData(reviews);
        toast.success(response.data.message);
        dispatch(hideLoading());
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error('Błąd pobrania recenzji.');
      console.log(error);
    }
  };

  const getUserData = async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/user/${userId}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Błąd pobierania danych użytkownika:', error);
    }
  };

  const getDjData = async (djId) => {
    try {
      const response = await axiosInstance.get(`/api/dj/${djId}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Błąd pobierania danych DJ-a:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      dispatch(showLoading());
      const response = await axiosInstance.delete(`/api/reviews/delete-review/${reviewId}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      if (response.data.success) {
        dispatch(hideLoading());
        toast.success(response.data.message);
        setReviewsData((prevData) => prevData.filter((review) => review._id !== reviewId));
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error('Błąd usuwania recenzji:', error);
    }
  };

  useEffect(() => {
    getReviews();
  }, []);

  const filteredData = reviewsData.filter(
    (review) =>
      // id
      review._id?.toLowerCase().includes(searchText?.toLowerCase()) ||
      // user
      (review.userInfo &&
        (review.userInfo?.firstName.toLowerCase().includes(searchText?.toLowerCase()) ||
          review.userInfo?.lastName.toLowerCase().includes(searchText?.toLowerCase()))) ||
      review.userInfo?.email.toLowerCase().includes(searchText?.toLowerCase()) ||
      // dj
      (review.djInfo &&
        (review.djInfo?.firstName.toLowerCase().includes(searchText?.toLowerCase()) ||
          review.djInfo?.lastName.toLowerCase().includes(searchText?.toLowerCase()))) ||
      review.djInfo?.email.toLowerCase().includes(searchText?.toLowerCase())
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
    },
    {
      title: 'Uzytkownik',
      render: (text, record) => <Button onClick={() => handleUserModalOpen(record.userId)}>Szczegóły</Button>,
    },
    {
      title: 'DJ',
      render: (text, record) => <Button onClick={() => handleDjModalOpen(record.djId)}>Szczegóły</Button>,
    },
    {
      title: 'Data utworzenia',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text, record) => (
        <span>
          {moment(record.createdAt).format('DD-MM-YYYY HH:mm')}
          <br />
          <span style={{ color: '#999' }}>({moment(record.createdAt).fromNow()})</span>
        </span>
      ),
    },
    {
      title: 'Ocena',
      dataIndex: 'rating',
      key: 'rating',
    },
    {
      title: 'Polubienia',
      key: 'likes',
      render: (text, record) => (
        <p>
          {record.likes.length} / {record.dislikes.length}
        </p>
      ),
    },
    {
      title: 'Komentarz',
      dataIndex: 'comment',
      key: 'comment',
    },

    {
      title: 'Akcje',
      key: 'actions',
      render: (text, record) => (
        <Popconfirm title="Czy na pewno chcesz usunąć recenzję?" onConfirm={() => handleDeleteReview(record._id)} okText="Tak" cancelText="Anuluj">
          <Button danger>Usuń</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Layout>
      <h1 className="page-title">Recenzje</h1>

      <div className="d-flex flex-column mb-2">
        <p className="d-flex align-items-center">
          Wyszukaj:
          <Tooltip title="Recenzję można wyszukać po: ID, użytkowniku (imię, nazwisko, e-mail), DJ-u (imię, nazwisko, e-mail, alias)">
            <span>
              <i className="ri-question-fill fs-5 text-secondary"></i>
            </span>
          </Tooltip>
        </p>

        <input type="text" placeholder="Szukaj..." value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: '300px' }} />
      </div>

      <Table dataSource={filteredData} columns={columns} style={{ overflowX: 'auto' }} />

      <UserDetailsModal modalOpen={userModalOpen} handleCancel={handleCancel} user={userData} />

      <DjDetailsModal modalOpen={djModalOpen} handleCancel={handleCancel} dj={djData} />
    </Layout>
  );
}

export default ReviewsList;
