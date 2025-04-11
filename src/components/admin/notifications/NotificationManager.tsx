
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface NotificationManagerProps {
  sendNotificationToAllUsers: (message: string) => void;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ sendNotificationToAllUsers }) => {
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleSendNotification = () => {
    if (!notificationMessage.trim()) {
      return;
    }

    sendNotificationToAllUsers(notificationMessage.trim());
    setNotificationMessage('');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Send Global Notification</CardTitle>
        <CardDescription>Send a notification to all users in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notificationMessage">Notification Message</Label>
            <Textarea
              id="notificationMessage"
              placeholder="Enter notification message"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <Button onClick={handleSendNotification} className="w-full">
            Send Notification to All Users
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationManager;
