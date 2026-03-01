import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../../core/theme/app_theme.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _darkMode = false;
  bool _biometricAuth = false;
  String _language = 'Português';
  String _appVersion = '1.0.0';

  @override
  void initState() {
    super.initState();
    _loadSettings();
    _loadAppVersion();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() {
        _notificationsEnabled = prefs.getBool('notifications_enabled') ?? true;
        _darkMode = prefs.getBool('dark_mode') ?? false;
        _biometricAuth = prefs.getBool('biometric_auth') ?? false;
        _language = prefs.getString('language') ?? 'Português';
      });
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

  @override
  Widget build(BuildContext context) {
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
                icon: Iconsax.moon,
                title: 'Modo Escuro',
                subtitle: 'Tema escuro do aplicativo',
                value: _darkMode,
                onChanged: (v) {
                  setState(() => _darkMode = v);
                  _saveSetting('dark_mode', v);
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
                subtitle: 'Login com digital ou Face ID',
                value: _biometricAuth,
                onChanged: (v) {
                  setState(() => _biometricAuth = v);
                  _saveSetting('biometric_auth', v);
                },
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
                  final biometric = prefs.getBool('biometric_auth');
                  final language = prefs.getString('language');
                  await prefs.clear();
                  // Restore settings
                  if (notifications != null) await prefs.setBool('notifications_enabled', notifications);
                  if (darkMode != null) await prefs.setBool('dark_mode', darkMode);
                  if (biometric != null) await prefs.setBool('biometric_auth', biometric);
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
    required ValueChanged<bool> onChanged,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
      subtitle: Text(subtitle, style: TextStyle(fontSize: 12, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary)),
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
            color: isDestructive ? AppColors.error : AppColors.primary, size: 20),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: isDestructive ? AppColors.error : AppColors.textPrimary,
        ),
      ),
      subtitle: Text(subtitle, style: TextStyle(fontSize: 12, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary)),
      trailing: Icon(Iconsax.arrow_right_3,
          size: 18, color: isDestructive ? AppColors.error : AppColors.textTertiary),
    );
  }

  void _showLanguageDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
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
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
        title: const Text('Excluir Conta'),
        content: const Text(
          'Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
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
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );
  }
}
