package com.bibliacatolica.api.domain.port.in;

/**
 * Puerto de entrada para el Asistente Bíblico de IA (RAG)
 */
public interface BibleRagUseCase {

    /**
     * Responde a una pregunta del usuario basada en el contenido de la Biblia.
     * 
     * @param userQuery La pregunta del usuario.
     * @return La respuesta de la IA.
     */
    String askBible(String userQuery);
}
