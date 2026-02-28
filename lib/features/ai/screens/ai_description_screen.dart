import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

class AiDescriptionScreen extends StatefulWidget {
  final ApiClient apiClient;

  const AiDescriptionScreen({super.key, required this.apiClient});

  @override
  State<AiDescriptionScreen> createState() => _AiDescriptionScreenState();
}

class _AiDescriptionScreenState extends State<AiDescriptionScreen> {
  final _formKey = GlobalKey<FormState>();
  String _propertyType = 'Apartamento';
  final _bedroomsController = TextEditingController(text: '3');
  final _bathroomsController = TextEditingController(text: '2');
  final _areaController = TextEditingController(text: '120');
  final _neighborhoodController = TextEditingController();
  final _cityController = TextEditingController();
  final _priceController = TextEditingController();
  final _featuresController = TextEditingController();
  final _additionalController = TextEditingController();

  bool _isLoading = false;
  String? _result;

  final List<String> _propertyTypes = [
    'Apartamento',
    'Casa',
    'Terreno',
    'Comercial',
    'Fazenda',
    'Cobertura',
    'Studio',
    'Sobrado',
  ];

  Future<void> _generate() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _result = null;
    });

    try {
      final response = await widget.apiClient.post(
        ApiConstants.aiDescription,
        data: {
          'propertyType': _propertyType,
          'bedrooms': int.tryParse(_bedroomsController.text),
          'bathrooms': int.tryParse(_bathroomsController.text),
          'area': double.tryParse(_areaController.text),
          'neighborhood': _neighborhoodController.text.isNotEmpty
              ? _neighborhoodController.text
              : null,
          'city': _cityController.text.isNotEmpty ? _cityController.text : null,
          'price': double.tryParse(_priceController.text.replaceAll('.', '').replaceAll(',', '.')),
          'features': _featuresController.text.isNotEmpty
              ? _featuresController.text.split(',').map((e) => e.trim()).toList()
              : null,
          'additionalInfo': _additionalController.text.isNotEmpty
              ? _additionalController.text
              : null,
        },
      );

      setState(() {
        _result = response.data['outputText'] ?? 'Sem resultado';
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erro: ${e.toString()}'),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Descrição com IA'),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    const Icon(Iconsax.document_text, color: Colors.white, size: 32),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Descrição Inteligente',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            'Gere textos para portais, Instagram e WhatsApp',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.8),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2),

              const SizedBox(height: 24),

              // Property Type
              Text('Tipo de Imóvel', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _propertyTypes.map((type) {
                  final isSelected = _propertyType == type;
                  return ChoiceChip(
                    label: Text(type),
                    selected: isSelected,
                    onSelected: (_) => setState(() => _propertyType = type),
                    selectedColor: AppColors.primary.withValues(alpha: 0.15),
                    labelStyle: TextStyle(
                      color: isSelected ? AppColors.primary : AppColors.textSecondary,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 20),

              // Bedrooms, Bathrooms, Area
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _bedroomsController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Quartos',
                        prefixIcon: Icon(Iconsax.lamp),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _bathroomsController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Banheiros',
                        prefixIcon: Icon(Iconsax.drop),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _areaController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Área (m²)',
                        prefixIcon: Icon(Iconsax.ruler),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _neighborhoodController,
                decoration: const InputDecoration(
                  labelText: 'Bairro',
                  prefixIcon: Icon(Iconsax.location),
                ),
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _cityController,
                decoration: const InputDecoration(
                  labelText: 'Cidade',
                  prefixIcon: Icon(Iconsax.building),
                ),
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _priceController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Preço (R\$)',
                  prefixIcon: Icon(Iconsax.money_2),
                ),
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _featuresController,
                decoration: const InputDecoration(
                  labelText: 'Diferenciais (separados por vírgula)',
                  hintText: 'Piscina, Churrasqueira, Varanda Gourmet',
                  prefixIcon: Icon(Iconsax.star),
                ),
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _additionalController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Informações adicionais',
                  hintText: 'Detalhes extras sobre o imóvel...',
                  prefixIcon: Icon(Iconsax.info_circle),
                ),
              ),

              const SizedBox(height: 28),

              // Generate button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: _isLoading ? null : _generate,
                  icon: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Icon(Iconsax.magic_star, color: Colors.white),
                  label: Text(_isLoading ? 'Gerando...' : 'Gerar Descrição'),
                ),
              ),

              // Result
              if (_result != null) ...[
                const SizedBox(height: 28),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.surfaceVariant),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Iconsax.tick_circle,
                              color: AppColors.success, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Descrição Gerada',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const Spacer(),
                          IconButton(
                            icon: const Icon(Iconsax.copy, size: 20),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: _result!));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Copiado!')),
                              );
                            },
                          ),
                          IconButton(
                            icon: const Icon(Iconsax.share, size: 20),
                            onPressed: () {},
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SelectableText(
                        _result!,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              height: 1.6,
                            ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2),
              ],

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
