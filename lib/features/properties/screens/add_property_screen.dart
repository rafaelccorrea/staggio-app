import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

class AddPropertyScreen extends StatefulWidget {
  final ApiClient apiClient;

  const AddPropertyScreen({super.key, required this.apiClient});

  @override
  State<AddPropertyScreen> createState() => _AddPropertyScreenState();
}

class _AddPropertyScreenState extends State<AddPropertyScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _areaController = TextEditingController();
  final _bedroomsController = TextEditingController();
  final _bathroomsController = TextEditingController();
  final _parkingController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _neighborhoodController = TextEditingController();

  String _selectedType = 'house';
  bool _isLoading = false;

  final List<Map<String, String>> _types = [
    {'key': 'house', 'label': 'Casa'},
    {'key': 'apartment', 'label': 'Apartamento'},
    {'key': 'land', 'label': 'Terreno'},
    {'key': 'commercial', 'label': 'Comercial'},
    {'key': 'farm', 'label': 'Fazenda'},
  ];

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await widget.apiClient.post(
        ApiConstants.properties,
        data: {
          'title': _titleController.text.trim(),
          'description': _descriptionController.text.trim(),
          'type': _selectedType,
          'price': double.tryParse(_priceController.text.replaceAll('.', '').replaceAll(',', '.')),
          'area': double.tryParse(_areaController.text),
          'bedrooms': int.tryParse(_bedroomsController.text),
          'bathrooms': int.tryParse(_bathroomsController.text),
          'parkingSpots': int.tryParse(_parkingController.text),
          'address': _addressController.text.trim(),
          'city': _cityController.text.trim(),
          'state': _stateController.text.trim(),
          'neighborhood': _neighborhoodController.text.trim(),
        },
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Imóvel cadastrado com sucesso!'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Novo Imóvel'),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _save,
            child: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Salvar'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Photo upload area
              Container(
                height: 160,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.3),
                    width: 2,
                    strokeAlign: BorderSide.strokeAlignInside,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Iconsax.camera, size: 40, color: AppColors.primary.withValues(alpha: 0.5)),
                    const SizedBox(height: 8),
                    const Text(
                      'Adicionar Fotos',
                      style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                    ),
                    const Text(
                      'Toque para selecionar',
                      style: TextStyle(color: AppColors.textTertiary, fontSize: 12),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 500.ms),

              const SizedBox(height: 24),

              // Type selection
              Text('Tipo', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _types.map((type) {
                  final isSelected = _selectedType == type['key'];
                  return ChoiceChip(
                    label: Text(type['label']!),
                    selected: isSelected,
                    onSelected: (_) => setState(() => _selectedType = type['key']!),
                    selectedColor: AppColors.primary.withValues(alpha: 0.15),
                    labelStyle: TextStyle(
                      color: isSelected ? AppColors.primary : AppColors.textSecondary,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 20),

              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Título do Imóvel *',
                  hintText: 'Ex: Casa moderna com piscina',
                  prefixIcon: Icon(Iconsax.home_2),
                ),
                validator: (v) => v == null || v.isEmpty ? 'Informe o título' : null,
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Descrição',
                  hintText: 'Descreva o imóvel...',
                  prefixIcon: Icon(Iconsax.document_text),
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

              Row(
                children: [
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
                  const SizedBox(width: 12),
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
                ],
              ),

              const SizedBox(height: 16),

              Row(
                children: [
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
                      controller: _parkingController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Vagas',
                        prefixIcon: Icon(Iconsax.car),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              Text('Localização', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),

              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(
                  labelText: 'Endereço',
                  prefixIcon: Icon(Iconsax.location),
                ),
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _neighborhoodController,
                decoration: const InputDecoration(
                  labelText: 'Bairro',
                  prefixIcon: Icon(Iconsax.map),
                ),
              ),

              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _cityController,
                      decoration: const InputDecoration(
                        labelText: 'Cidade',
                        prefixIcon: Icon(Iconsax.building),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _stateController,
                      decoration: const InputDecoration(
                        labelText: 'Estado',
                        prefixIcon: Icon(Iconsax.flag),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: _isLoading ? null : _save,
                  icon: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Icon(Iconsax.tick_circle, color: Colors.white),
                  label: Text(_isLoading ? 'Salvando...' : 'Cadastrar Imóvel'),
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
