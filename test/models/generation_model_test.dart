import 'package:flutter_test/flutter_test.dart';
import 'package:staggio/data/models/generation_model.dart';

void main() {
  group('GenerationModel', () {
    test('should create from JSON', () {
      final json = {
        'id': '789',
        'type': 'staging',
        'status': 'completed',
        'creditsUsed': 2,
        'inputData': {'style': 'moderno'},
        'outputImageUrl': 'https://example.com/result.jpg',
        'createdAt': '2026-02-01T00:00:00.000Z',
      };

      final gen = GenerationModel.fromJson(json);

      expect(gen.id, '789');
      expect(gen.type, 'staging');
      expect(gen.status, 'completed');
      expect(gen.creditsUsed, 2);
      expect(gen.outputImageUrl, 'https://example.com/result.jpg');
    });

    test('should return correct type display name', () {
      final staging = GenerationModel(
        id: '1', type: 'staging', status: 'completed',
        creditsUsed: 2, createdAt: DateTime.now(),
      );
      final description = GenerationModel(
        id: '2', type: 'description', status: 'completed',
        creditsUsed: 1, createdAt: DateTime.now(),
      );
      final terrain = GenerationModel(
        id: '3', type: 'terrain_vision', status: 'completed',
        creditsUsed: 3, createdAt: DateTime.now(),
      );
      final enhance = GenerationModel(
        id: '4', type: 'photo_enhance', status: 'completed',
        creditsUsed: 1, createdAt: DateTime.now(),
      );

      expect(staging.typeDisplayName, 'Home Staging');
      expect(description.typeDisplayName, 'Descrição IA');
      expect(terrain.typeDisplayName, 'Visão de Terreno');
      expect(enhance.typeDisplayName, 'Melhoria de Foto');
    });

    test('should return correct type icon', () {
      final staging = GenerationModel(
        id: '1', type: 'staging', status: 'completed',
        creditsUsed: 2, createdAt: DateTime.now(),
      );

      expect(staging.typeIcon.isNotEmpty, true);
    });

    test('should detect status correctly', () {
      final completed = GenerationModel(
        id: '1', type: 'staging', status: 'completed',
        creditsUsed: 2, createdAt: DateTime.now(),
      );
      final processing = GenerationModel(
        id: '2', type: 'staging', status: 'processing',
        creditsUsed: 2, createdAt: DateTime.now(),
      );
      final failed = GenerationModel(
        id: '3', type: 'staging', status: 'failed',
        creditsUsed: 0, createdAt: DateTime.now(),
      );

      expect(completed.isCompleted, true);
      expect(completed.isProcessing, false);
      expect(processing.isProcessing, true);
      expect(processing.isCompleted, false);
      expect(failed.isCompleted, false);
      expect(failed.isProcessing, false);
    });
  });
}
