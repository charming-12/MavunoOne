"use client";

import { Trash2, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "stock_alert",
      title: "Stock na Chini - Mahindi",
      message: "Mahindi stock ni ndani ya 50kg threshold. Tafadhali jaza stock.",
      timestamp: "5 mins ago",
      isRead: false,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      id: 2,
      type: "delivery_update",
      title: "Delivery Complete - KG456AB",
      message: "Vehicle KG456AB amefika Dar es Salaam kwa usalama. Cargo verified.",
      timestamp: "15 mins ago",
      isRead: false,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: 3,
      type: "sale_alert",
      title: "Mauzo Mazuri!",
      message: "Uza 450,000 TZS umerekodiwa kwa customer John's Retail Store.",
      timestamp: "1 hour ago",
      isRead: true,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: 4,
      type: "payment_alert",
      title: "Customer Credit Alert",
      message: "Dar Wholesale Traders ana credit ya 600,000 TZS inayohitaji kufuatiliwa.",
      timestamp: "2 hours ago",
      isRead: true,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      id: 5,
      type: "machine_alert",
      title: "Machine Job Completed",
      message: "Corn milling job for John Retail completed. 450kg unga ready for pickup.",
      timestamp: "3 hours ago",
      isRead: true,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Arifa</h1>
          <p className="text-gray-600 mt-2">Simamia onyo zote za biashara yako</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{unreadCount}</div>
          <p className="text-sm text-gray-600">Haziwasilishwa</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Weka Zote kwa Kusoma
        </button>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          Futa Zote
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => {
          const IconComponent = notification.icon;
          return (
            <div
              key={notification.id}
              className={`${notification.bgColor} border-l-4 ${
                notification.color.replace("text-", "border-")
              } p-4 rounded-lg`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <IconComponent className={`${notification.color} flex-shrink-0 mt-1`} size={24} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Soma
                    </button>
                    <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1">
                      <Trash2 size={14} />
                      Futa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-gray-900 mb-4">Aina ya Arifa</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-700">Stock Alerts</span>
              <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                1
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">Delivery Updates</span>
              <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                2
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-700">Sales Alerts</span>
              <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                1
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-700">Payment Alerts</span>
              <span className="ml-auto text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                1
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-gray-900 mb-4">Mipango ya Arifa</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm text-gray-700">Stock Alerts</span>
            </label>
            <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm text-gray-700">Delivery Updates</span>
            </label>
            <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm text-gray-700">Sales Alerts</span>
            </label>
            <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm text-gray-700">Payment Reminders</span>
            </label>
            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Hifadhi Mipango
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
