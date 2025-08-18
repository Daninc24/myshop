import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  GiftIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  StarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const ReferralSystem = ({ user = null }) => {
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    totalEarnings: 0,
    pendingReferrals: 0,
    referralLevel: 'Bronze'
  });
  const [copied, setCopied] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralHistory, setReferralHistory] = useState([]);

  // Generate referral code for user
  useEffect(() => {
    if (user) {
      const code = `${user._id.slice(-6).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      setReferralCode(code);
      
      // Load referral stats from localStorage or API
      const storedStats = localStorage.getItem(`referral_stats_${user._id}`);
      if (storedStats) {
        setReferralStats(JSON.parse(storedStats));
      }
      
      // Load referral history
      const storedHistory = localStorage.getItem(`referral_history_${user._id}`);
      if (storedHistory) {
        setReferralHistory(JSON.parse(storedHistory));
      }
    }
  }, [user]);

  // Referral rewards structure
  const referralRewards = [
    {
      level: 'Bronze',
      referrals: 0,
      reward: 'KES 500',
      bonus: '10% off next purchase',
      icon: '🥉'
    },
    {
      level: 'Silver',
      referrals: 5,
      reward: 'KES 1,000',
      bonus: '15% off next purchase',
      icon: '🥈'
    },
    {
      level: 'Gold',
      referrals: 15,
      reward: 'KES 2,500',
      bonus: '20% off next purchase',
      icon: '🥇'
    },
    {
      level: 'Platinum',
      referrals: 30,
      reward: 'KES 5,000',
      bonus: '25% off next purchase + Free delivery',
      icon: '💎'
    },
    {
      level: 'Diamond',
      referrals: 50,
      reward: 'KES 10,000',
      bonus: '30% off next purchase + VIP support',
      icon: '💎'
    }
  ];

  // Copy referral code
  const handleCopyReferralCode = async () => {
    try {
      const referralUrl = `${window.location.origin}/register?ref=${referralCode}`;
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      
      // Track referral code copy
      if (window.gtag) {
        window.gtag('event', 'referral_code_copy', {
          referral_code: referralCode,
          user_id: user?._id
        });
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying referral code:', error);
    }
  };

  // Share referral link
  const handleShareReferral = async () => {
    const referralUrl = `${window.location.origin}/register?ref=${referralCode}`;
    const shareText = `Join LuxeCart using my referral code and get KES 1,000 off your first purchase! Use code: ${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join LuxeCart - Get KES 1,000 Off!',
          text: shareText,
          url: referralUrl
        });
        
        // Track referral share
        if (window.gtag) {
          window.gtag('event', 'referral_share', {
            referral_code: referralCode,
            user_id: user?._id
          });
        }
      } catch (error) {
        console.error('Error sharing referral:', error);
      }
    } else {
      // Fallback to copy
      handleCopyReferralCode();
    }
  };

  // Get current level
  const getCurrentLevel = () => {
    return referralRewards.find(reward => 
      referralStats.totalReferrals >= reward.referrals
    ) || referralRewards[0];
  };

  // Get next level
  const getNextLevel = () => {
    const currentIndex = referralRewards.findIndex(reward => 
      referralStats.totalReferrals >= reward.referrals
    );
    return referralRewards[currentIndex + 1] || null;
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <UserGroupIcon className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900">Referral Program</h2>
        </div>
        <p className="text-gray-600">Invite friends and earn rewards together!</p>
      </div>

      {/* Current Level Badge */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{currentLevel.icon}</span>
              <span className="font-bold text-gray-900">{currentLevel.level}</span>
            </div>
            <p className="text-sm text-gray-600">
              {referralStats.totalReferrals} referrals • {currentLevel.reward} earned
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-orange-600">{currentLevel.bonus}</div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Your Referral Code</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
            <code className="text-lg font-mono text-gray-900">{referralCode}</code>
          </div>
          <motion.button
            onClick={handleCopyReferralCode}
            className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
                         {copied ? (
               <CheckIcon className="w-5 h-5" />
             ) : (
               <DocumentDuplicateIcon className="w-5 h-5" />
             )}
          </motion.button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Share this code with friends to earn rewards
        </p>
      </div>

      {/* Quick Share Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.button
          onClick={handleShareReferral}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-xl flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ShareIcon className="w-5 h-5" />
          <span>Share Link</span>
        </motion.button>
        
        <motion.button
          onClick={() => setShowReferralModal(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-xl flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChartBarIcon className="w-5 h-5" />
          <span>View Stats</span>
        </motion.button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{referralStats.totalReferrals}</div>
          <div className="text-sm text-blue-700">Total Referrals</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">KES {referralStats.totalEarnings.toLocaleString()}</div>
          <div className="text-sm text-green-700">Total Earnings</div>
        </div>
      </div>

      {/* Next Level Progress */}
      {nextLevel && (
        <div className="bg-purple-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Next Level: {nextLevel.level}</h4>
            <span className="text-2xl">{nextLevel.icon}</span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{referralStats.totalReferrals} / {nextLevel.referrals} referrals</span>
              <span>{Math.round((referralStats.totalReferrals / nextLevel.referrals) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((referralStats.totalReferrals / nextLevel.referrals) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Earn {nextLevel.reward} + {nextLevel.bonus}
          </p>
        </div>
      )}

      {/* Rewards Table */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Rewards Levels</h3>
        <div className="space-y-2">
          {referralRewards.map((reward, index) => (
            <div 
              key={reward.level}
              className={`flex items-center justify-between p-2 rounded-lg ${
                referralStats.totalReferrals >= reward.referrals 
                  ? 'bg-green-100 border border-green-200' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{reward.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{reward.level}</div>
                  <div className="text-xs text-gray-600">{reward.referrals} referrals</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{reward.reward}</div>
                <div className="text-xs text-gray-600">{reward.bonus}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Modal */}
      <AnimatePresence>
        {showReferralModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReferralModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Referral Statistics</h3>
                <button
                  onClick={() => setShowReferralModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Detailed Stats */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{referralStats.totalReferrals}</div>
                    <div className="text-sm text-blue-700">Total Referrals</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{referralStats.successfulReferrals}</div>
                    <div className="text-sm text-green-700">Successful</div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600">KES {referralStats.totalEarnings.toLocaleString()}</div>
                  <div className="text-sm text-orange-700">Total Earnings</div>
                </div>

                {/* Referral History */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Recent Referrals</h4>
                  <div className="space-y-2">
                    {referralHistory.slice(0, 5).map((referral, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{referral.name}</div>
                          <div className="text-xs text-gray-600">{referral.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">KES {referral.earnings}</div>
                          <div className="text-xs text-gray-600">{referral.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReferralSystem;
