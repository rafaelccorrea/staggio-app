import 'package:equatable/equatable.dart';

class GenerationModel extends Equatable {
  final String id;
  final String type;
  final String status;
  final String? inputImageUrl;
  final String? outputImageUrl;
  final String? inputPrompt;
  final String? outputText;
  final int? processingTimeMs;
  final int creditsUsed;
  final DateTime? createdAt;

  const GenerationModel({
    required this.id,
    required this.type,
    required this.status,
    this.inputImageUrl,
    this.outputImageUrl,
    this.inputPrompt,
    this.outputText,
    this.processingTimeMs,
    this.creditsUsed = 1,
    this.createdAt,
  });

  factory GenerationModel.fromJson(Map<String, dynamic> json) {
    return GenerationModel(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      status: json['status'] ?? 'pending',
      inputImageUrl: json['inputImageUrl'],
      outputImageUrl: json['outputImageUrl'],
      inputPrompt: json['inputPrompt'],
      outputText: json['outputText'],
      processingTimeMs: json['processingTimeMs'],
      creditsUsed: json['creditsUsed'] ?? 1,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }

  String get typeDisplayName {
    switch (type) {
      case 'staging': return 'Home Staging';
      case 'terrain_vision': return 'Visão de Terreno';
      case 'description': return 'Descrição IA';
      case 'photo_enhance': return 'Melhoria de Foto';
      case 'virtual_tour': return 'Tour Virtual';
      default: return type;
    }
  }

  String get typeIcon {
    switch (type) {
      case 'staging': return '🏠';
      case 'terrain_vision': return '🏗️';
      case 'description': return '📝';
      case 'photo_enhance': return '📸';
      case 'virtual_tour': return '🎥';
      default: return '✨';
    }
  }

  bool get isCompleted => status == 'completed';
  bool get isProcessing => status == 'processing';
  bool get isFailed => status == 'failed';

  @override
  List<Object?> get props => [id, type, status];
}
