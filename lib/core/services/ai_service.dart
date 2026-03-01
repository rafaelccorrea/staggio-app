import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';

class AIService {
  final String apiKey;
  final String baseUrl = 'https://api.openai.com/v1';

  AIService({required this.apiKey});

  /// Valida se a imagem é de um imóvel, terreno ou planta de casa
  /// Retorna true se válida, false caso contrário
  Future<bool> validatePropertyImage(File imageFile) async {
    try {
      final bytes = await imageFile.readAsBytes();
      final base64Image = base64Encode(bytes);

      final response = await http.post(
        Uri.parse('$baseUrl/chat/completions'),
        headers: {
          'Authorization': 'Bearer $apiKey',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'model': 'gpt-4-vision-preview',
          'messages': [
            {
              'role': 'user',
              'content': [
                {
                  'type': 'text',
                  'text': '''Analise esta imagem e responda APENAS com "SIM" ou "NÃO".
                  
A imagem mostra um imóvel, terreno, planta de casa, fachada de propriedade, ou interior de residência?

Responda apenas com uma palavra: SIM ou NÃO'''
                },
                {
                  'type': 'image_url',
                  'image_url': {
                    'url': 'data:image/jpeg;base64,$base64Image'
                  }
                }
              ]
            }
          ],
          'max_tokens': 10,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final content = data['choices'][0]['message']['content'].toString().toUpperCase().trim();
        return content.contains('SIM');
      }
      return false;
    } catch (e) {
      debugPrint('[AIService] Erro ao validar imagem: $e');
      return false;
    }
  }

  /// Melhora a qualidade de uma foto de imóvel
  Future<String?> enhancePropertyPhoto(File imageFile) async {
    try {
      final bytes = await imageFile.readAsBytes();
      final base64Image = base64Encode(bytes);

      final response = await http.post(
        Uri.parse('$baseUrl/chat/completions'),
        headers: {
          'Authorization': 'Bearer $apiKey',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'model': 'gpt-4-vision-preview',
          'messages': [
            {
              'role': 'user',
              'content': [
                {
                  'type': 'text',
                  'text': '''Analise esta foto de imóvel e forneça sugestões específicas para melhorar sua qualidade e atratividade para potenciais compradores. 
                  
Inclua:
1. Iluminação (se está boa, ruim, como melhorar)
2. Ângulo da câmera (se é o melhor ângulo)
3. Limpeza e organização
4. Destaque de características positivas
5. Recomendações de edição (contraste, saturação, etc)

Seja conciso e prático.'''
                },
                {
                  'type': 'image_url',
                  'image_url': {
                    'url': 'data:image/jpeg;base64,$base64Image'
                  }
                }
              ]
            }
          ],
          'max_tokens': 500,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content'];
      }
      return null;
    } catch (e) {
      debugPrint('[AIService] Erro ao melhorar foto: $e');
      return null;
    }
  }

  /// Analisa o terreno/vista da propriedade
  Future<String?> analyzeTerrainVision(File imageFile) async {
    try {
      final bytes = await imageFile.readAsBytes();
      final base64Image = base64Encode(bytes);

      final response = await http.post(
        Uri.parse('$baseUrl/chat/completions'),
        headers: {
          'Authorization': 'Bearer $apiKey',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'model': 'gpt-4-vision-preview',
          'messages': [
            {
              'role': 'user',
              'content': [
                {
                  'type': 'text',
                  'text': '''Analise esta imagem de terreno/vista de propriedade e forneça uma análise detalhada:

1. Tipo de terreno (plano, inclinado, etc)
2. Vegetação presente
3. Características do solo (se visível)
4. Potencial de construção
5. Vistas/paisagem
6. Acessibilidade
7. Possíveis desafios ou pontos positivos

Seja profissional e útil para um corretor de imóveis.'''
                },
                {
                  'type': 'image_url',
                  'image_url': {
                    'url': 'data:image/jpeg;base64,$base64Image'
                  }
                }
              ]
            }
          ],
          'max_tokens': 800,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content'];
      }
      return null;
    } catch (e) {
      debugPrint('[AIService] Erro ao analisar terreno: $e');
      return null;
    }
  }

  /// Gera descrição de vídeo para uma propriedade
  Future<String?> generateVideoDescription(File imageFile) async {
    try {
      final bytes = await imageFile.readAsBytes();
      final base64Image = base64Encode(bytes);

      final response = await http.post(
        Uri.parse('$baseUrl/chat/completions'),
        headers: {
          'Authorization': 'Bearer $apiKey',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'model': 'gpt-4-vision-preview',
          'messages': [
            {
              'role': 'user',
              'content': [
                {
                  'type': 'text',
                  'text': '''Analise esta foto de imóvel e crie um script de narração para um vídeo de 30 segundos que destaque os melhores aspectos da propriedade.

O script deve:
- Ser envolvente e profissional
- Durar aproximadamente 30 segundos (cerca de 75-85 palavras)
- Destacar características positivas
- Usar linguagem que atrai compradores
- Ser em português

Retorne APENAS o script, sem explicações adicionais.'''
                },
                {
                  'type': 'image_url',
                  'image_url': {
                    'url': 'data:image/jpeg;base64,$base64Image'
                  }
                }
              ]
            }
          ],
          'max_tokens': 200,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content'];
      }
      return null;
    } catch (e) {
      debugPrint('[AIService] Erro ao gerar descrição de vídeo: $e');
      return null;
    }
  }
}
