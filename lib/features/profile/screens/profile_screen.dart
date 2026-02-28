import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/user_model.dart';
import '../../auth/bloc/auth_bloc.dart';
import '../../auth/bloc/auth_event.dart';

class ProfileScreen extends StatelessWidget {
  final UserModel user;

  const ProfileScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 20),

              // Avatar
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(32),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'S',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 40,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ).animate().fadeIn(duration: 500.ms).scale(
                    begin: const Offset(0.5, 0.5),
                    curve: Curves.elasticOut,
                    duration: 800.ms,
                  ),

              const SizedBox(height: 16),

              Text(
                user.name,
                style: Theme.of(context).textTheme.headlineMedium,
              ).animate().fadeIn(delay: 200.ms, duration: 500.ms),

              Text(
                user.email,
                style: Theme.of(context).textTheme.bodyMedium,
              ).animate().fadeIn(delay: 300.ms, duration: 500.ms),

              const SizedBox(height: 8),

              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Plano ${user.planDisplayName}',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ).animate().fadeIn(delay: 400.ms, duration: 500.ms),

              const SizedBox(height: 32),

              // Menu items
              _buildMenuItem(
                context,
                icon: Iconsax.user_edit,
                title: 'Editar Perfil',
                onTap: () {},
              ).animate().fadeIn(delay: 500.ms, duration: 400.ms).slideX(begin: -0.1),

              _buildMenuItem(
                context,
                icon: Iconsax.crown,
                title: 'Meu Plano',
                subtitle: user.planDisplayName,
                onTap: () {},
              ).animate().fadeIn(delay: 600.ms, duration: 400.ms).slideX(begin: -0.1),

              _buildMenuItem(
                context,
                icon: Iconsax.magic_star,
                title: 'Histórico de Gerações',
                onTap: () {},
              ).animate().fadeIn(delay: 700.ms, duration: 400.ms).slideX(begin: -0.1),

              _buildMenuItem(
                context,
                icon: Iconsax.setting_2,
                title: 'Configurações',
                onTap: () {},
              ).animate().fadeIn(delay: 800.ms, duration: 400.ms).slideX(begin: -0.1),

              _buildMenuItem(
                context,
                icon: Iconsax.message_question,
                title: 'Ajuda e Suporte',
                onTap: () {},
              ).animate().fadeIn(delay: 900.ms, duration: 400.ms).slideX(begin: -0.1),

              _buildMenuItem(
                context,
                icon: Iconsax.info_circle,
                title: 'Sobre o Staggio',
                onTap: () {},
              ).animate().fadeIn(delay: 1000.ms, duration: 400.ms).slideX(begin: -0.1),

              const SizedBox(height: 16),

              // Logout
              SizedBox(
                width: double.infinity,
                height: 52,
                child: OutlinedButton.icon(
                  onPressed: () {
                    context.read<AuthBloc>().add(AuthLogoutRequested());
                  },
                  icon: const Icon(Iconsax.logout, color: AppColors.error),
                  label: const Text(
                    'Sair da Conta',
                    style: TextStyle(color: AppColors.error),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.error),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ).animate().fadeIn(delay: 1100.ms, duration: 400.ms),

              const SizedBox(height: 32),

              Text(
                'Staggio v1.0.0',
                style: TextStyle(
                  color: AppColors.textTertiary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: AppColors.textSecondary, size: 22),
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w500,
          ),
        ),
        subtitle: subtitle != null
            ? Text(subtitle, style: const TextStyle(fontSize: 12))
            : null,
        trailing: const Icon(
          Iconsax.arrow_right_3,
          color: AppColors.textTertiary,
          size: 18,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 4),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}
