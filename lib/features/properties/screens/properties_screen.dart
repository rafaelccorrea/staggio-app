import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../data/models/property_model.dart';
import 'add_property_screen.dart';

class PropertiesScreen extends StatefulWidget {
  final ApiClient? apiClient;

  const PropertiesScreen({
    super.key,
    this.apiClient,
  });

  @override
  State<PropertiesScreen> createState() => _PropertiesScreenState();
}

class _PropertiesScreenState extends State<PropertiesScreen> {
  late final ApiClient _apiClient;
  List<PropertyModel> _allProperties = [];
  List<PropertyModel> _filteredProperties = [];
  String _selectedFilter = 'Todos';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  bool _isLoading = true;
  String? _errorMessage;

  final List<String> _filters = [
    'Todos',
    'Casas',
    'Apartamentos',
    'Terrenos',
    'Comercial',
  ];

  final Map<String, String> _filterToType = {
    'Todos': '',
    'Casas': 'house',
    'Apartamentos': 'apartment',
    'Terrenos': 'land',
    'Comercial': 'commercial',
  };

  @override
  void initState() {
    super.initState();
    _apiClient = widget.apiClient ?? ApiClient();
    _loadProperties();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadProperties() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiClient.get(ApiConstants.properties);
      final body = response.data;
      List<dynamic> items;

      if (body is Map && body.containsKey('data')) {
        final data = body['data'];
        if (data is Map && data.containsKey('items')) {
          items = data['items'] as List;
        } else if (data is List) {
          items = data;
        } else {
          items = [];
        }
      } else if (body is List) {
        items = body;
      } else {
        items = [];
      }

      if (mounted) {
        setState(() {
          _allProperties = items
              .map((json) => PropertyModel.fromJson(json as Map<String, dynamic>))
              .toList();
          _isLoading = false;
        });
        _applyFilters();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Erro ao carregar imóveis. Verifique sua conexão.';
        });
      }
    }
  }

  void _applyFilters() {
    setState(() {
      _filteredProperties = _allProperties.where((p) {
        final matchesFilter = _selectedFilter == 'Todos' ||
            p.type == _filterToType[_selectedFilter];
        final matchesSearch = _searchQuery.isEmpty ||
            p.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            (p.address?.toLowerCase().contains(_searchQuery.toLowerCase()) ??
                false) ||
            (p.city?.toLowerCase().contains(_searchQuery.toLowerCase()) ??
                false);
        return matchesFilter && matchesSearch;
      }).toList();
    });
  }

  void _navigateToAddProperty() async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => AddPropertyScreen(apiClient: _apiClient),
      ),
    );

    if (result == true && mounted) {
      _loadProperties();
    }
  }

  Future<void> _deleteProperty(PropertyModel property) async {
    try {
      await _apiClient.delete('${ApiConstants.properties}/${property.id}');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Imóvel excluído com sucesso'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        _loadProperties();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Erro ao excluir imóvel'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  void _openPropertyDetail(PropertyModel property) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _PropertyDetailSheet(
        property: property,
        onDelete: () => _deleteProperty(property),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadProperties,
          color: AppColors.primary,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(24, 20, 24, 0),
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
                          onPressed: _navigateToAddProperty,
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
                    controller: _searchController,
                    onChanged: (value) {
                      _searchQuery = value;
                      _applyFilters();
                    },
                    decoration: InputDecoration(
                      hintText: 'Buscar imóveis...',
                      prefixIcon:
                          const Icon(Iconsax.search_normal, size: 20),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.close, size: 20),
                              onPressed: () {
                                _searchController.clear();
                                _searchQuery = '';
                                _applyFilters();
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: Theme.of(context).inputDecorationTheme.fillColor ?? AppColors.surfaceVariant,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding:
                          const EdgeInsets.symmetric(vertical: 14),
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
                      children: _filters.map((filter) {
                        final isSelected = _selectedFilter == filter;
                        return Container(
                          margin: const EdgeInsets.only(right: 8),
                          child: FilterChip(
                            label: Text(filter),
                            selected: isSelected,
                            onSelected: (_) {
                              setState(() {
                                _selectedFilter = filter;
                              });
                              _applyFilters();
                            },
                            selectedColor:
                                AppColors.primary.withValues(alpha: 0.15),
                            backgroundColor: AppColors.surface,
                            labelStyle: TextStyle(
                              color: isSelected
                                  ? AppColors.primary
                                  : AppColors.textSecondary,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                              fontSize: 13,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: BorderSide(
                                color: isSelected
                                    ? AppColors.primary
                                    : AppColors.surfaceVariant,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ).animate().fadeIn(delay: 300.ms, duration: 500.ms),
                ),
              ),

              // Loading state
              if (_isLoading)
                SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text('Carregando imóveis...'),
                      ],
                    ),
                  ),
                )
              // Error state
              else if (_errorMessage != null)
                SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Iconsax.warning_2, size: 48, color: AppColors.error),
                        SizedBox(height: 16),
                        Text(
                          _errorMessage!,
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton.icon(
                          onPressed: _loadProperties,
                          icon: const Icon(Iconsax.refresh, color: Colors.white),
                          label: const Text('Tentar Novamente'),
                        ),
                      ],
                    ),
                  ),
                )
              else ...[
                // Count
                if (_allProperties.isNotEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(24, 0, 24, 12),
                      child: Text(
                        '${_filteredProperties.length} imóve${_filteredProperties.length == 1 ? 'l' : 'is'} encontrado${_filteredProperties.length == 1 ? '' : 's'}',
                        style: TextStyle(
                          fontSize: 13,
                          color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),

                // Empty state or property list
                if (_filteredProperties.isEmpty)
                  SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              color: Theme.of(context).dividerColor,
                              borderRadius: BorderRadius.circular(32),
                            ),
                            child: Icon(
                              Iconsax.home_2,
                              size: 48,
                              color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
                            ),
                          ),
                          SizedBox(height: 20),
                          Text(
                            _allProperties.isEmpty
                                ? 'Nenhum imóvel cadastrado'
                                : 'Nenhum resultado encontrado',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          SizedBox(height: 8),
                          Text(
                            _allProperties.isEmpty
                                ? 'Adicione seu primeiro imóvel\npara começar a usar a IA'
                                : 'Tente buscar com outros termos\nou altere os filtros',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          if (_allProperties.isEmpty) ...[
                            const SizedBox(height: 24),
                            ElevatedButton.icon(
                              onPressed: _navigateToAddProperty,
                              icon: const Icon(Iconsax.add, color: Colors.white),
                              label: const Text('Adicionar Imóvel'),
                            ),
                          ],
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
                          final property = _filteredProperties[index];
                          return GestureDetector(
                            onTap: () => _openPropertyDetail(property),
                            child: _buildPropertyCard(context, property)
                                .animate()
                                .fadeIn(
                                  delay: Duration(
                                      milliseconds: 400 + index * 100),
                                  duration: 500.ms,
                                )
                                .slideY(begin: 0.1),
                          );
                        },
                        childCount: _filteredProperties.length,
                      ),
                    ),
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPropertyCard(BuildContext context, PropertyModel property) {
    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).dividerColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image or placeholder
          Container(
            height: 180,
            decoration: BoxDecoration(
              color: Theme.of(context).dividerColor,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Stack(
              children: [
                if (property.images.isNotEmpty)
                  ClipRRect(
                    borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                    child: Image.network(
                      property.images.first,
                      width: double.infinity,
                      height: 180,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Center(
                        child: Icon(Iconsax.image, size: 48, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary),
                      ),
                    ),
                  )
                else
                  Center(
                    child: Icon(
                      Iconsax.image,
                      size: 48,
                      color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
                    ),
                  ),
                // Type badge
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      property.typeDisplayName,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
                // Status badge
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      property.statusDisplayName,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  property.title,
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w600,
                    color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary,
                  ),
                ),
                if (property.address != null) ...[
                  SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Iconsax.location,
                          size: 14, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary),
                      SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${property.address}${property.city != null ? ', ${property.city}' : ''}',
                          style: TextStyle(
                            fontSize: 13,
                            color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
                          ),
                          overflow: TextOverflow.ellipsis,
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
                      _buildPropertyInfo(
                          Iconsax.lamp, '${property.bedrooms}'),
                    if (property.bathrooms != null)
                      _buildPropertyInfo(
                          Iconsax.drop, '${property.bathrooms}'),
                    if (property.area != null)
                      _buildPropertyInfo(
                          Iconsax.ruler, '${property.area?.toInt()}m²'),
                  ],
                ),
                const SizedBox(height: 12),
                // Action buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _openPropertyDetail(property),
                        icon: const Icon(Iconsax.eye, size: 16),
                        label: const Text('Ver Detalhes'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: const BorderSide(color: AppColors.primary),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text(
                                  'Abrindo ferramentas de IA...'),
                              backgroundColor: AppColors.primary,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                          );
                        },
                        icon: const Icon(Iconsax.magic_star,
                            size: 16, color: Colors.white),
                        label: const Text('Usar IA'),
                        style: ElevatedButton.styleFrom(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
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
      padding: EdgeInsets.only(left: 12),
      child: Row(
        children: [
          Icon(icon, size: 14, color: AppColors.textTertiary),
          SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
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

class _PropertyDetailSheet extends StatelessWidget {
  final PropertyModel property;
  final VoidCallback onDelete;

  const _PropertyDetailSheet({
    required this.property,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            children: [
              // Handle
              Container(
                margin: EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Theme.of(context).dividerColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Image
                      Container(
                        height: 220,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Theme.of(context).dividerColor,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: property.images.isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(20),
                                child: Image.network(
                                  property.images.first,
                                  width: double.infinity,
                                  height: 220,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Center(
                                    child: Icon(Iconsax.image,
                                        size: 64, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary),
                                  ),
                                ),
                              )
                            : Center(
                                child: Icon(Iconsax.image,
                                    size: 64, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary),
                              ),
                      ),
                      SizedBox(height: 20),

                      // Title and price
                      Text(
                        property.title,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        property.formattedPrice,
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                      SizedBox(height: 16),

                      // Location
                      if (property.address != null)
                        Row(
                          children: [
                            Icon(Iconsax.location,
                                size: 18, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                '${property.address}${property.neighborhood != null ? ', ${property.neighborhood}' : ''}${property.city != null ? ' - ${property.city}' : ''}${property.state != null ? '/${property.state}' : ''}',
                                style: TextStyle(
                                  fontSize: 15,
                                  color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ],
                        ),

                      const SizedBox(height: 24),

                      // Property details
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          if (property.bedrooms != null)
                            _buildDetailItem(
                                Iconsax.lamp, '${property.bedrooms}', 'Quartos'),
                          if (property.bathrooms != null)
                            _buildDetailItem(Iconsax.drop,
                                '${property.bathrooms}', 'Banheiros'),
                          if (property.area != null)
                            _buildDetailItem(Iconsax.ruler,
                                '${property.area?.toInt()}m²', 'Área'),
                          if (property.parkingSpots != null)
                            _buildDetailItem(Iconsax.car,
                                '${property.parkingSpots}', 'Vagas'),
                        ],
                      ),

                      SizedBox(height: 24),

                      // Description
                      if (property.description != null) ...[
                        Text(
                          'Descrição',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          property.description!,
                          style: TextStyle(
                            fontSize: 15,
                            color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary,
                            height: 1.6,
                          ),
                        ),
                      ],

                      // AI Description
                      if (property.aiDescription != null) ...[
                        SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: AppColors.primary.withValues(alpha: 0.15),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Iconsax.magic_star,
                                      size: 18, color: AppColors.primary),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Descrição IA',
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(height: 8),
                              Text(
                                property.aiDescription!,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary,
                                  height: 1.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 32),

                      // Action buttons
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                Navigator.pop(context);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: const Text('Editando imóvel...'),
                                    backgroundColor: AppColors.primary,
                                    behavior: SnackBarBehavior.floating,
                                    shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(12)),
                                  ),
                                );
                              },
                              icon: const Icon(Iconsax.edit, size: 18),
                              label: const Text('Editar'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.primary,
                                side:
                                    const BorderSide(color: AppColors.primary),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.pop(context);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: const Text(
                                        'Abrindo ferramentas de IA...'),
                                    backgroundColor: AppColors.primary,
                                    behavior: SnackBarBehavior.floating,
                                    shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(12)),
                                  ),
                                );
                              },
                              icon: const Icon(Iconsax.magic_star,
                                  size: 18, color: Colors.white),
                              label: const Text('Usar IA'),
                              style: ElevatedButton.styleFrom(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Delete button
                      SizedBox(
                        width: double.infinity,
                        child: TextButton.icon(
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                title: const Text('Excluir Imóvel'),
                                content: const Text(
                                    'Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.'),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16)),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(ctx),
                                    child: const Text('Cancelar'),
                                  ),
                                  TextButton(
                                    onPressed: () {
                                      Navigator.pop(ctx);
                                      Navigator.pop(context);
                                      onDelete();
                                    },
                                    child: Text('Excluir',
                                        style: TextStyle(
                                            color: AppColors.error)),
                                  ),
                                ],
                              ),
                            );
                          },
                          icon: Icon(Iconsax.trash,
                              size: 18, color: AppColors.error),
                          label: Text('Excluir Imóvel',
                              style: TextStyle(color: AppColors.error)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailItem(IconData icon, String value, String label) {
    return Column(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(icon, color: AppColors.primary, size: 24),
        ),
        SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textTertiary,
          ),
        ),
      ],
    );
  }
}
