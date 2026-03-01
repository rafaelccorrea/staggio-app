import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';

class HeyGenService {
  final String apiKey;
  final String baseUrl = 'https://api.heygen.com/v1';

  HeyGenService({required this.apiKey});

  /// Cria um vídeo de 30 segundos com narração sobre a propriedade
  /// Retorna a URL do vídeo gerado
  Future<String?> generatePropertyVideo({
    required String scriptText,
    required String avatarId,
  }) async {
    try {
      // Passo 1: Criar o vídeo com narração
      final videoResponse = await http.post(
        Uri.parse('$baseUrl/video_talks'),
        headers: {
          'Authorization': 'Bearer $apiKey',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'avatar_id': avatarId,
          'voice': {
            'voice_id': 'pt-BR-Neural2-A', // Voz feminina em português brasileiro
          },
          'script': scriptText,
          'caption': true,
          'dimension': {
            'width': 1080,
            'height': 1920,
          },
          'duration': 30, // Máximo de 30 segundos
        }),
      );

      if (videoResponse.statusCode == 201 || videoResponse.statusCode == 200) {
        final data = jsonDecode(videoResponse.body);
        final videoId = data['video_id'];
        
        // Passo 2: Aguardar processamento do vídeo
        return await _waitForVideoCompletion(videoId);
      } else {
        debugPrint('[HeyGen] Erro ao criar vídeo: ${videoResponse.statusCode}');
        debugPrint('[HeyGen] Response: ${videoResponse.body}');
        return null;
      }
    } catch (e) {
      debugPrint('[HeyGen] Erro ao gerar vídeo: $e');
      return null;
    }
  }

  /// Aguarda a conclusão do processamento do vídeo
  Future<String?> _waitForVideoCompletion(String videoId) async {
    int attempts = 0;
    const maxAttempts = 60; // Máximo de 5 minutos (60 x 5 segundos)

    while (attempts < maxAttempts) {
      try {
        final response = await http.get(
          Uri.parse('$baseUrl/video_talks/$videoId'),
          headers: {
            'Authorization': 'Bearer $apiKey',
          },
        );

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          final status = data['status'];

          if (status == 'completed') {
            return data['video_url'];
          } else if (status == 'failed') {
            debugPrint('[HeyGen] Vídeo falhou no processamento');
            return null;
          }
          // Status: processing, continue waiting
        }

        // Aguardar 5 segundos antes de tentar novamente
        await Future.delayed(const Duration(seconds: 5));
        attempts++;
      } catch (e) {
        debugPrint('[HeyGen] Erro ao verificar status do vídeo: $e');
        return null;
      }
    }

    debugPrint('[HeyGen] Timeout ao aguardar vídeo');
    return null;
  }

  /// Lista avatares disponíveis
  Future<List<Map<String, dynamic>>?> getAvailableAvatars() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/avatars'),
        headers: {
          'Authorization': 'Bearer $apiKey',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final avatars = List<Map<String, dynamic>>.from(data['avatars'] ?? []);
        return avatars;
      }
      return null;
    } catch (e) {
      debugPrint('[HeyGen] Erro ao listar avatares: $e');
      return null;
    }
  }

  /// Obtém as vozes disponíveis
  Future<List<Map<String, dynamic>>?> getAvailableVoices() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/voices'),
        headers: {
          'Authorization': 'Bearer $apiKey',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final voices = List<Map<String, dynamic>>.from(data['voices'] ?? []);
        return voices;
      }
      return null;
    } catch (e) {
      debugPrint('[HeyGen] Erro ao listar vozes: $e');
      return null;
    }
  }
}
