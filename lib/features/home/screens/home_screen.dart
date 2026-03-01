import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../data/models/user_model.dart';
import '../widgets/ai_tool_card.dart';
import '../widgets/credits_card.dart';
import '../widgets/showcase_section.dart';
import '../../ai/screens/ai_staging_screen.dart';
import '../../ai/screens/ai_description_screen.dart';
import '../../ai/screens/ai_chat_screen.dart';
import '../../ai/screens/ai_terrain_screen.dart';
import '../../ai/screens/ai_photo_enhance_screen.dart';
import '../../ai/screens/generations_history_screen.dart';
import '../../../core/services/plan_gating.dart';
import '../../video/screens/video_generation_screen.dart';


class HomeScreen extends StatefulWidget {
  final UserModel user;

  const HomeScreen({super.key, required this.user});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // Videos are preloaded in SplashScreen - no need to preload again here

  ApiClient get _apiClient => ApiClient();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Row(
                  children: [
                    // Menu button - opens drawer
                    GestureDetector(
                      onTap: () => Scaffold.of(context).openDrawer(),
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Icon(Iconsax.menu_1, size: 22),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Avatar
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: Text(
                          widget.user.name.isNotEmpty ? widget.user.name[0].toUpperCase() : 'S',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ).animate().fadeIn(duration: 500.ms).scale(
                          begin: const Offset(0.5, 0.5),
                          curve: Curves.elasticOut,
                          duration: 800.ms,
                        ),

                    SizedBox(width: 12),

                    // Greeting
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Olá, ${widget.user.name.split(' ').first}! 👋',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            'Plano ${widget.user.planDisplayName}',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.primary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(delay: 100.ms, duration: 500.ms),

                    // Notifications
                    GestureDetector(
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Nenhuma notificação no momento'),
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        );
                      },
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Stack(
                          children: [
                            Center(
                              child: Icon(Iconsax.notification, size: 22, color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary),
                            ),
                            Positioned(
                              top: 10,
                              right: 12,
                              child: Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: AppColors.error,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 1.5),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ).animate().fadeIn(delay: 200.ms, duration: 500.ms),
                  ],
                ),
              ),
            ),

            // Credits Card
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: CreditsCard(user: widget.user)
                    .animate()
                    .fadeIn(delay: 300.ms, duration: 600.ms)
                    .slideY(begin: 0.2),
              ),
            ),

            // Showcase Section - Before/After Examples (MOVED TO TOP)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(top: 24),
                child: const ShowcaseSection()
                    .animate()
                    .fadeIn(delay: 350.ms, duration: 600.ms),
              ),
            ),

            // AI Assistant Banner
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => AiChatScreen(apiClient: _apiClient),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(Iconsax.message_text, color: Colors.white, size: 24),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Assistente IA',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                'Tire dúvidas sobre imóveis e vendas',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Iconsax.arrow_right_3, color: Colors.white70, size: 20),
                      ],
                    ),
                  ),
                ).animate().fadeIn(delay: 350.ms, duration: 500.ms).slideY(begin: 0.1),
              ),
            ),

            // AI Tools Section Title
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(20, 24, 20, 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Ferramentas de IA',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary,
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => GenerationsHistoryScreen(apiClient: _apiClient),
                          ),
                        );
                      },
                      child: Text(
                        'Ver histórico',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ).animate().fadeIn(delay: 400.ms),
              ),
            ),

            // AI Tools Grid
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 0.92,
                ),
                delegate: SliverChildListDelegate([
                  AiToolCard(
                    title: 'Home\nStaging',
                    subtitle: 'Decore ambientes',
                    icon: Iconsax.brush_1,
                    gradient: AppColors.stagingGradient,
                    featureKey: 'staging',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => AiStagingScreen(apiClient: _apiClient),
                        ),
                      );
                    },
                  ).animate().fadeIn(delay: 100.ms, duration: 300.ms).scale(begin: const Offset(0.9, 0.9)),
                  AiToolCard(
                    title: 'Visão de\nTerreno',
                    subtitle: 'Visualize construções',
                    icon: Iconsax.building_4,
                    gradient: AppColors.terrainGradient,
                    featureKey: 'terrain_vision',
                    onTap: () {
                      if (!PlanGating.hasAccess(widget.user, 'terrain_vision')) {
                        PlanGating.showUpgradeDialog(context, 'Visão de Terreno');
                        return;
                      }
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => AiTerrainScreen(apiClient: _apiClient),
                        ),
                      );
                    },
                  ).animate().fadeIn(delay: 150.ms, duration: 300.ms).scale(begin: const Offset(0.9, 0.9)),
                  AiToolCard(
                    title: 'Descrição\nIA',
                    subtitle: 'Textos profissionais',
                    icon: Iconsax.document_text,
                    gradient: AppColors.primaryGradient,
                    featureKey: 'description',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => AiDescriptionScreen(apiClient: _apiClient),
                        ),
                      );
                    },
                  ).animate().fadeIn(delay: 200.ms, duration: 300.ms).scale(begin: const Offset(0.9, 0.9)),
                  AiToolCard(
                    title: 'Melhorar\nFoto',
                    subtitle: 'Fotos profissionais',
                    icon: Iconsax.camera,
                    gradient: AppColors.cardGradient,
                    featureKey: 'photo_enhance',
                    onTap: () {
                      if (!PlanGating.hasAccess(widget.user, 'photo_enhance')) {
                        PlanGating.showUpgradeDialog(context, 'Melhorar Foto');
                        return;
                      }
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => AiPhotoEnhanceScreen(apiClient: _apiClient),
                        ),
                      );
                    },
                  ).animate().fadeIn(delay: 250.ms, duration: 300.ms).scale(begin: const Offset(0.9, 0.9)),
                  AiToolCard(
                    title: 'Vídeo\nCinema',
                    subtitle: 'Vídeos profissionais',
                    icon: Iconsax.video,
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    featureKey: 'video_generation',
                    onTap: () {
                      if (!PlanGating.hasAccess(widget.user, 'video_generation')) {
                        PlanGating.showUpgradeDialog(context, 'Vídeo Cinematográfico');
                        return;
                      }
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => VideoGenerationScreen(apiClient: _apiClient),
                        ),
                      );
                    },
                  ).animate().fadeIn(delay: 300.ms, duration: 300.ms).scale(begin: const Offset(0.9, 0.9)),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
