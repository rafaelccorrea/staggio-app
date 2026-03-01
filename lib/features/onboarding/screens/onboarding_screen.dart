import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/video_cache_service.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback onComplete;

  const OnboardingScreen({super.key, required this.onComplete});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    // Preload videos while showing onboarding
    _preloadVideos();
  }

  Future<void> _preloadVideos() async {
    try {
      debugPrint('[ONBOARDING] Starting video preload');
      
      // Preload demo videos in background
      final videoUrls = [
        'https://cdn.example.com/staggio_video_1.mp4',
        'https://cdn.example.com/staggio_video_2.mp4',
      ];
      
      for (final url in videoUrls) {
        Future.delayed(const Duration(milliseconds: 100), () {
          try {
            VideoCacheService.getController(url);
            debugPrint('[ONBOARDING] Preloaded video: $url');
          } catch (e) {
            debugPrint('[ONBOARDING] Error preloading $url: $e');
          }
        });
      }
    } catch (e) {
      debugPrint('[ONBOARDING] Error in _preloadVideos: $e');
    }
  }

  final List<_OnboardingPage> _pages = [
    _OnboardingPage(
      icon: Iconsax.magic_star,
      title: 'Dê Vida aos\nSeus Imóveis',
      subtitle:
          'Use inteligência artificial para transformar fotos de imóveis vazios em ambientes decorados e atraentes.',
      gradient: AppColors.primaryGradient,
      iconColor: AppColors.primary,
    ),
    _OnboardingPage(
      icon: Iconsax.building_4,
      title: 'Visualize\nTerrenos',
      subtitle:
          'Mostre aos seus clientes como ficaria uma construção no terreno vazio. Renderizações em segundos.',
      gradient: AppColors.terrainGradient,
      iconColor: AppColors.accent,
    ),
    _OnboardingPage(
      icon: Iconsax.document_text,
      title: 'Descrições\nProfissionais',
      subtitle:
          'Gere textos persuasivos para anúncios em portais, Instagram e WhatsApp automaticamente.',
      gradient: AppColors.stagingGradient,
      iconColor: AppColors.secondary,
    ),
    _OnboardingPage(
      icon: Iconsax.chart_2,
      title: 'Venda Mais\ne Melhor',
      subtitle:
          'Corretores que usam o Staggio fecham negócios mais rápido com apresentações profissionais.',
      gradient: AppColors.cardGradient,
      iconColor: AppColors.info,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            Align(
              alignment: Alignment.topRight,
              child: TextButton(
                onPressed: widget.onComplete,
                child: Text(
                  'Pular',
                  style: TextStyle(
                    color: AppColors.textTertiary,
                    fontSize: 16,
                  ),
                ),
              ),
            ),

            // Page content
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _pages.length,
                onPageChanged: (index) {
                  setState(() => _currentPage = index);
                },
                itemBuilder: (context, index) {
                  final page = _pages[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Icon container
                        Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            gradient: page.gradient,
                            borderRadius: BorderRadius.circular(40),
                            boxShadow: [
                              BoxShadow(
                                color: page.iconColor.withValues(alpha: 0.3),
                                blurRadius: 30,
                                offset: const Offset(0, 15),
                              ),
                            ],
                          ),
                          child: Icon(
                            page.icon,
                            size: 64,
                            color: Colors.white,
                          ),
                        )
                            .animate()
                            .fadeIn(duration: 600.ms)
                            .scale(begin: const Offset(0.5, 0.5)),

                        const SizedBox(height: 48),

                        // Title
                        Text(
                          page.title,
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .displayMedium
                              ?.copyWith(
                                height: 1.2,
                              ),
                        )
                            .animate()
                            .fadeIn(delay: 200.ms, duration: 600.ms)
                            .slideY(begin: 0.3),

                        const SizedBox(height: 20),

                        // Subtitle
                        Text(
                          page.subtitle,
                          textAlign: TextAlign.center,
                          style:
                              Theme.of(context).textTheme.bodyLarge?.copyWith(
                                    height: 1.6,
                                  ),
                        )
                            .animate()
                            .fadeIn(delay: 400.ms, duration: 600.ms)
                            .slideY(begin: 0.3),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Bottom section
            Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  // Page indicator
                  SmoothPageIndicator(
                    controller: _pageController,
                    count: _pages.length,
                    effect: ExpandingDotsEffect(
                      activeDotColor: AppColors.primary,
                      dotColor: AppColors.surfaceVariant,
                      dotHeight: 8,
                      dotWidth: 8,
                      expansionFactor: 4,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () {
                        if (_currentPage == _pages.length - 1) {
                          widget.onComplete();
                        } else {
                          _pageController.nextPage(
                            duration: const Duration(milliseconds: 400),
                            curve: Curves.easeInOut,
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: Text(
                        _currentPage == _pages.length - 1
                            ? 'Começar Agora'
                            : 'Próximo',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingPage {
  final IconData icon;
  final String title;
  final String subtitle;
  final LinearGradient gradient;
  final Color iconColor;

  _OnboardingPage({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.gradient,
    required this.iconColor,
  });
}
