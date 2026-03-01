import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../data/models/user_model.dart';
import '../../auth/bloc/auth_bloc.dart';
import '../../auth/bloc/auth_event.dart';
import '../../subscription/screens/plans_screen.dart';
import '../../ai/screens/generations_history_screen.dart';
import '../../settings/screens/settings_screen.dart';
import '../../help/screens/help_screen.dart';
import '../../about/screens/about_screen.dart';
import 'edit_profile_screen.dart';
import '../../subscription/screens/buy_credits_screen.dart';
import '../../subscription/screens/features_screen.dart';

class ProfileScreen extends StatelessWidget {
  final UserModel user;

  ProfileScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          physics: const BouncingScrollPhysics(),
          children: [
            const SizedBox(height: 8),

            // Profile Header
            Center(
              child: Column(
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.3),
                          blurRadius: 16,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        user.name.isNotEmpty ? user.name[0].toUpperCase() : 'S',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 36,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ).animate().fadeIn(duration: 500.ms).scale(
                        begin: const Offset(0.5, 0.5),
                        curve: Curves.elasticOut,
                        duration: 1000.ms,
                      ),

                  SizedBox(height: 16),

                  Text(
                    user.name,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary,
                    ),
                  ).animate().fadeIn(delay: 200.ms),

                  SizedBox(height: 4),

                  Text(
                    user.email,
                    style: TextStyle(fontSize: 14, color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary),
                  ).animate().fadeIn(delay: 300.ms),

                  const SizedBox(height: 8),

                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Plano ${user.planDisplayName}',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ).animate().fadeIn(delay: 400.ms),
                ],
              ),
            ),

            SizedBox(height: 28),

            // Stats Row
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
                  _buildStatItem('${user.totalProperties}', 'Imóveis', AppColors.primary),
                  Container(width: 1, height: 36, color: Theme.of(context).dividerColor),
                  _buildStatItem('${user.totalGenerations}', 'Gerações', AppColors.secondary),
                  Container(width: 1, height: 36, color: Theme.of(context).dividerColor),
                  _buildStatItem('${user.aiCreditsRemaining}', 'Créditos', AppColors.success),
                ],
              ),
            ).animate().fadeIn(delay: 500.ms, duration: 500.ms).slideY(begin: 0.1),

            SizedBox(height: 20),

            // Account Section
            Text(
              'CONTA',
              style: TextStyle(
                color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
              ),
            ).animate().fadeIn(delay: 600.ms),

            SizedBox(height: 10),

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
                  _buildMenuItem(
                    context,
                    icon: Iconsax.user_edit,
                    title: 'Editar Perfil',
                    subtitle: 'Nome, email, foto',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => EditProfileScreen(user: user)),
                      );
                    },
                  ),
                  Divider(height: 1, indent: 72, color: Theme.of(context).dividerColor),
                  _buildMenuItem(
                    context,
                    icon: Iconsax.crown_1,
                    title: 'Meu Plano',
                    subtitle: 'Plano ${user.planDisplayName}',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => PlansScreen()),
                      );
                    },
                  ),
                  Divider(height: 1, indent: 72, color: Theme.of(context).dividerColor),
                  _buildMenuItem(
                    context,
                    icon: Iconsax.info_circle,
                    title: 'Recursos do Plano',
                    subtitle: 'Veja o que você pode fazer',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => FeaturesScreen(user: user)),
                      );
                    },
                  ),
                  Divider(height: 1, indent: 72, color: Theme.of(context).dividerColor),
                  _buildMenuItem(
                    context,
                    icon: Iconsax.flash_circle,
                    title: 'Comprar Créditos',
                    subtitle: 'Créditos extras avulsos',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => BuyCreditsScreen()),
                      );
                    },
                  ),
                  Divider(height: 1, indent: 72, color: Theme.of(context).dividerColor),
                  _buildMenuItem(
                    context,
                    icon: Iconsax.clock,
                    title: 'Histórico de Gerações',
                    subtitle: '${user.totalGenerations} gerações realizadas',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => GenerationsHistoryScreen(
                            apiClient: ApiClient(),
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ).animate().fadeIn(delay: 700.ms, duration: 500.ms).slideY(begin: 0.1),

            SizedBox(height: 20),

            // General Section
            Text(
              'GERAL',
              style: TextStyle(
                color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
              ),
            ).animate().fadeIn(delay: 800.ms),

            SizedBox(height: 10),

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
                  _buildMenuItem(
                    context,
                    icon: Iconsax.setting_2,
                    title: 'Configurações',
                    subtitle: 'Notificações, idioma, tema',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => SettingsScreen()),
                      );
                    },
                  ),
                  Divider(height: 1, indent: 72, color: Theme.of(context).dividerColor),
                  _buildMenuItem(
                    context,
                    icon: Iconsax.message_question,
                    title: 'Suporte',
                    subtitle: 'FAQ, contato, ajuda',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => HelpScreen()),
                      );
                    },
                  ),
                  Divider(height: 1, indent: 72, color: Theme.of(context).dividerColor),
                  _buildMenuItem(
                    context,
                    icon: Iconsax.info_circle,
                    title: 'Sobre o Staggio',
                    subtitle: 'Versão 1.0.0',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => AboutScreen()),
                      );
                    },
                  ),
                ],
              ),
            ).animate().fadeIn(delay: 900.ms, duration: 500.ms).slideY(begin: 0.1),

            const SizedBox(height: 20),

            // Logout
            GestureDetector(
              onTap: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    title: const Text('Sair da Conta'),
                    content: const Text('Tem certeza que deseja sair?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Cancelar'),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pop(ctx); // close dialog
                          // Emit logout event - navigation handled by BlocListener in main.dart
                          context.read<AuthBloc>().add(AuthLogoutRequested());
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.error,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Sair'),
                      ),
                    ],
                  ),
                );
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.error.withValues(alpha: 0.15)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Iconsax.logout, color: AppColors.error, size: 22),
                    const SizedBox(width: 10),
                    Text(
                      'Sair da Conta',
                      style: TextStyle(
                        color: AppColors.error,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ).animate().fadeIn(delay: 1000.ms, duration: 500.ms),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String value, String label, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: color),
          ),
          SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(fontSize: 12, color: AppColors.textTertiary),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Icon(icon, color: AppColors.primary, size: 22),
      ),
      title: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: TextStyle(fontSize: 12, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary)),
      trailing: Icon(Iconsax.arrow_right_3, size: 18, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary),
    );
  }
}
