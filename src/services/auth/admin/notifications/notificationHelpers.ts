
export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const createNotification = (message: string): Notification => {
  return {
    id: Date.now().toString(),
    message,
    read: false,
    createdAt: new Date().toISOString()
  };
};
