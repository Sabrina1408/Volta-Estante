const MaturityRating = ({ rating }) => {
  const ratingsMap = {
    'NOT_MATURE': 'Livre para todos os públicos',
    'MATURE': 'Conteúdo adulto',

  };

  const translatedRating = ratingsMap[rating] || rating;

  return <>{translatedRating}</>;
};

export default MaturityRating;