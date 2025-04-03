
import React from 'react';
import OfferwallItem from './OfferwallItem';

interface OfferwallSectionProps {
  isDisabled: boolean;
  onItemClick: (reward: number, type: string) => void;
}

const OfferwallSection: React.FC<OfferwallSectionProps> = ({ isDisabled, onItemClick }) => {
  const offerwallItems = [
    {
      id: 'survey',
      title: 'Complete a survey',
      description: '5-10 minutes',
      reward: 10,
    },
    {
      id: 'install',
      title: 'Install an app',
      description: '2-3 minutes',
      reward: 5,
    },
    {
      id: 'video',
      title: 'Watch a video',
      description: '30 seconds',
      reward: 2,
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 animate-scale-up animation-delay-100">
      <h3 className="font-semibold text-lg mb-3">Offerwall</h3>
      <p className="text-sm text-gray-500 mb-6">Complete offers to earn extra coins</p>
      
      <div className="space-y-4">
        {offerwallItems.map(item => (
          <OfferwallItem
            key={item.id}
            title={item.title}
            description={item.description}
            reward={item.reward}
            isDisabled={isDisabled}
            onClick={() => onItemClick(item.reward, item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default OfferwallSection;
