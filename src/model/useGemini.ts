// Hook para integración con Gemini API.
// Gestiona la API key en localStorage y genera listas de palabras para temas.
// TODO: cuando haya backend, reemplazar la URL del fetch por el endpoint propio.

import { useState } from 'react';
import { promptGenerarLista } from './listapredeterminada';
import type { Entrada } from './obtenerLista';

export type EstadoGemini = 'idle' | 'cargando' | 'error' | 'exito';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export function useGemini() {
    const [estado, setEstado] = useState<EstadoGemini>('idle');
    const [error, setError] = useState<string | null>(null);
    const [apiKey, setApiKeyState] = useState<string | null>(
        () => localStorage.getItem('gemini_key')
    );

    const guardarApiKey = (key: string) => {
        localStorage.setItem('gemini_key', key.trim());
        setApiKeyState(key.trim());
    };

    const eliminarApiKey = () => {
        localStorage.removeItem('gemini_key');
        setApiKeyState(null);
    };

    const generarTema = async (nombreTema: string): Promise<Entrada[] | null> => {
        if (!apiKey) { setError('No hay API key configurada.'); return null; }

        setEstado('cargando');
        setError(null);

        const prompt = promptGenerarLista.replace('[TEMA]', nombreTema) +
            '\n\nIMPORTANTE: Responde ÚNICAMENTE con el arreglo JSON, sin texto adicional, sin bloques de código markdown.';

        try {
            const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.9, maxOutputTokens: 8192 }
                })
            });

            if (res.status === 429) {
                setEstado('error');
                setError('Límite de la API alcanzado. Intenta más tarde o usa el método manual.');
                return null;
            }
            if (res.status === 400) {
                setEstado('error');
                setError('API key inválida. Verifica que sea correcta.');
                return null;
            }
            if (!res.ok) {
                setEstado('error');
                setError(`Error de la API (${res.status}). Intenta más tarde.`);
                return null;
            }

            const data = await res.json();
            const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

            if (!texto) {
                setEstado('error');
                setError('Gemini no devolvió contenido. Intenta de nuevo.');
                return null;
            }

            // Extraer JSON — Gemini a veces lo envuelve en bloques markdown
            const match = texto.match(/\[\s*\{[\s\S]*\}\s*\]/);
            const jsonStr = match ? match[0] : texto.replace(/```json|```/g, '').trim();

            let parsed: Entrada[];
            try {
                parsed = JSON.parse(jsonStr);
            } catch (parseErr) {
                console.error('Error parseando JSON de Gemini:', parseErr, '\nTexto recibido:', texto);
                setEstado('error');
                setError('Gemini devolvió un formato inesperado. Intenta de nuevo.');
                return null;
            }

            if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(e => typeof e.palabra === 'string' && typeof e.pista === 'string')) {
                console.error('Estructura inválida:', parsed);
                setEstado('error');
                setError('Las palabras generadas no tienen el formato correcto. Intenta de nuevo.');
                return null;
            }

            setEstado('exito');
            return parsed;
        } catch (err) {
            console.error('Error llamando a Gemini:', err);
            setEstado('error');
            setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
            return null;
        }
    };

    return { apiKey, guardarApiKey, eliminarApiKey, generarTema, estado, error, setEstado };
}
