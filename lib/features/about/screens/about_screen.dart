import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../../core/theme/app_theme.dart';

class AboutScreen extends StatefulWidget {
  AboutScreen({super.key});

  @override
  State<AboutScreen> createState() => _AboutScreenState();
}

class _AboutScreenState extends State<AboutScreen> {
  String _appVersion = '1.0.0';

  @override
  void initState() {
    super.initState();
    _loadVersion();
  }

  Future<void> _loadVersion() async {
    try {
      final info = await PackageInfo.fromPlatform();
      if (mounted) {
        setState(() => _appVersion = '${info.version}+${info.buildNumber}');
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Sobre'),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const SizedBox(height: 20),

          // Logo
          Center(
            child: Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(Iconsax.magic_star, size: 44, color: Colors.white),
            ),
          ).animate().fadeIn(duration: 600.ms).scale(
                begin: const Offset(0.5, 0.5),
                curve: Curves.elasticOut,
                duration: 1000.ms,
              ),

          const SizedBox(height: 20),

          Center(
            child: Text(
              'Staggio',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w700,
                color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary,
              ),
            ),
          ).animate().fadeIn(delay: 200.ms),

          SizedBox(height: 4),

          Center(
            child: Text(
              'Versão $_appVersion',
              style: TextStyle(
                fontSize: 14,
                color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
              ),
            ),
          ).animate().fadeIn(delay: 300.ms),

          const SizedBox(height: 8),

          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'IA para Corretores de Imóveis',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ).animate().fadeIn(delay: 400.ms),

          const SizedBox(height: 32),

          // Description
          Container(
            padding: EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 12,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Sobre o Staggio',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary,
                  ),
                ),
                SizedBox(height: 12),
                Text(
                  'O Staggio é a plataforma de inteligência artificial mais avançada para corretores de imóveis. '
                  'Com nossas ferramentas de IA, você pode transformar imóveis vazios em ambientes decorados, '
                  'gerar descrições profissionais, visualizar projetos em terrenos e muito mais.\n\n'
                  'Nossa missão é empoderar corretores com tecnologia de ponta para vender mais e melhor.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary,
                    height: 1.6,
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(delay: 500.ms, duration: 500.ms).slideY(begin: 0.1),

          const SizedBox(height: 16),

          // Stats
          Container(
            padding: EdgeInsets.all(20),
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
            child: Row(
              children: [
                _buildStat('10K+', 'Corretores'),
                _buildDivider(),
                _buildStat('500K+', 'Gerações IA'),
                _buildDivider(),
                _buildStat('4.9', 'Avaliação'),
              ],
            ),
          ).animate().fadeIn(delay: 600.ms, duration: 500.ms).slideY(begin: 0.1),

          SizedBox(height: 16),

          // Legal
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
              children: [
                ListTile(
                  onTap: () async {
                    final uri = Uri.parse('https://staggio.app/privacidade');
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                  leading: Icon(Iconsax.shield_tick, color: AppColors.primary),
                  title: const Text('Política de Privacidade', style: TextStyle(fontSize: 15)),
                  trailing: Icon(Iconsax.arrow_right_3, size: 18, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary),
                ),
                Divider(height: 1, indent: 64, color: Theme.of(context).dividerColor),
                ListTile(
                  onTap: () async {
                    final uri = Uri.parse('https://staggio.app/termos');
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                  leading: Icon(Iconsax.document, color: AppColors.primary),
                  title: const Text('Termos de Uso', style: TextStyle(fontSize: 15)),
                  trailing: Icon(Iconsax.arrow_right_3, size: 18, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary),
                ),
                Divider(height: 1, indent: 64, color: Theme.of(context).dividerColor),
                ListTile(
                  onTap: () {
                    showLicensePage(
                      context: context,
                      applicationName: 'Staggio',
                      applicationVersion: _appVersion,
                    );
                  },
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                  leading: Icon(Iconsax.code, color: AppColors.primary),
                  title: const Text('Licenças Open Source', style: TextStyle(fontSize: 15)),
                  trailing: Icon(Iconsax.arrow_right_3, size: 18, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary),
                ),
              ],
            ),
          ).animate().fadeIn(delay: 700.ms, duration: 500.ms).slideY(begin: 0.1),

          SizedBox(height: 32),

          Center(
            child: Text(
              '© 2026 Staggio. Todos os direitos reservados.',
              style: TextStyle(
                color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
                fontSize: 12,
              ),
            ),
          ),

          SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildStat(String value, String label) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
          SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      width: 1,
      height: 36,
      color: Theme.of(context).dividerColor,
    );
  }
}
