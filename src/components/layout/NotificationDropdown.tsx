import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const NotificationDropdown = () => {
  const { user, markNotificationAsRead } = useAuth();
  const [open, setOpen] = useState(false);
  
  const notifications = user?.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    // Keep dropdown open
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                className={`p-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="text-sm">{notification.message}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                    {!notification.read && (
                      <span className="ml-2 text-blue-600 font-medium">New</span>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
