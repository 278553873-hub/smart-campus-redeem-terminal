import React from 'react';
import {
  getQuestionnaireHeaderImage,
  type QuestionnaireHeaderImageId,
} from '../../shared/questionnaireThemeTokens';

interface QuestionnaireHeaderImageProps {
  headerImageId?: QuestionnaireHeaderImageId;
  className?: string;
}

const QuestionnaireHeaderImage: React.FC<QuestionnaireHeaderImageProps> = ({
  headerImageId = 'none',
  className = '',
}) => {
  const image = getQuestionnaireHeaderImage(headerImageId);
  if (!image) return null;

  return (
    <div className={`aspect-[16/7] shrink-0 overflow-hidden ${className}`}>
      <img src={image} alt="" className="block h-full w-full object-cover" />
    </div>
  );
};

export default QuestionnaireHeaderImage;
