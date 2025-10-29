import { GoogleGenAI } from '@google/genai';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Inicializa o cliente Gemini com a chave de API segura no backend
// A chave deve ser configurada como uma variável de ambiente no Vercel (ex: GEMINI_API_KEY)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

// Define o modelo a ser usado
const MODEL_NAME = 'gemini-2.5-flash';

// Tipagem para os dados de entrada
interface CoachRequest {
  userName: string;
  planDescription: string;
  recentLogs: string;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userName, planDescription, recentLogs } = req.body as CoachRequest;

    if (!userName || !planDescription) {
      return res.status(400).json({ error: 'Missing required fields: userName, planDescription' });
    }

    const prompt = `
      Você é um treinador de corrida virtual para um aplicativo chamado 'Corrida App'. Seu objetivo é motivar os usuários e fornecer conselhos práticos e personalizados.
      Um usuário chamado ${userName}, que está seguindo ${planDescription} para correr 5km, pediu um conselho.

      Aqui estão seus dados de treino das últimas duas semanas:
      ${recentLogs.length > 0 ? recentLogs : 'Nenhum treino registrado nas últimas duas semanas.'}

      Analise esses dados e forneça um conselho curto, motivador e acionável em português do Brasil. O conselho deve ter no máximo 3 parágrafos.
      Considere os seguintes pontos na sua análise:
      - Consistência: O usuário está treinando nos dias programados?
      - Progresso: A distância ou o tempo estão aumentando? O pace está melhorando?
      - Pontos de atenção: Há muitos treinos perdidos? O progresso estagnou?

      Se os dados forem insuficientes (menos de 3 treinos registrados), dê um conselho geral e incentive o usuário a registrar mais treinos.
      Se o desempenho for bom, elogie e sugira um novo desafio.
      Se houver espaço para melhoria, dê uma dica construtiva e encorajadora.

      Seu tom deve ser amigável e de apoio.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    // Retorna o conselho gerado pelo modelo
    res.status(200).json({ advice: response.text });

  } catch (error) {
    console.error('Error in AI Coach API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
