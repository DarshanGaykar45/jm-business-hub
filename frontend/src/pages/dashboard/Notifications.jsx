import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useBusinessDivision } from '../../context/BusinessDivisionContext';
import api from '../../api/client';
import { useToast } from '../../components/Toast';
import {
  Bell, Check, CheckCheck, Clock, AlertTriangle, Shield,
  Package, Truck, UserPlus, Info, Trash2
} from 'lucide-react';
import Badge from '../../components/Badge';

export default function Notifications() {
  const { currentDivision } = useBusinessDivision();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [currentDivision, filterUnread]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentDivision !== 'all') params.division = currentDivision;
      if (filterUnread) params.unreadOnly = 'true';
      const res = await api.get('/notifications', { params });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (title, type) => {
    const text = (title + ' ' + (type || '')).toLowerCase();
    if (text.includes('lead') || text.includes('customer')) {
      return <UserPlus className="w-5 h-5 text-amber-400" />;
    }
    if (text.includes('stock') || text.includes('inventory')) {
      return <Package className="w-5 h-5 text-rose-400" />;
    }
    if (text.includes('rental') || text.includes('equipment') || text.includes('truck')) {
      return <Truck className="w-5 h-5 text-sky-400" />;
    }
    if (text.includes('alert') || text.includes('warning')) {
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    }
    return <Info className="w-5 h-5 text-indigo-400" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Helmet>
        <title>Notifications Center | JM Business Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Notifications Center</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            System activity alerts, inventory thresholds, incoming customer leads, and rental deadlines.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs border border-slate-700 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-amber-400" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterUnread(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !filterUnread ? 'bg-amber-500 text-navy-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterUnread(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterUnread ? 'bg-amber-500 text-navy-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Unread Only
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No notifications found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              You are all caught up! When inquiries arrive or machinery needs servicing, alerts will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                notif.isRead
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900/90 border-amber-500/30 text-white shadow-lg shadow-amber-500/5'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex-shrink-0">
                {getNotificationIcon(notif.title, notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-sm font-semibold ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.businessDivision && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {notif.businessDivision}
                    </span>
                  </div>
                )}
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
