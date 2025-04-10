
import React from 'react';

const UserLoadingState: React.FC = () => (
  <div className="text-center py-8">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
    <p className="text-gray-500">Loading users...</p>
  </div>
);

export default UserLoadingState;
