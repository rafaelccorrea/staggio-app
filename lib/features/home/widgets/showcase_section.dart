import 'package:flutter/material.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import 'video_carousel.dart';

class ShowcaseSection extends StatelessWidget {
  const ShowcaseSection({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Title
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Iconsax.magic_star, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 10),
              Text(
                'Veja o que a IA pode fazer',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                ),
              ),
            ],
          ),
        ),

        // Before/After Carousel
        SizedBox(
          height: 260,
          child: ListView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20),
            children: [
              _BeforeAfterCard(
                title: 'Home Staging',
                subtitle: 'Sala vazia → Decorada',
                beforeImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
                afterImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
                gradient: AppColors.stagingGradient,
                isDark: isDark,
              ),
              const SizedBox(width: 14),
              _BeforeAfterCard(
                title: 'Visão de Terreno',
                subtitle: 'Terreno → Projeto 3D',
                beforeImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
                afterImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
                gradient: AppColors.terrainGradient,
                isDark: isDark,
              ),
              const SizedBox(width: 14),
              _BeforeAfterCard(
                title: 'Melhorar Foto',
                subtitle: 'Foto simples → Profissional',
                beforeImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
                afterImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
                gradient: AppColors.cardGradient,
                isDark: isDark,
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Video Carousel
        VideoCarousel(
          videos: [
            VideoItem(
              url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663325645759/o8cLHeyJ6TJo5M4wzqsPRL/staggio_house_cinematic_d46fb731.mp4',
              title: 'Tour Cinematográfico - Casa Moderna',
              prompt: 'Create a 12-second cinematic real estate video showcasing a luxury modern house. Start with an exterior wide shot of a contemporary home with large floor-to-ceiling windows at golden hour sunset. Smooth camera movement with professional cinematography.',
            ),
            VideoItem(
              url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663325645759/o8cLHeyJ6TJo5M4wzqsPRL/staggio_land_transformation_00e2632a.mp4',
              title: 'Transformação - Terreno para Casa',
              prompt: 'Create a 12-second cinematic real estate video of a luxury residential property interior. Start with a wide shot of a modern open-concept living room with high ceilings and large windows overlooking a landscape.',
            ),
            VideoItem(
              url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663325645759/o8cLHeyJ6TJo5M4wzqsPRL/staggio_video_1_153fddcf.mp4',
              title: 'Tour Cinematográfico - Casa Moderna',
              prompt: 'Create a 12-second cinematic real estate video showcasing a luxury modern house. Start with an exterior wide shot of a contemporary home with large floor-to-ceiling windows at golden hour sunset.',
            ),
            VideoItem(
              url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663325645759/o8cLHeyJ6TJo5M4wzqsPRL/staggio_video_2_8aa6a5e0.mp4',
              title: 'Tour Interior Luxuoso',
              prompt: 'Create a 12-second cinematic real estate video of a luxury residential property interior. Start with a wide shot of a modern open-concept living room with high ceilings and large windows.',
            ),
          ],
        ),
        const SizedBox(height: 20),

        // AI Description Showcase
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppColors.cardGradient,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Theme.of(context).dividerColor,
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Iconsax.document_text, color: Colors.white, size: 16),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Descrições IA',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                const Text(
                  'Gere descrições profissionais para seus anúncios em segundos',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white70,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _BeforeAfterCard extends StatefulWidget {
  final String title;
  final String subtitle;
  final String beforeImage;
  final String afterImage;
  final Gradient gradient;
  final bool isDark;

  const _BeforeAfterCard({
    required this.title,
    required this.subtitle,
    required this.beforeImage,
    required this.afterImage,
    required this.gradient,
    required this.isDark,
  });

  @override
  State<_BeforeAfterCard> createState() => _BeforeAfterCardState();
}

class _BeforeAfterCardState extends State<_BeforeAfterCard> {
  bool _showAfter = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _showAfter = !_showAfter),
      child: Container(
        width: 180,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: widget.gradient,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Image
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                _showAfter ? widget.afterImage : widget.beforeImage,
                fit: BoxFit.cover,
                width: double.infinity,
                height: double.infinity,
              ),
            ),

            // Overlay
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.6),
                  ],
                ),
              ),
            ),

            // Content
            Positioned(
              bottom: 12,
              left: 12,
              right: 12,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.subtitle,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),

            // Tap indicator
            Positioned(
              top: 8,
              right: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  _showAfter ? 'Depois' : 'Antes',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
