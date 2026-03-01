import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../data/models/user_model.dart';
import '../../home/screens/home_screen.dart';
import '../../properties/screens/properties_screen.dart';
import '../../ai/screens/ai_chat_screen.dart';
import '../../ai/screens/ai_staging_screen.dart';
import '../../ai/screens/ai_description_screen.dart';
import '../../ai/screens/generations_history_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../../subscription/screens/plans_screen.dart';
import '../../settings/screens/settings_screen.dart';
import '../../help/screens/help_screen.dart';
import '../../about/screens/about_screen.dart';
import '../widgets/app_drawer.dart';
import '../../ai/screens/ai_terrain_screen.dart';
import '../../ai/screens/ai_photo_enhance_screen.dart';
import '../../../core/services/plan_gating.dart';
import '../../../core/services/auth_gate.dart';

class AppShell extends StatefulWidget {
  final UserModel user;
  final ApiClient apiClient;

  const AppShell({super.key, required this.user, required this.apiClient});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      HomeScreen(user: widget.user),
      PropertiesScreen(apiClient: widget.apiClient),
      AiChatScreen(apiClient: widget.apiClient),
      ProfileScreen(user: widget.user),
    ];
  }

  void _navigateToScreen(Widget screen) {
    Navigator.of(context).pop(); // close drawer
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => screen),
    );
  }

  void _switchTab(int index) {
    Navigator.of(context).pop(); // close drawer
    setState(() => _currentIndex = index);
  }

  void _handleLogout() {
    Navigator.of(context).pop(); // close drawer
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
              Navigator.pop(ctx);
              // Navigate back to login
              Navigator.of(context).popUntil((route) => route.isFirst);
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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      drawer: AppDrawer(
        userName: widget.user.name,
        userEmail: widget.user.email,
        userPlan: widget.user.planDisplayName,
        aiCredits: widget.user.aiCreditsRemaining,
        onHomeTap: () => _switchTab(0),
        onPropertiesTap: () => _switchTab(1),
        onStagingTap: () => _navigateToScreen(
          AiStagingScreen(apiClient: widget.apiClient),
        ),
        onDescriptionTap: () => _navigateToScreen(
          AiDescriptionScreen(apiClient: widget.apiClient),
        ),
        onChatTap: () {
          Navigator.of(context).pop();
          setState(() => _currentIndex = 2);
        },
        onHistoryTap: () => _navigateToScreen(
          GenerationsHistoryScreen(apiClient: widget.apiClient),
        ),
        onPlansTap: () => _navigateToScreen(PlansScreen()),
        onProfileTap: () {
          Navigator.of(context).pop();
          setState(() => _currentIndex = 3);
        },
        onSettingsTap: () => _navigateToScreen(SettingsScreen()),
        onHelpTap: () => _navigateToScreen(HelpScreen()),
        onAboutTap: () => _navigateToScreen(AboutScreen()),
        onLogout: _handleLogout,
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Iconsax.home_2, 'Home'),
                _buildNavItem(1, Iconsax.building_4, 'Imóveis'),
                _buildCenterButton(),
                _buildNavItem(2, Iconsax.message_text, 'Chat IA'),
                _buildNavItem(3, Iconsax.user, 'Perfil'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isSelected = _currentIndex == index;

    return GestureDetector(
      onTap: () {
        // Tabs 1 (Imóveis), 2 (Chat IA), 3 (Perfil) require login
        if (index > 0 && !AuthGate.check(context, widget.user)) return;
        setState(() => _currentIndex = index);
      },
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 64,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary.withValues(alpha: 0.1)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: isSelected ? AppColors.primary : AppColors.textTertiary,
                size: 24,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected ? AppColors.primary : AppColors.textTertiary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCenterButton() {
    return GestureDetector(
      onTap: () {
        _showAiToolsSheet(context);
      },
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          gradient: AppColors.primaryGradient,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.4),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Icon(
          Iconsax.magic_star,
          color: Colors.white,
          size: 28,
        ),
      ).animate(onPlay: (c) => c.repeat(reverse: true)).shimmer(
            delay: 2000.ms,
            duration: 1500.ms,
            color: Colors.white.withValues(alpha: 0.3),
          ),
    );
  }

  void _showAiToolsSheet(BuildContext context) {
    if (!AuthGate.check(context, widget.user)) return;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Theme.of(context).dividerColor,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            SizedBox(height: 20),
            Text(
              'Ferramentas de IA',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 20),
            _buildAiToolItem(
              context,
              icon: Iconsax.brush_1,
              title: 'Home Staging',
              subtitle: 'Decore ambientes vazios',
              gradient: AppColors.stagingGradient,
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => AiStagingScreen(apiClient: widget.apiClient),
                  ),
                );
              },
            ),
            _buildAiToolItem(
              context,
              icon: Iconsax.building_4,
              title: 'Visão de Terreno',
              subtitle: 'Visualize construções',
              gradient: AppColors.terrainGradient,
              onTap: () {
                Navigator.pop(ctx);
                if (!PlanGating.hasAccess(widget.user, 'terrain_vision')) {
                  PlanGating.showUpgradeDialog(context, 'Visão de Terreno');
                  return;
                }
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => AiTerrainScreen(apiClient: widget.apiClient),
                  ),
                );
              },
            ),
            _buildAiToolItem(
              context,
              icon: Iconsax.document_text,
              title: 'Descrição IA',
              subtitle: 'Gere textos profissionais',
              gradient: AppColors.primaryGradient,
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => AiDescriptionScreen(apiClient: widget.apiClient),
                  ),
                );
              },
            ),
            _buildAiToolItem(
              context,
              icon: Iconsax.camera,
              title: 'Melhorar Foto',
              subtitle: 'Fotos profissionais com IA',
              gradient: AppColors.cardGradient,
              onTap: () {
                Navigator.pop(ctx);
                if (!PlanGating.hasAccess(widget.user, 'photo_enhance')) {
                  PlanGating.showUpgradeDialog(context, 'Melhorar Foto');
                  return;
                }
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => AiPhotoEnhanceScreen(apiClient: widget.apiClient),
                  ),
                );
              },
            ),
            _buildAiToolItem(
              context,
              icon: Iconsax.clock,
              title: 'Histórico',
              subtitle: 'Veja suas gerações anteriores',
              gradient: const LinearGradient(
                colors: [Color(0xFF6C5CE7), Color(0xFF8B5CF6)],
              ),
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => GenerationsHistoryScreen(apiClient: widget.apiClient),
                  ),
                );
              },
            ),
            SizedBox(height: MediaQuery.of(context).padding.bottom),
          ],
        ),
      ),
    );
  }

  Widget _buildAiToolItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required LinearGradient gradient,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).dividerColor.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: gradient,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: Colors.white, size: 24),
            ),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 13,
                      color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Iconsax.arrow_right_3, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary, size: 18),
          ],
        ),
      ),
    );
  }
}
