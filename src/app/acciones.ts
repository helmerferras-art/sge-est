import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// Reemplaza la función generarPlaneacionIA en src/app/acciones.ts
export async function generarPlaneacionIA(datos: any) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  // En src/app/acciones.ts, actualiza el prompt dentro de la función:
const prompt = `
Eres un experto ATP de la NEM. Genera una planeación profesional.
CONTEXTO:
- Escuela: ${datos.escuela} | Docente: ${datos.docente}
- Materia: ${datos.asignatura} | Grado: ${datos.grado}
- Planeación: ${datos.periodicidad} | Tiempo por sesión: ${datos.duracion}
- Metodología: ${datos.metodologia}
- Problemática: ${datos.problematica}
- Ejes Articuladores: ${datos.ejes.join(", ")}

LOGÍSTICA:
  - Periodo de aplicación: del ${datos.fechaInicio} al ${datos.fechaFin}.
  - Horario de clase: ${datos.horaClase}.
  - Duración de cada sesión: ${datos.duracion}.
  - Periodicidad: ${datos.periodicidad}.
  
  CONTENIDO:
  - Materia: ${datos.asignatura}
  - Problemática: ${datos.problematica}
  ...
  Instrucción: Diseña el cronograma de actividades respetando estrictamente el periodo del ${datos.fechaInicio} al ${datos.fechaFin}.

REQUISITO: Estructura la secuencia didáctica considerando exactamente sesiones de ${datos.duracion} cada una para cubrir un periodo ${datos.periodicidad}. 
Usa un formato de tabla para las actividades de inicio, desarrollo y cierre.
`;
  
    const result = await model.generateContent(prompt);
    return result.response.text();
  }