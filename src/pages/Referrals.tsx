
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Referrals = () => {
  const { user, applyReferralCode } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  
  const handleApplyReferral = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referralCode) {
      toast.error('Please enter a referral code');
      return;
    }
    
    applyReferralCode(referralCode)
      .then(() => {
        setReferralCode('');
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to apply referral code');
      });
  };
  
  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
        .then(() => toast.success('Referral code copied to clipboard'))
        .catch(() => toast.error('Failed to copy referral code'));
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Referrals</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Your Referral Code */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Referral Code</h2>
          
          {user?.referralCode ? (
            <>
              <div className="bg-gray-100 p-4 rounded-md mb-4 flex items-center justify-between">
                <span className="font-mono text-lg">{user.referralCode}</span>
                <button 
                  onClick={copyReferralCode}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Copy
                </button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Share this code with your friends and earn rewards when they sign up!
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">You get:</span> 250 coins per referral
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">They get:</span> 200 coins on signup
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-600">Loading your referral code...</p>
          )}
        </div>
        
        {/* Apply Referral Code */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Apply Referral Code</h2>
          
          {user?.appliedReferralCode ? (
            <div className="bg-green-50 p-4 rounded-md text-green-700">
              <p>You have already applied a referral code: <span className="font-mono">{user.appliedReferralCode}</span></p>
            </div>
          ) : (
            <form onSubmit={handleApplyReferral} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Referral Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter referral code"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Apply Code
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Referral Stats */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Referral Stats</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-md text-center">
            <p className="text-2xl font-bold text-blue-600">{user?.referrals?.length || 0}</p>
            <p className="text-sm text-gray-600">Total Referrals</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md text-center">
            <p className="text-2xl font-bold text-green-600">{user?.referrals?.length ? user.referrals.length * 250 : 0}</p>
            <p className="text-sm text-gray-600">Coins Earned</p>
          </div>
        </div>
        
        {/* Referral List */}
        <div>
          <h3 className="text-lg font-medium mb-2">Recent Referrals</h3>
          
          {user?.referrals && user.referrals.length > 0 ? (
            <ul className="divide-y">
              {user.referrals.map((referral, index) => (
                <li key={index} className="py-3">
                  <p className="text-gray-800">{referral.name || referral.email}</p>
                  <p className="text-sm text-gray-500">Joined: {new Date(referral.joinedAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-3">No referrals yet. Share your code to start earning!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Referrals;
