import { showError } from "@/utils/toast";

const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL;

export const sendMessageToAgent = async (message: string): Promise<string> => {
  if (!MAKE_WEBHOOK_URL) {
    showError("A URL do webhook do Make.com não está configurada. Por favor, adicione VITE_MAKE_WEBHOOK_URL ao seu arquivo .env.");
    throw new Error("Make.com webhook URL is not configured.");
  }

  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      showError(`Erro do agente: ${errorData.message || response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.reply || "Desculpe, não consegui obter uma resposta do agente.";
  } catch (error) {
    console.error("Erro ao enviar mensagem para o agente:", error);
    showError("Ocorreu um erro ao se comunicar com o agente. Por favor, tente novamente.");
    throw error;
  }
};