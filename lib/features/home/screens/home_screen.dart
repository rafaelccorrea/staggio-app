import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/user_model.dart';
import '../widgets/ai_tool_card.dart';
import '../widgets/credits_card.dart';
import '../widgets/quick_stats_card.dart';

class HomeScreen extends StatelessWidget {
  final UserModel user;

  const HomeScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
                child: Row(
                  children: [
                    // Avatar
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Center(
                        child: Text(
                          user.name.isNotEmpty ? user.name[0].toUpperCase() : 'S',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ).animate().fadeIn(duration: 500.ms).scale(
                          begin: const Offset(0.5, 0.5),
                          curve: Curves.elasticOut,
                          duration: 800.ms,
                        ),

                    const SizedBox(width: 14),

                    // Greeting
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Olá, ${user.name.split(' ').first}!',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          Text(
                            'Plano ${user.planDisplayName}',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w500,
                                ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(delay: 100.ms, duration: 500.ms),

                    // Notifications
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(
                        Iconsax.notification,
                        color: AppColors.textSecondary,
                      ),
                    ).animate().fadeIn(delay: 200.ms, duration: 500.ms),
                  ],
                ),
              ),
            ),

            // Credits Card
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
                child: CreditsCard(user: user)
                    .animate()
                    .fadeIn(delay: 300.ms, duration: 600.ms)
                    .slideY(begin: 0.2),
              ),
            ),

            // AI Tools Section
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 16),
                child: Text(
                  'Ferramentas de IA',
                  style: Theme.of(context).textTheme.headlineMedium,
                ).animate().fadeIn(delay: 400.ms, duration: 500.ms),
              ),
            ),

            // AI Tools Grid
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 0.95,
                ),
                delegate: SliverChildListDelegate([
                  AiToolCard(
                    title: 'Home\nStaging',
                    subtitle: 'Decore ambientes',
                    icon: Iconsax.brush_1,
                    gradient: AppColors.stagingGradient,
                    onTap: () {},
                  )
                      .animate()
                      .fadeIn(delay: 500.ms, duration: 500.ms)
                      .scale(begin: const Offset(0.8, 0.8)),
                  AiToolCard(
                    title: 'Visão de\nTerreno',
                    subtitle: 'Visualize construções',
                    icon: Iconsax.building_4,
                    gradient: AppColors.terrainGradient,
                    onTap: () {},
                  )
                      .animate()
                      .fadeIn(delay: 600.ms, duration: 500.ms)
                      .scale(begin: const Offset(0.8, 0.8)),
                  AiToolCard(
                    title: 'Descrição\nIA',
                    subtitle: 'Textos profissionais',
                    icon: Iconsax.document_text,
                    gradient: AppColors.primaryGradient,
                    onTap: () {},
                  )
                      .animate()
                      .fadeIn(delay: 700.ms, duration: 500.ms)
                      .scale(begin: const Offset(0.8, 0.8)),
                  AiToolCard(
                    title: 'Melhorar\nFoto',
                    subtitle: 'Fotos profissionais',
                    icon: Iconsax.camera,
                    gradient: AppColors.cardGradient,
                    onTap: () {},
                  )
                      .animate()
                      .fadeIn(delay: 800.ms, duration: 500.ms)
                      .scale(begin: const Offset(0.8, 0.8)),
                ]),
              ),
            ),

            // Quick Stats
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 16),
                child: Text(
                  'Resumo',
                  style: Theme.of(context).textTheme.headlineMedium,
                ).animate().fadeIn(delay: 900.ms, duration: 500.ms),
              ),
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                child: Row(
                  children: [
                    Expanded(
                      child: QuickStatsCard(
                        title: 'Imóveis',
                        value: '0',
                        icon: Iconsax.home_2,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: QuickStatsCard(
                        title: 'Gerações',
                        value: '${user.aiCreditsUsed}',
                        icon: Iconsax.magic_star,
                        color: AppColors.secondary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: QuickStatsCard(
                        title: 'Vendidos',
                        value: '0',
                        icon: Iconsax.tick_circle,
                        color: AppColors.success,
                      ),
                    ),
                  ],
                )
                    .animate()
                    .fadeIn(delay: 1000.ms, duration: 500.ms)
                    .slideY(begin: 0.2),
              ),
            ),

            // Chat Assistant Banner
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(
                          Iconsax.message_text,
                          color: Colors.white,
                          size: 26,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Assistente IA',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 17,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Tire dúvidas sobre vendas, preços e estratégias',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.8),
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Iconsax.arrow_right_3,
                        color: Colors.white,
                      ),
                    ],
                  ),
                )
                    .animate()
                    .fadeIn(delay: 1100.ms, duration: 500.ms)
                    .slideY(begin: 0.2),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
