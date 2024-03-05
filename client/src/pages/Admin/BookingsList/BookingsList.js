import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Layout from '../../../components/Layout/Layout';
import { showLoading, hideLoading } from '../../../redux/alertsSlice';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../../services/axiosInstance';
import { Table, Tag, Button, Tabs, Popconfirm, Empty, Input, Tooltip } from 'antd';
import moment from 'moment';
import { getRemainingTime } from '../../../services/utils';
import BookingDetailsModal from '../../../components/BookingDetailsModal/BookingDetailsModal';
import UserDetailsModal from '../../../components/UserDetailsModal/UserDetailsModal';
import DjDetailsModal from '../../../components/DjDetailsModal/DjDetailsModal';

const { TabPane } = Tabs;
const { Search } = Input;

function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [djModalOpen, setDjModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [selectedDj, setSelectedDj] = useState({});
  const [searchText, setSearchText] = useState('');

  const dispatch = useDispatch();

  const handleModalOpen = (booking) => {
    setModalOpen(true);
    setSelectedBooking(booking);
  };

  const handleUserModalOpen = (user) => {
    setUserModalOpen(true);
    setSelectedUser(user);
  };

  const handleDjModalOpen = (dj) => {
    setDjModalOpen(true);
    setSelectedDj(dj);
  };

  const handleCancel = () => {
    setModalOpen(false);
    setUserModalOpen(false);
    setDjModalOpen(false);
  };

  const changeBookingStatus = async (record, status) => {
    try {
      dispatch(showLoading());
      const response = await axiosInstance.post(
        '/api/dj/change-booking-status',
        { bookingId: record._id, status: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.data.success) {
        dispatch(hideLoading());
        await getBookingsData();
        toast.success(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error('Błąd zmiany statusu konta DJ-a.');
    }
  };

  const getBookingsData = async () => {
    try {
      dispatch(showLoading());
      const response = await axiosInstance.get('/api/admin/get-all-bookings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.data.success) {
        dispatch(hideLoading());
        const initialBookings = response.data.data.map((booking) => {
          const [timeText, isEnded] = getRemainingTime(booking.createdAt, 2);
          return {
            ...booking,
            timeText,
            isEnded,
          };
        });
        setBookings(initialBookings);
        toast.success(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      dispatch(showLoading());
      const response = await axiosInstance.post(
        '/api/admin/delete-booking',
        { bookingIdToDelete: bookingId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      dispatch(hideLoading());

      if (response.data.success) {
        toast.success(response.data.message);
        getBookingsData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(error);
    }
  };

  const renderTable = (status) => {
    let filteredBookings;
    if (status === '*') {
      filteredBookings = bookings.filter(
        (booking) =>
          // id
          booking._id.toLowerCase().includes(searchText.toLowerCase()) ||
          // user
          (booking.userInfo &&
            (booking.userInfo.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
              booking.userInfo.lastName.toLowerCase().includes(searchText.toLowerCase()))) ||
          booking.userInfo.email.toLowerCase().includes(searchText.toLowerCase()) ||
          // dj
          (booking.djInfo &&
            (booking.djInfo.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
              booking.djInfo.lastName.toLowerCase().includes(searchText.toLowerCase()))) ||
          booking.djInfo.email.toLowerCase().includes(searchText.toLowerCase())
      );
    } else {
      filteredBookings = bookings.filter((booking) => booking.status === status);
    }

    return (
      <Table
        columns={columns}
        dataSource={filteredBookings}
        rowKey="_id"
        style={{ overflowX: 'auto' }}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} description="Brak danych." />,
        }}
      />
    );
  };

  const refreshTime = () => {
    setBookings((prevBookings) => {
      const updatedBookings = prevBookings.map((booking) => {
        const [timeText, isEnded] = getRemainingTime(booking.createdAt, 2);
        if (!booking.isUpdated && isEnded && booking.status === 'Oczekuje') {
          changeBookingStatus(booking, 'Niepotwierdzona');
          return { ...booking, isUpdated: true };
        }

        if (!booking.isUpdated && booking.status === 'Trwająca' && moment(booking.endDate).isBefore(moment())) {
          changeBookingStatus(booking, 'Zakończona');
          return { ...booking, isUpdated: true };
        }

        return {
          ...booking,
          timeText,
          isEnded,
        };
      });
      return updatedBookings;
    });
  };

  useEffect(() => {
    getBookingsData();

    const intervalId = setInterval(() => {
      refreshTime();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const columns = [
    {
      title: 'ID Rezerwacji',
      dataIndex: '_id',
    },
    {
      title: 'Uzytkownik',
      render: (text, record) => <Button onClick={() => handleUserModalOpen(record)}>Szczegóły</Button>,
    },
    {
      title: 'DJ',
      render: (text, record) => <Button onClick={() => handleDjModalOpen(record)}>Szczegóły</Button>,
    },
    {
      title: 'Data dodania',
      render: (text, record) => (
        <span>
          {moment(record.createdAt).format('DD-MM-YYYY HH:mm')}
          <br />
          <span style={{ color: '#999' }}>({moment(record.createdAt).fromNow()})</span>
        </span>
      ),
      sorter: {
        compare: (a, b) => new Date(a.createdAt) > new Date(b.createdAt),
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text, record) => {
        let tagType = '';
        switch (text) {
          case 'Potwierdzona':
            tagType = 'success';
            break;
          case 'Trwająca':
            tagType = 'processing';
            break;
          case 'Oczekuje':
            tagType = 'warning';
            break;
          case 'Niepotwierdzona':
            tagType = 'error';
            break;
          case 'Odrzucona':
            tagType = 'error';
            break;
          default:
            tagType = 'default';
            break;
        }
        return (
          <Tag
            color={tagType}
            style={{
              height: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {text}
          </Tag>
        );
      },
    },

    {
      title: 'Czas do potwierdzenia przez DJ-a',
      dataIndex: 'createdAt',
      render: (text, record) => {
        return record.status === 'Potwierdzona' ? <span>-</span> : <span>{record.isEnded ? 'Czas upłynął' : record.timeText}</span>;
      },
    },
    {
      title: 'Czas do anulowania',
      render: (text, record) => {
        const [timeText, isEnded] = getRemainingTime(record.startDate, -14);

        return (
          <span>{record.status === 'Potwierdzona' && !isEnded ? timeText : record.status === 'Potwierdzona' && isEnded ? 'Czas upłynął' : '-'}</span>
        );
      },

      sorter: {
        compare: (a, b) => {
          const [aDuration] = getRemainingTime(a.startDate, -14);
          const [bDuration] = getRemainingTime(b.startDate, -14);
          return aDuration > bDuration;
        },
      },
    },
    {
      title: 'Akcje',
      dataIndex: 'actions',
      render: (text, record) => (
        <div className="d-flex " style={{ gap: '10px' }}>
          <Button type="primary" onClick={() => handleModalOpen(record)}>
            Szczegóły
          </Button>

          <Popconfirm
            title="Usuń rezerwację"
            description={`Czy na pewno chcesz usunąć rezerwacje: ${record._id} ?`}
            onConfirm={() => deleteBooking(record._id)}
            okText="Tak"
            cancelText="Nie"
          >
            <Button danger>Usuń</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <h1 className="page-title">Rezerwacje</h1>
      <hr />

      <div className="d-flex flex-column mb-2">
        <p className="d-flex align-items-center">
          Wyszukaj:
          <Tooltip title="Rezerwację można wyszukać po: ID, użytkowniku (imię, nazwisko, e-mail), DJ-u (imię, nazwisko, e-mail, alias)">
            <span>
              <i className="ri-question-fill fs-5 text-secondary"></i>
            </span>
          </Tooltip>
        </p>
        <input
          placeholder="Szukaj..."
          allowClear
          enterButton
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: '300px' }}
        />
      </div>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Wszystkie" key="1">
          {renderTable('*')}
        </TabPane>
        <TabPane tab="Oczekujące" key="2">
          {renderTable('Oczekuje')}
        </TabPane>
        <TabPane tab="Potwierdzone" key="3">
          {renderTable('Potwierdzona')}
        </TabPane>
        <TabPane tab="W trakcie" key="4">
          {renderTable('Trwające')}
        </TabPane>
        <TabPane tab="Niepotwierdzone" key="5">
          {renderTable('Niepotwierdzona')}
        </TabPane>
        <TabPane tab="Zakończone" key="6">
          {renderTable('Zakończona')}
        </TabPane>
        <TabPane tab="Odrzucone" key="7">
          {renderTable('Odrzucona')}
        </TabPane>
        <TabPane tab="Anulowane" key="8">
          {renderTable('Anulowana')}
        </TabPane>
      </Tabs>

      <BookingDetailsModal modalOpen={modalOpen} handleCancel={handleCancel} booking={selectedBooking} />

      <UserDetailsModal modalOpen={userModalOpen} handleCancel={handleCancel} booking={selectedUser} />

      <DjDetailsModal modalOpen={djModalOpen} handleCancel={handleCancel} booking={selectedDj} />
    </Layout>
  );
}

export default BookingsList;
