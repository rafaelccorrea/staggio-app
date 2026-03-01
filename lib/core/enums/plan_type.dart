/// Enum representing different subscription plan types
enum PlanType {
  free('free'),
  starter('starter'),
  pro('pro'),
  agency('agency');

  final String value;

  const PlanType(this.value);

  /// Convert string value to PlanType enum
  static PlanType fromString(String? value) {
    return PlanType.values.firstWhere(
      (plan) => plan.value == value,
      orElse: () => PlanType.free,
    );
  }

  /// Get display name for the plan
  String get displayName {
    switch (this) {
      case PlanType.starter:
        return 'Starter';
      case PlanType.pro:
        return 'Pro';
      case PlanType.agency:
        return 'Imobiliária';
      case PlanType.free:
      default:
        return 'Gratuito';
    }
  }

  /// Check if plan has access to a feature
  bool hasFeature(String feature) {
    switch (this) {
      case PlanType.free:
        return ['view_properties', 'view_ai_tools'].contains(feature);
      case PlanType.starter:
        return !['team_management', 'api_access'].contains(feature);
      case PlanType.pro:
        return !['api_access'].contains(feature);
      case PlanType.agency:
        return true; // All features
    }
  }

  /// Get monthly AI credits limit for this plan
  int get monthlyCreditsLimit {
    switch (this) {
      case PlanType.free:
        return 5;
      case PlanType.starter:
        return 50;
      case PlanType.pro:
        return 100;
      case PlanType.agency:
        return 200;
    }
  }
}
