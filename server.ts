import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Generation
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, studentName, careerName, additionalContext } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "El prompt es obligatorio." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "La API Key de Gemini no está configurada en el servidor." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = 
        `Eres un asistente de comunicación académica para el Centro de Formación Técnica (CFT) 360 Análisis.\n` +
        `Tu tarea es redactar un mensaje de notificación de WhatsApp altamente personalizado para un estudiante.\n` +
        `El mensaje debe ser:\n` +
        `- Muy personalizado para el estudiante llamado "${studentName || 'Estudiante'}" (menciónalo cordialmente por su nombre).\n` +
        `- Mencionar su carrera: "${careerName || 'su carrera'}" si es relevante o aporta contexto natural.\n` +
        `- Cercano, empático, empoderador, formal pero amigable, y adaptado al contexto chileno/CFT.\n` +
        `- Incluir emojis pertinentes de manera sutil pero clara (como 📚, 📢, 🚀, ⚠️, 📅) para hacer el mensaje atractivo.\n` +
        `- Corto y directo al grano, optimizado para leerse fácilmente en la pantalla de bloqueo de un celular.\n` +
        `- No incluyas metadatos, introducciones ("Aquí tienes el mensaje:"), bloques de código con comillas invertidas, ni explicaciones de diseño. Devuelve EXCLUSIVAMENTE el texto que el usuario enviará por WhatsApp.`;

      const userContent = `Escribe un mensaje de WhatsApp amigable para ${studentName || 'el estudiante'} sobre el siguiente tema: "${prompt}".\n` +
        `Información académica del estudiante:\n` +
        `- Nombre: ${studentName || 'No especificado'}\n` +
        `- Carrera: ${careerName || 'No especificada'}\n` +
        `- Detalles de contexto adicionales proporcionados: ${additionalContext || 'Ninguno'}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userContent,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error in Gemini integration:", error);
      res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
