import React, { useState, useEffect } from 'react';
import { Space, Card, Divider, Skeleton } from 'antd';
import axiosInstance from '../../services/axiosInstance';
import '../ServiceInfo/serviceInfoStyles.css';

function ServiceInfo() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    loggedUsers: 0,
    registeredUsers: 0,
    blockedUsers: 0,
    verifiedUsers: 0,
    djs: 0,
    blockedDjs: 0,
    pendingConfirmationDjs: 0,
    activeBookings: 0,
    pendingBookings: 0,
    rejectedBookings: 0,
    confirmedBookings: 0,
    unconfirmedBookings: 0,
    canceledBookings: 0,
    endedBookings: 0,
    bookings: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/service-info', {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        });
        const result = response.data;

        setData({
          loggedUsers: result.loggedUsers,
          registeredUsers: result.registeredUsers,
          blockedUsers: result.blockedUsers,
          verifiedUsers: result.verifiedUsers,
          djs: result.djs,
          confirmedDjs: result.confirmedDjs,
          blockedDjs: result.blockedDjs,
          pendingConfirmationDjs: result.pendingConfirmationDjs,
          confirmedBookings: result.confirmedBookings,
          activeBookings: result.activeBookings,
          pendingBookings: result.pendingBookings,
          rejectedBookings: result.rejectedBookings,
          unconfirmedBookings: result.unconfirmedBookings,
          canceledBookings: result.canceledBookings,
          endedBookings: result.endedBookings,
          bookings: result.bookings,
        });
      } catch (error) {
        console.error('Błąd pobierania danych:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 100000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="service-info">
      <Divider className="mt-5" orientation="left" orientationMargin="0">
        <h2>Statystyki</h2>
      </Divider>
      <div className="service-info-space">
        <Space className="service-info-cards" direction="horizontal" size={16} style={{ textAlign: 'center', alignItems: 'flex-start' }}>
          <Card size="default" title="Uzytkownicy" style={{ width: 250 }}>
            {loading ? (
              <Skeleton active />
            ) : (
              <>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Zalogowani:</p>
                  </div>
                  <div className="right-column">{data.loggedUsers}</div>
                </aside>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Zarejestrowani:</p>
                  </div>
                  <div className="right-column">{data.registeredUsers}</div>
                </aside>

                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Zablokowani:</p>
                  </div>
                  <div className="right-column">
                    {data.blockedUsers} / {data.registeredUsers}
                  </div>
                </aside>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Zweryfikowani:</p>
                  </div>
                  <div className="right-column">
                    {data.verifiedUsers} / {data.registeredUsers}
                  </div>
                </aside>
              </>
            )}
          </Card>

          <Card size="default" title="DJ-e" style={{ width: 250 }}>
            {loading ? (
              <Skeleton active />
            ) : (
              <>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Zarejestrowani:</p>
                  </div>
                  <div className="right-column"> {data.djs} </div>
                </aside>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Potwierdzeni:</p>
                  </div>
                  <div className="right-column">
                    {data.confirmedDjs} / {data.djs}{' '}
                  </div>
                </aside>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Oczekujący:</p>
                  </div>
                  <div className="right-column">
                    {data.pendingConfirmationDjs} / {data.djs}
                  </div>
                </aside>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Zablokowani:</p>
                  </div>
                  <div className="right-column">
                    {data.blockedDjs} / {data.djs}{' '}
                  </div>
                </aside>
              </>
            )}
          </Card>

          <Card size="default" title="Rezerwacje" style={{ width: 250 }}>
            {loading ? (
              <Skeleton active />
            ) : (
              <>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Zarejestrowane:</p>
                  </div>
                  <div className="right-column">{data.bookings}</div>
                </aside>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Oczekujace:</p>
                  </div>
                  <div className="right-column">
                    {data.pendingBookings} / {data.bookings}
                  </div>
                </aside>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Potiwerdzone:</p>
                  </div>
                  <div className="right-column">
                    {data.confirmedBookings} / {data.bookings}
                  </div>
                </aside>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>W trakcie:</p>
                  </div>
                  <div className="right-column">
                    {data.activeBookings} / {data.bookings}
                  </div>
                </aside>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Niepotwierdzone:</p>
                  </div>
                  <div className="right-column">
                    {data.unconfirmedBookings} / {data.bookings}
                  </div>
                </aside>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Zakończone:</p>
                  </div>
                  <div className="right-column">
                    {data.endedBookings} / {data.bookings}
                  </div>
                </aside>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Odrzucone:</p>
                  </div>
                  <div className="right-column">
                    {data.rejectedBookings} / {data.bookings}
                  </div>
                </aside>
                <aside className="service-info-two-columns">
                  <div className="left-column">
                    <p>Anulowane:</p>
                  </div>
                  <div className="right-column">
                    {data.canceledBookings} / {data.bookings}
                  </div>
                </aside>
              </>
            )}
          </Card>
        </Space>
      </div>
    </div>
  );
}

export default ServiceInfo;
