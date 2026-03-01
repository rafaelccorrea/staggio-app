import 'package:equatable/equatable.dart';

class UserModel extends Equatable {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? phone;
  final String? creci;
  final String? avatarUrl;
  final String plan;
  final int aiCreditsUsed;
  final int aiCreditsLimit;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
    this.creci,
    this.avatarUrl,
    this.plan = 'free',
    this.aiCreditsUsed = 0,
    this.aiCreditsLimit = 5,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'corretor',
      phone: json['phone'],
      creci: json['creci'],
      avatarUrl: json['avatarUrl'],
      plan: json['plan'] ?? 'free',
      aiCreditsUsed: json['aiCreditsUsed'] ?? 0,
      aiCreditsLimit: json['aiCreditsLimit'] ?? 5,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'phone': phone,
      'creci': creci,
      'avatarUrl': avatarUrl,
      'plan': plan,
      'aiCreditsUsed': aiCreditsUsed,
      'aiCreditsLimit': aiCreditsLimit,
    };
  }

  UserModel copyWith({
    String? name,
    String? phone,
    String? creci,
    String? avatarUrl,
    String? plan,
    int? aiCreditsUsed,
    int? aiCreditsLimit,
  }) {
    return UserModel(
      id: id,
      name: name ?? this.name,
      email: email,
      role: role,
      phone: phone ?? this.phone,
      creci: creci ?? this.creci,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      plan: plan ?? this.plan,
      aiCreditsUsed: aiCreditsUsed ?? this.aiCreditsUsed,
      aiCreditsLimit: aiCreditsLimit ?? this.aiCreditsLimit,
    );
  }

  double get creditsPercentage =>
      aiCreditsLimit > 0 ? aiCreditsUsed / aiCreditsLimit : 0;

  bool get hasCredits => aiCreditsUsed < aiCreditsLimit;

  int get aiCreditsRemaining => aiCreditsLimit - aiCreditsUsed;

  int get totalProperties => 0; // Updated from API

  int get totalGenerations => aiCreditsUsed;

  String get planDisplayName {
    switch (plan) {
      case 'starter':
        return 'Starter';
      case 'pro':
        return 'Pro';
      case 'agency':
        return 'Imobiliária';
      default:
        return 'Gratuito';
    }
  }

  @override
  List<Object?> get props => [id, name, email, role, plan, aiCreditsUsed];
}
