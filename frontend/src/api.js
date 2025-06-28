import axios from "axios";

export async function startCapture() {
    try{
      const response = await axios.post('/api/capture/');
      return response.data;
    } catch (error) {
      console.error("Erreur lors du lancement de la capture", error);
      throw error;
    }
};

export async function generateReport() {
  const response = await axios.get("/api/generate-report/"); 
  return response.data;
};

export async function runAnalysis() {
  const response = await axios.get("/api/analyse/");
  return response.data;
}
