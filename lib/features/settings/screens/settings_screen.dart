import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/contexts/theme_context.dart';
import '../../../core/services/biometric_service.dart';
import '../../auth/bloc/auth_bloc.dart';
import '../../auth/bloc/auth_state.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _biometricAuth = false;
  bool _biometricAvailable = false;
  String _language = 'Português';
  String _appVersion = '1.0.0';

  @override
  void initState() {
    super.initState();
    _loadSettings();
    _loadAppVersion();
    _checkBiometricAvailability();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final biometricEnabled = await BiometricService.isEnabled();
    if (mounted) {
      setState(() {
        _notificationsEnabled = prefs.getBool('notifications_enabled') ?? true;
        _biometricAuth = biometricEnabled;
        _language = prefs.getString('language') ?? 'Português';
      });
    }
  }

  Future<void> _checkBiometricAvailability() async {
    final available = await BiometricService.isAvailable();
    if (mounted) {
      setState(() => _biometricAvailable = available);
    }
  }

  Future<void> _saveSetting(String key, dynamic value) async {
    final prefs = await SharedPreferences.getInstance();
    if (value is bool) {
      await prefs.setBool(key, value);
    } else if (value is String) {
      await prefs.setString(key, value);
    }
  }

  Future<void> _loadAppVersion() async {
    try {
      final info = await PackageInfo.fromPlatform();
      if (mounted) {
        setState(() {
          _appVersion = '${info.version}+${info.buildNumber}';
        });
      }
    } catch (_) {}
  }

  Future<void> _toggleBiometric(bool enable) async {
    if (enable) {
      // Check if user is authenticated
      final authState = context.read<AuthBloc>().state;
      if (authState is! AuthAuthenticated) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Faça login primeiro para ativar a biometria'),
              backgroundColor: AppColors.warning,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
        return;
      }

      if (!_biometricAvailable) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Biometria não disponível neste dispositivo'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
        return;
      }

      // Try to authenticate first to verify biometric works
      try {
        final credentials = await BiometricService.authenticate();
        if (credentials != null) {
          // Already has saved credentials, just enable
          await BiometricService.enable(credentials['email']!, credentials['password']!);
          if (mounted) {
            setState(() => _biometricAuth = true);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('Biometria ativada com sucesso!'),
                backgroundColor: AppColors.success,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            );
          }
        } else {
          // No saved credentials - inform user to login with password first
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('Faça login com email e senha primeiro para configurar a biometria'),
                backgroundColor: AppColors.warning,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Erro ao configurar biometria. Tente novamente.'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
      }
    } else {
      // Disable biometric
      await BiometricService.disable();
      if (mounted) {
        setState(() => _biometricAuth = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Biometria desativada'),
            backgroundColor: AppColors.primary,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Read dark mode state from ThemeProvider (real-time)
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDarkMode = themeProvider.isDarkMode;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Configurações'),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildSection(
            'Geral',
            [
              _buildSwitchTile(
                icon: Iconsax.notification,
                title: 'Notificações',
                subtitle: 'Receber alertas e atualizações',
                value: _notificationsEnabled,
                onChanged: (v) {
                  setState(() => _notificationsEnabled = v);
                  _saveSetting('notifications_enabled', v);
                },
              ),
              _buildSwitchTile(
                icon: isDarkMode ? Iconsax.moon : Iconsax.sun_1,
                title: 'Modo Escuro',
                subtitle: isDarkMode ? 'Tema escuro ativado' : 'Tema claro ativado',
                value: isDarkMode,
                onChanged: (v) {
                  // Use ThemeProvider for real-time theme switching
                  themeProvider.setDarkMode(v);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(v ? 'Modo escuro ativado' : 'Modo claro ativado'),
                      behavior: SnackBarBehavior.floating,
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  );
                },
              ),
              _buildSwitchTile(
                icon: Iconsax.finger_scan,
                title: 'Autenticação Biométrica',
                subtitle: _biometricAvailable
                    ? 'Login com digital ou Face ID'
                    : 'Biometria não disponível neste dispositivo',
                value: _biometricAuth,
                onChanged: _biometricAvailable ? _toggleBiometric : null,
              ),
            ],
          ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.1),

          const SizedBox(height: 20),

          _buildSection(
            'Preferências',
            [
              _buildTapTile(
                icon: Iconsax.language_square,
                title: 'Idioma',
                subtitle: _language,
                onTap: () => _showLanguageDialog(),
              ),
              _buildTapTile(
                icon: Iconsax.trash,
                title: 'Limpar Cache',
                subtitle: 'Liberar espaço de armazenamento',
                onTap: () async {
                  final prefs = await SharedPreferences.getInstance();
                  // Keep settings but clear cached data
                  final notifications = prefs.getBool('notifications_enabled');
                  final darkMode = prefs.getBool('dark_mode');
                  final biometricEnabled = await BiometricService.isEnabled();
                  final language = prefs.getString('language');
                  await prefs.clear();
                  // Restore settings
                  if (notifications != null) await prefs.setBool('notifications_enabled', notifications);
                  if (darkMode != null) await prefs.setBool('dark_mode', darkMode);
                  if (biometricEnabled) await prefs.setBool('biometric_enabled', true);
                  if (language != null) await prefs.setString('language', language);

                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Cache limpo com sucesso!'),
                        behavior: SnackBarBehavior.floating,
                        backgroundColor: AppColors.success,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    );
                  }
                },
              ),
            ],
          ).animate().fadeIn(delay: 200.ms, duration: 500.ms).slideY(begin: 0.1),

          const SizedBox(height: 20),

          _buildSection(
            'Conta',
            [
              _buildTapTile(
                icon: Iconsax.shield_tick,
                title: 'Privacidade',
                subtitle: 'Política de privacidade',
                onTap: () async {
                  final uri = Uri.parse('https://staggio.app/privacidade');
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  }
                },
              ),
              _buildTapTile(
                icon: Iconsax.document,
                title: 'Termos de Uso',
                subtitle: 'Termos e condições',
                onTap: () async {
                  final uri = Uri.parse('https://staggio.app/termos');
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  }
                },
              ),
              _buildTapTile(
                icon: Iconsax.profile_delete,
                title: 'Excluir Conta',
                subtitle: 'Remover permanentemente sua conta',
                isDestructive: true,
                onTap: () => _showDeleteAccountDialog(),
              ),
            ],
          ).animate().fadeIn(delay: 400.ms, duration: 500.ms).slideY(begin: 0.1),

          const SizedBox(height: 32),

          Center(
            child: Text(
              'Staggio v$_appVersion',
              style: TextStyle(
                color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 12),
          child: Text(
            title.toUpperCase(),
            style: TextStyle(
              color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildSwitchTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool>? onChanged,
  }) {
    final isDisabled = onChanged == null;

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: isDisabled
              ? Colors.grey.withValues(alpha: 0.08)
              : AppColors.primary.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon,
            color: isDisabled ? Colors.grey : AppColors.primary, size: 20),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: isDisabled
              ? AppColors.adaptiveTextTertiary(context)
              : AppColors.adaptiveTextPrimary(context),
        ),
      ),
      subtitle: Text(subtitle,
          style: TextStyle(
              fontSize: 12,
              color: Theme.of(context).textTheme.bodySmall?.color ??
                  AppColors.textTertiary)),
      trailing: Switch.adaptive(
        value: value,
        onChanged: onChanged,
        activeColor: AppColors.primary,
      ),
    );
  }

  Widget _buildTapTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      onTap: onTap,
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: isDestructive
              ? AppColors.error.withValues(alpha: 0.08)
              : AppColors.primary.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon,
            color: isDestructive ? AppColors.error : AppColors.primary,
            size: 20),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: isDestructive
              ? AppColors.error
              : AppColors.adaptiveTextPrimary(context),
        ),
      ),
      subtitle: Text(subtitle,
          style: TextStyle(
              fontSize: 12,
              color: Theme.of(context).textTheme.bodySmall?.color ??
                  AppColors.textTertiary)),
      trailing: Icon(Iconsax.arrow_right_3,
          size: 18,
          color: isDestructive
              ? AppColors.error
              : AppColors.adaptiveTextTertiary(context)),
    );
  }

  void _showLanguageDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Theme.of(context).cardColor,
        title: const Text('Idioma'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: ['Português', 'English', 'Español'].map((lang) {
            return RadioListTile<String>(
              value: lang,
              groupValue: _language,
              onChanged: (v) {
                setState(() => _language = v!);
                _saveSetting('language', v!);
                Navigator.pop(ctx);
              },
              title: Text(lang),
              activeColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            );
          }).toList(),
        ),
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Theme.of(context).cardColor,
        title: const Text('Excluir Conta'),
        content: const Text(
          'Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancelar',
                style: TextStyle(
                    color: Theme.of(context).textTheme.bodyMedium?.color)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('Solicitação de exclusão enviada'),
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );
  }
}
