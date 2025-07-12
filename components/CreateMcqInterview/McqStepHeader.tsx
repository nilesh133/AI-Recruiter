import React from 'react';

interface McqStepHeaderProps {
  step: number;
  heading: string;
  subheading: string;
}

const McqStepHeader: React.FC<McqStepHeaderProps> = ({ step, heading, subheading }) => {
  return (
    <div className="mb-6 text-center">
      <div className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
        <span className="text-3xl">{stepIcon(step)}</span>
        <span>{heading}</span>
      </div>
      <div className="text-gray-400 text-base max-w-xl mx-auto">{subheading}</div>
    </div>
  );
};

function stepIcon(step: number) {
  switch (step) {
    case 1:
      return '👤';
    case 2:
      return '🕐';
    case 3:
      return '❓';
    case 4:
      return '🔄';
    case 5:
      return '📅';
    default:
      return '⬜';
  }
}

export default McqStepHeader; 