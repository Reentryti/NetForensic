import React from "react";

const RapportPDFButton = ({ sessionId }) => {
  const handleDownload = () => {
    window.open(`/api/rapport/${sessionId}`, "_blank");
  };

  return (
    <button
      onClick={handleDownload}
      className="mt-4 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded"
    >
      Télécharger le rapport en PDF
    </button>
  );
};

export default RapportPDFButton;
