import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/theme/app_theme.dart';

class BiometricService {
  static final LocalAuthentication _auth = LocalAuthentication();
  static const _biometricEnabledKey = 'biometric_enabled';
  static const _biometricEmailKey = 'biometric_email';
  static const _biometricPasswordKey = 'biometric_password';
  static const _biometricPromptShownKey = 'biometric_prompt_shown';

  /// Check if device supports biometrics
  static Future<bool> isAvailable() async {
    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isSupported = await _auth.isDeviceSupported();
      return canCheck && isSupported;
    } on PlatformException {
      return false;
    }
  }

  /// Check if biometric login is enabled
  static Future<bool> isEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_biometricEnabledKey) ?? false;
  }

  /// Check if we already showed the biometric prompt
  static Future<bool> wasPromptShown() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_biometricPromptShownKey) ?? false;
  }

  /// Mark that we showed the biometric prompt
  static Future<void> markPromptShown() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_biometricPromptShownKey, true);
  }

  /// Enable biometric login and save credentials
  static Future<void> enable(String email, String password) async {
    final prefs = await SharedPreferences.getInstance();
    const storage = FlutterSecureStorage();
    await prefs.setBool(_biometricEnabledKey, true);
    await storage.write(key: _biometricEmailKey, value: email);
    await storage.write(key: _biometricPasswordKey, value: password);
  }

  /// Disable biometric login
  static Future<void> disable() async {
    final prefs = await SharedPreferences.getInstance();
    const storage = FlutterSecureStorage();
    await prefs.setBool(_biometricEnabledKey, false);
    await storage.delete(key: _biometricEmailKey);
    await storage.delete(key: _biometricPasswordKey);
  }

  /// Authenticate with biometrics and return saved credentials
  static Future<Map<String, String>?> authenticate() async {
    try {
      final didAuth = await _auth.authenticate(
        localizedReason: 'Use sua biometria para entrar no Staggio',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );

      if (didAuth) {
        const storage = FlutterSecureStorage();
        final email = await storage.read(key: _biometricEmailKey);
        final password = await storage.read(key: _biometricPasswordKey);
        if (email != null && password != null) {
          return {'email': email, 'password': password};
        }
      }
    } on PlatformException {
      return null;
    }
    return null;
  }

  /// Show dialog asking user if they want to enable biometrics
  static Future<void> showEnablePrompt(
    BuildContext context, {
    required String email,
    required String password,
  }) async {
    final available = await isAvailable();
    if (!available) return;

    final alreadyShown = await wasPromptShown();
    if (alreadyShown) return;

    await markPromptShown();

    if (!context.mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Theme.of(context).cardColor,
        title: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(Icons.fingerprint, color: Colors.white, size: 24),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Login com Biometria',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        content: Text(
          'Deseja usar sua biometria (impressão digital ou Face ID) para fazer login mais rápido?',
          style: TextStyle(
            fontSize: 14,
            color: Theme.of(context).textTheme.bodyMedium?.color,
            height: 1.5,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Agora não',
              style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              await enable(email, password);
              if (ctx.mounted) Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Ativar'),
          ),
        ],
      ),
    );
  }
}
