import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../theme/app_theme.dart';

class ShimmerLoading extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const ShimmerLoading({
    super.key,
    this.width = double.infinity,
    required this.height,
    this.borderRadius = 16,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.surfaceVariant,
      highlightColor: AppColors.surface,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

class ShimmerPropertyCard extends StatelessWidget {
  const ShimmerPropertyCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const ShimmerLoading(height: 180, borderRadius: 20),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    ShimmerLoading(width: 80, height: 24, borderRadius: 8),
                    const SizedBox(width: 8),
                    ShimmerLoading(width: 80, height: 24, borderRadius: 8),
                  ],
                ),
                const SizedBox(height: 12),
                const ShimmerLoading(height: 20),
                const SizedBox(height: 8),
                ShimmerLoading(width: 200, height: 16, borderRadius: 8),
                const SizedBox(height: 12),
                ShimmerLoading(width: 120, height: 24, borderRadius: 8),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ShimmerDashboard extends StatelessWidget {
  const ShimmerDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Credits card shimmer
          const ShimmerLoading(height: 100, borderRadius: 24),
          const SizedBox(height: 24),
          // AI tools grid shimmer
          Row(
            children: [
              Expanded(child: ShimmerLoading(height: 140, borderRadius: 24)),
              const SizedBox(width: 16),
              Expanded(child: ShimmerLoading(height: 140, borderRadius: 24)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: ShimmerLoading(height: 140, borderRadius: 24)),
              const SizedBox(width: 16),
              Expanded(child: ShimmerLoading(height: 140, borderRadius: 24)),
            ],
          ),
        ],
      ),
    );
  }
}
