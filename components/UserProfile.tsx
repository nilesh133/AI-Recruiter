"use client";

import React from 'react';
import { useUserData } from '@/hooks/useAuth';
import { Button } from '@heroui/react';

const UserProfile: React.FC = () => {
  const { userData, loading, refreshUserData, getUserName, getUserEmail, getUserRole, getUserInitial } = useUserData();

  if (loading) {
    return (
      <div className="p-6 bg-[#1a1a1a] border border-[#575757] rounded-xl">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-6 bg-[#1a1a1a] border border-[#575757] rounded-xl">
        <p className="text-gray-400">No user data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#1a1a1a] border border-[#575757] rounded-xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center font-semibold text-white">
          {getUserInitial()}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{getUserName()}</h3>
          <p className="text-gray-400">{getUserEmail()}</p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Role:</span>
          <span className="text-white capitalize">{getUserRole()}</span>
        </div>
        {userData.createdAt && (
          <div className="flex justify-between">
            <span className="text-gray-400">Member since:</span>
            <span className="text-white">
              {new Date(userData.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
      
      <Button 
        size="sm" 
        variant="bordered" 
        className="mt-4"
        onPress={refreshUserData}
      >
        Refresh Data
      </Button>
    </div>
  );
};

export default UserProfile; 