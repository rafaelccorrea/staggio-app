import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/services/video_cache_service.dart';

class SplashScreen extends StatefulWidget {
  final VoidCallback onComplete;

  const SplashScreen({super.key, required this.onComplete});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;

  // Centralized video URLs - same as used in ShowcaseSection/VideoCarousel
  static const List<String> videoUrls = [
    'https://d2xsxph8kpxj0f.cloudfront.net/310519663325645759/o8cLHeyJ6TJo5M4wzqsPRL/staggio_house_cinematic_d46fb731.mp4',
    'https://d2xsxph8kpxj0f.cloudfront.net/310519663325645759/o8cLHeyJ6TJo5M4wzqsPRL/staggio_land_transformation_00e2632a.mp4',
    'https://d2xsxph8kpxj0f.cloudfront.net/310519663325645759/o8cLHeyJ6TJo5M4wzqsPRL/Gen-4Turbo30-secondcinematicrealestatevideoofamodernhouseforsaleShotbreakdown-5secondssmoothdroneshotappro_dce0c79f.mp4',
    'https://d2xsxph8kpxj0f.cloudfront.net/310519663325645759/o8cLHeyJ6TJo5M4wzqsPRL/Gen-4Turbo30-secondarchitecturaltransformationvideoSinglefixedcameraanglethroughouttheentirevideoConsistentdaylightlightingandsamesundirectionStage1(10seconds)emptygrassylot_da23cffb.mp4',
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    // Start video preloading immediately
    _preloadVideosAndComplete();
  }

  Future<void> _preloadVideosAndComplete() async {
    try {
      debugPrint('[SPLASH] Starting to preload ${videoUrls.length} videos');

      // Start preloading all videos AND wait minimum 3 seconds in parallel
      final results = await Future.wait([
        VideoCacheService.preloadVideos(videoUrls),
        Future.delayed(const Duration(milliseconds: 3000)),
      ]);

      debugPrint('[SPLASH] Videos preloaded and minimum time passed');

      if (mounted) {
        widget.onComplete();
      }
    } catch (e) {
      debugPrint('[SPLASH] Error preloading videos: $e');
      // Continue anyway after 4 seconds
      await Future.delayed(const Duration(milliseconds: 4000));
      if (mounted) {
        widget.onComplete();
      }
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF6C5CE7),
              Color(0xFF8B5CF6),
              Color(0xFFA78BFA),
            ],
          ),
        ),
        child: Stack(
          children: [
            // Background decorative circles
            Positioned(
              top: -80,
              right: -60,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.06),
                ),
              ),
            ),
            Positioned(
              bottom: -100,
              left: -80,
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.05),
                ),
              ),
            ),
            Positioned(
              top: MediaQuery.of(context).size.height * 0.2,
              left: -40,
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.04),
                ),
              ),
            ),

            // Main content
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo icon with glow
                  AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      return Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(36),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.white.withValues(
                                  alpha: 0.1 + _pulseController.value * 0.1),
                              blurRadius: 30 + _pulseController.value * 20,
                              spreadRadius: _pulseController.value * 10,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Iconsax.magic_star,
                          size: 56,
                          color: Colors.white,
                        ),
                      );
                    },
                  )
                      .animate()
                      .fadeIn(duration: 800.ms)
                      .scale(
                        begin: const Offset(0.3, 0.3),
                        end: const Offset(1.0, 1.0),
                        curve: Curves.elasticOut,
                        duration: 1200.ms,
                      ),

                  const SizedBox(height: 32),

                  // App name
                  const Text(
                    'Staggio',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 42,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 2,
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 400.ms, duration: 800.ms)
                      .slideY(begin: 0.5, curve: Curves.easeOutCubic),

                  const SizedBox(height: 8),

                  // Tagline
                  Text(
                    'IA para Corretores de Imóveis',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: 16,
                      fontWeight: FontWeight.w400,
                      letterSpacing: 0.5,
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 700.ms, duration: 800.ms)
                      .slideY(begin: 0.5, curve: Curves.easeOutCubic),

                  const SizedBox(height: 60),

                  // Loading indicator
                  SizedBox(
                    width: 32,
                    height: 32,
                    child: CircularProgressIndicator(
                      color: Colors.white.withValues(alpha: 0.7),
                      strokeWidth: 2.5,
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 1200.ms, duration: 600.ms),
                ],
              ),
            ),

            // Bottom version text
            Positioned(
              bottom: 48,
              left: 0,
              right: 0,
              child: Center(
                child: Text(
                  'v1.0.0',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.4),
                    fontSize: 12,
                  ),
                ),
              ).animate().fadeIn(delay: 1500.ms, duration: 600.ms),
            ),
          ],
        ),
      ),
    );
  }
}
