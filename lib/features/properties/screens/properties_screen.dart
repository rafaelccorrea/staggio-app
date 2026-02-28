import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/property_model.dart';

class PropertiesScreen extends StatelessWidget {
  final List<PropertyModel> properties;

  const PropertiesScreen({super.key, this.properties = const []});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Meus Imóveis',
                        style: Theme.of(context).textTheme.headlineLarge,
                      ),
                    ),
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: IconButton(
                        icon: const Icon(Iconsax.add, color: Colors.white),
                        onPressed: () {},
                      ),
                    ),
                  ],
                ).animate().fadeIn(duration: 500.ms),
              ),
            ),

            // Search bar
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 20, 24, 8),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Buscar imóveis...',
                    prefixIcon: const Icon(Iconsax.search_normal, size: 20),
                    filled: true,
                    fillColor: AppColors.surfaceVariant,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ).animate().fadeIn(delay: 200.ms, duration: 500.ms),
              ),
            ),

            // Filter chips
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 12, 24, 16),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('Todos', true),
                      _buildFilterChip('Casas', false),
                      _buildFilterChip('Apartamentos', false),
                      _buildFilterChip('Terrenos', false),
                      _buildFilterChip('Comercial', false),
                    ],
                  ),
                ).animate().fadeIn(delay: 300.ms, duration: 500.ms),
              ),
            ),

            // Empty state or property list
            if (properties.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          color: AppColors.surfaceVariant,
                          borderRadius: BorderRadius.circular(32),
                        ),
                        child: const Icon(
                          Iconsax.home_2,
                          size: 48,
                          color: AppColors.textTertiary,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Nenhum imóvel cadastrado',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Adicione seu primeiro imóvel\npara começar a usar a IA',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Iconsax.add, color: Colors.white),
                        label: const Text('Adicionar Imóvel'),
                      ),
                    ],
                  ).animate().fadeIn(delay: 400.ms, duration: 600.ms),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final property = properties[index];
                      return _buildPropertyCard(context, property)
                          .animate()
                          .fadeIn(
                            delay: Duration(milliseconds: 400 + index * 100),
                            duration: 500.ms,
                          )
                          .slideY(begin: 0.1);
                    },
                    childCount: properties.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) {},
        selectedColor: AppColors.primary.withValues(alpha: 0.15),
        backgroundColor: AppColors.surface,
        labelStyle: TextStyle(
          color: isSelected ? AppColors.primary : AppColors.textSecondary,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
          fontSize: 13,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
          ),
        ),
      ),
    );
  }

  Widget _buildPropertyCard(BuildContext context, PropertyModel property) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.surfaceVariant),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image placeholder
          Container(
            height: 180,
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Center(
              child: Icon(
                Iconsax.image,
                size: 48,
                color: AppColors.textTertiary,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        property.statusDisplayName,
                        style: const TextStyle(
                          color: AppColors.success,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        property.typeDisplayName,
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  property.title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (property.address != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Iconsax.location, size: 14, color: AppColors.textTertiary),
                      const SizedBox(width: 4),
                      Text(
                        property.address!,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 12),
                Row(
                  children: [
                    Text(
                      property.formattedPrice,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                    const Spacer(),
                    if (property.bedrooms != null)
                      _buildPropertyInfo(Iconsax.lamp, '${property.bedrooms}'),
                    if (property.bathrooms != null)
                      _buildPropertyInfo(Iconsax.drop, '${property.bathrooms}'),
                    if (property.area != null)
                      _buildPropertyInfo(Iconsax.ruler, '${property.area?.toInt()}m²'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPropertyInfo(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 12),
      child: Row(
        children: [
          Icon(icon, size: 14, color: AppColors.textTertiary),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
