// ...existing code...

// Setup real-time notifications (WebSocket + API fallback) - FIXED
const setupRealTimeNotifications = () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    console.warn('⚠️ No token found for WebSocket connection');
    return;
  }
  
  // Try WebSocket first
  try {
    // Remove "Bearer " prefix if it exists and clean the token
    const cleanToken = token.replace('Bearer ', '').trim();
    const wsUrl = `ws://localhost:5000/ws/notifications?token=${cleanToken}`;
    console.log('🔗 Connecting to WebSocket:', wsUrl);
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('✅ WebSocket connected successfully!');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Real-time notification received:', data);
        
        // Only process actual notifications, not connection confirmations
        if (data.type !== 'connection') {
          handleRealTimeNotification(data);
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      // Fallback to polling
      setupPollingNotifications();
    };

    wsRef.current.onclose = (event) => {
      console.log('🔴 WebSocket disconnected:', event.code, event.reason);
      // Only reconnect if it wasn't a manual close
      if (event.code !== 1000 && isLoggedIn) {
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          setupRealTimeNotifications();
        }, 5000);
      }
    };

  } catch (error) {
    console.error('❌ WebSocket setup failed:', error);
    // Fallback to polling
    setupPollingNotifications();
  }
};

// Fix API calls to match correct port
const fetchLatestNotifications = async () => {
  try {
    const token = localStorage.getItem("token");
    const cleanToken = token.replace('Bearer ', '').trim();
    
    const response = await fetch('http://localhost:5000/api/notifications/latest', {
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📋 Loaded notifications:', data);
      
      if (data.notifications && data.notifications.length > 0) {
        // Convert backend format to frontend format
        const formattedNotifications = data.notifications.map(notif => ({
          id: notif._id || notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          time: new Date(notif.createdAt || notif.timestamp),
          unread: notif.status === 'unread',
          icon: getNotificationIcon(notif.type),
          metadata: notif.metadata || {}
        }));

        setNotifications(formattedNotifications);
        setUnreadCount(data.unreadCount || formattedNotifications.filter(n => n.unread).length);
      }
    } else {
      console.error('Failed to fetch notifications:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
  }
};

// Fix other API calls
const updateNotificationStatus = async (notificationId, status) => {
  try {
    const token = localStorage.getItem("token");
    const cleanToken = token.replace('Bearer ', '').trim();
    
    await fetch(`http://localhost:5000/api/notifications/${notificationId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
  } catch (error) {
    console.error('Error updating notification status:', error);
  }
};

const updateAllNotificationsStatus = async (status) => {
  try {
    const token = localStorage.getItem("token");
    const cleanToken = token.replace('Bearer ', '').trim();
    
    await fetch('http://localhost:5000/api/notifications/mark-all-read', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating all notifications status:', error);
  }
};

// ...rest of existing code...