import 'package:flutter_test/flutter_test.dart';
import 'package:staggio/data/models/user_model.dart';
import 'package:staggio/core/enums/plan_type.dart';

void main() {
  group('UserModel', () {
    test('should create from JSON', () {
      final json = {
        'id': '123',
        'name': 'Rafael Correa',
        'email': 'rafael@test.com',
        'role': 'corretor',
        'plan': PlanType.pro.value,
        'aiCreditsUsed': 15,
        'aiCreditsLimit': 100,
      };

      final user = UserModel.fromJson(json);

      expect(user.id, '123');
      expect(user.name, 'Rafael Correa');
      expect(user.email, 'rafael@test.com');
      expect(user.plan, 'pro');
      expect(user.aiCreditsUsed, 15);
      expect(user.aiCreditsLimit, 100);
    });

    test('should convert to JSON', () {
      final user = UserModel(
        id: '123',
        name: 'Rafael Correa',
        email: 'rafael@test.com',
        role: 'corretor',
        plan: PlanType.pro,
        aiCreditsUsed: 15,
        aiCreditsLimit: 100,
      );

      final json = user.toJson();

      expect(json['id'], '123');
      expect(json['name'], 'Rafael Correa');
      expect(json['email'], 'rafael@test.com');
      expect(json['plan'], 'pro');
    });

    test('should return correct plan display name', () {
      final starterUser = UserModel(
        id: '1', name: 'Test', email: 'test@test.com', role: 'corretor',
        plan: PlanType.starter, aiCreditsUsed: 0, aiCreditsLimit: 50,
      );
      final proUser = UserModel(
        id: '2', name: 'Test', email: 'test@test.com', role: 'corretor',
        plan: PlanType.pro, aiCreditsUsed: 0, aiCreditsLimit: 100,
      );
      final agencyUser = UserModel(
        id: '3', name: 'Test', email: 'test@test.com', role: 'corretor',
        plan: PlanType.agency, aiCreditsUsed: 0, aiCreditsLimit: 500,
      );
      final freeUser = UserModel(
        id: '4', name: 'Test', email: 'test@test.com', role: 'corretor',
        plan: PlanType.free, aiCreditsUsed: 0, aiCreditsLimit: 5,
      );

      expect(starterUser.planDisplayName, 'Starter');
      expect(proUser.planDisplayName, 'Pro');
      expect(agencyUser.planDisplayName, 'Imobiliária');
      expect(freeUser.planDisplayName, 'Gratuito');
    });

    test('should calculate credits percentage', () {
      final user = UserModel(
        id: '1', name: 'Test', email: 'test@test.com', role: 'corretor',
        plan: PlanType.pro, aiCreditsUsed: 30, aiCreditsLimit: 100,
      );

      expect(user.creditsPercentage, 0.3);
    });

    test('should detect when credits are exhausted', () {
      final user = UserModel(
        id: '1', name: 'Test', email: 'test@test.com', role: 'corretor',
        plan: PlanType.pro, aiCreditsUsed: 100, aiCreditsLimit: 100,
      );

      expect(user.hasCredits, false);
    });

    test('should detect when credits are available', () {
      final user = UserModel(
        id: '1', name: 'Test', email: 'test@test.com', role: 'corretor',
        plan: PlanType.pro, aiCreditsUsed: 50, aiCreditsLimit: 100,
      );

      expect(user.hasCredits, true);
    });

    test('should copy with new values', () {
      final user = UserModel(
        id: '1', name: 'Test', email: 'test@test.com', role: 'corretor',
        plan: PlanType.free,
      );

      final updated = user.copyWith(plan: PlanType.pro, aiCreditsLimit: 100);

      expect(updated.plan, PlanType.pro);
      expect(updated.aiCreditsLimit, 100);
      expect(updated.name, 'Test');
    });
  });
}
