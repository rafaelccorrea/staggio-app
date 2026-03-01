import 'package:flutter/material.dart';
import '../../data/models/user_model.dart';
import '../../features/subscription/screens/plans_screen.dart';
import '../theme/app_theme.dart';
import '../enums/plan_type.dart';

/// Plan-based feature gating
class PlanGating {
  /// Features available per plan
  static const Map<PlanType, List<String>> planFeatures = {
    PlanType.free: ['staging', 'description'],
    PlanType.starter: ['staging', 'description', 'chat'],
    PlanType.pro: ['staging', 'description', 'chat', 'terrain_vision', 'photo_enhance'],
    PlanType.agency: ['staging', 'description', 'chat', 'terrain_vision', 'photo_enhance', 'video_generation'],
  };

  /// Check if user has access to a feature
  static bool hasAccess(UserModel? user, String feature) {
    if (user == null) return false;
    final plan = user.plan;
    final features = planFeatures[plan] ?? planFeatures[PlanType.free]!;
    return features.contains(feature);
  }

  /// Check if user has credits remaining
  static bool hasCredits(UserModel? user) {
    if (user == null) return false;
    return user.hasCredits;
  }

  /// Show upgrade dialog when user doesn't have access
  static void showUpgradeDialog(BuildContext context, String featureName) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(Icons.lock_outline, color: AppColors.primary, size: 24),
            const SizedBox(width: 10),
            const Flexible(child: Text('Recurso Bloqueado')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'O recurso "$featureName" não está disponível no seu plano atual.',
              style: TextStyle(fontSize: 14, height: 1.5),
            ),
            const SizedBox(height: 12),
            Text(
              'Faça upgrade para ter acesso a todas as ferramentas de IA.',
              style: TextStyle(fontSize: 14, color: AppColors.primary, fontWeight: FontWeight.w500),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Depois'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PlansScreen()),
              );
            },
            child: const Text('Ver Planos'),
          ),
        ],
      ),
    );
  }

  /// Show no credits dialog
  static void showNoCreditsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 24),
            const SizedBox(width: 10),
            const Flexible(child: Text('Sem Créditos')),
          ],
        ),
        content: const Text(
          'Seus créditos de IA acabaram. Compre mais créditos ou faça upgrade do seu plano.',
          style: TextStyle(fontSize: 14, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Depois'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PlansScreen()),
              );
            },
            child: const Text('Ver Planos'),
          ),
        ],
      ),
    );
  }
}
