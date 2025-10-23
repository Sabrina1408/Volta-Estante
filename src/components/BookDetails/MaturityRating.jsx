/**
 * Componente para traduzir o código da classificação indicativa para um texto legível.
 * @param {{ rating: string }} props - O código da classificação (ex: "NOT_MATURE").
 */
const MaturityRating = ({ rating }) => {
  const ratingsMap = {
    'NOT_MATURE': 'Livre para todos os públicos',
    'MATURE': 'Conteúdo adulto',
    // Adicione outras classificações da API aqui, se necessário.
  };

  // Retorna o texto traduzido ou o texto original se não encontrar correspondência.
  const translatedRating = ratingsMap[rating] || rating;

  return <>{translatedRating}</>;
};

export default MaturityRating;