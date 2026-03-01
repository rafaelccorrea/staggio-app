import 'package:flutter/material.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';

class AppDrawer extends StatelessWidget {
  final String userName;
  final String userEmail;
  final String userPlan;
  final int aiCredits;
  final bool isGuest;
  final VoidCallback onHomeTap;
  final VoidCallback onPropertiesTap;
  final VoidCallback onStagingTap;
  final VoidCallback onDescriptionTap;
  final VoidCallback onChatTap;
  final VoidCallback onHistoryTap;
  final VoidCallback onPlansTap;
  final VoidCallback onProfileTap;
  final VoidCallback onSettingsTap;
  final VoidCallback onHelpTap;
  final VoidCallback onAboutTap;
  final VoidCallback onLogout;

  const AppDrawer({
    super.key,
    required this.userName,
    required this.userEmail,
    required this.userPlan,
    required this.aiCredits,
    required this.isGuest,
    required this.onHomeTap,
    required this.onPropertiesTap,
    required this.onStagingTap,
    required this.onDescriptionTap,
    required this.onChatTap,
    required this.onHistoryTap,
    required this.onPlansTap,
    required this.onProfileTap,
    required this.onSettingsTap,
    required this.onHelpTap,
    required this.onAboutTap,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topRight: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF6C5CE7),
                    Color(0xFF8B5CF6),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatar
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.3),
                        width: 2,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        userName.isNotEmpty ? userName[0].toUpperCase() : 'S',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    userName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    userEmail,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Plan badge and credits
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Plano $userPlan',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Iconsax.magic_star,
                                color: Colors.white, size: 14),
                            const SizedBox(width: 4),
                            Text(
                              '$aiCredits créditos',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Menu items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _buildSectionTitle(context, 'Principal'),
                  _buildMenuItem(context, icon: Iconsax.home_2,
                    label: 'Início',
                    onTap: onHomeTap,
                  ),
                  if (!isGuest)
                    _buildMenuItem(context, icon: Iconsax.building_4,
                      label: 'Meus Imóveis',
                      onTap: onPropertiesTap,
                    ),

                  if (!isGuest)
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 24),
                      child: Divider(height: 24),
                    ),

                  if (!isGuest) ...
                    [
                      _buildSectionTitle(context, 'Ferramentas IA'),
                      _buildMenuItem(context, icon: Iconsax.brush_1,
                        label: 'Home Staging',
                        onTap: onStagingTap,
                        badge: 'IA',
                      ),
                      _buildMenuItem(context, icon: Iconsax.document_text,
                        label: 'Descrição Automática',
                        onTap: onDescriptionTap,
                        badge: 'IA',
                      ),
                      _buildMenuItem(context, icon: Iconsax.message_text,
                        label: 'Assistente IA',
                        onTap: onChatTap,
                        badge: 'IA',
                      ),
                      _buildMenuItem(context, icon: Iconsax.clock,
                        label: 'Histórico de Gerações',
                        onTap: onHistoryTap,
                      ),
                    ],

                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24),
                    child: Divider(height: 24),
                  ),

                  _buildSectionTitle(context, 'Conta'),
                  _buildMenuItem(context, icon: Iconsax.crown,
                    label: 'Planos e Assinatura',
                    onTap: onPlansTap,
                  ),
                  if (!isGuest)
                    _buildMenuItem(context, icon: Iconsax.user,
                      label: 'Meu Perfil',
                      onTap: onProfileTap,
                    ),
                  if (!isGuest)
                    _buildMenuItem(context, icon: Iconsax.setting_2,
                      label: 'Configurações',
                      onTap: onSettingsTap,
                    ),

                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24),
                    child: Divider(height: 24),
                  ),

                  _buildMenuItem(context, icon: Iconsax.message_question,
                    label: 'Suporte',
                    onTap: onHelpTap,
                    showBadge: true,
                  ),
                  _buildMenuItem(context, icon: Iconsax.info_circle,
                    label: 'Sobre o Staggio',
                    onTap: onAboutTap,
                  ),
                ],
              ),
            ),

            // Logout - Only show for authenticated users
            if (!isGuest)
              Container(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: ListTile(
                  onTap: onLogout,
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Iconsax.logout,
                      color: AppColors.error,
                      size: 20,
                    ),
                  ),
                  title: const Text(
                    'Sair da Conta',
                    style: TextStyle(
                      color: AppColors.error,
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: EdgeInsets.fromLTRB(28, 8, 28, 4),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    String? badge,
    bool showBadge = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 1),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(11),
          ),
          child: Icon(icon, color: AppColors.primary, size: 20),
        ),
        title: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary,
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (badge != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badge,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            if (showBadge)
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.error,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        dense: true,
        visualDensity: const VisualDensity(vertical: -1),
      ),
    );
  }
}
