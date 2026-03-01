import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

class AiStagingScreen extends StatefulWidget {
  final ApiClient apiClient;

  const AiStagingScreen({super.key, required this.apiClient});

  @override
  State<AiStagingScreen> createState() => _AiStagingScreenState();
}

class _AiStagingScreenState extends State<AiStagingScreen> {
  File? _selectedImage;
  String? _resultImageUrl;
  bool _isLoading = false;
  String _selectedStyle = 'moderno';

  final List<Map<String, dynamic>> _styles = [
    {'key': 'moderno', 'label': 'Moderno', 'icon': Iconsax.lamp_1},
    {'key': 'classico', 'label': 'Clássico', 'icon': Iconsax.crown},
    {'key': 'minimalista', 'label': 'Minimalista', 'icon': Iconsax.box_1},
    {'key': 'industrial', 'label': 'Industrial', 'icon': Iconsax.building},
    {'key': 'rustico', 'label': 'Rústico', 'icon': Iconsax.tree},
    {'key': 'luxo', 'label': 'Luxo', 'icon': Iconsax.diamonds},
  ];

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1920);
    if (image != null) {
      setState(() {
        _selectedImage = File(image.path);
        _resultImageUrl = null;
      });
    }
  }

  Future<void> _takePhoto() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.camera, maxWidth: 1920);
    if (image != null) {
      setState(() {
        _selectedImage = File(image.path);
        _resultImageUrl = null;
      });
    }
  }

  Future<void> _generate() async {
    if (_selectedImage == null) return;

    setState(() => _isLoading = true);

    try {
      // Upload image first
      final uploadResponse = await widget.apiClient.uploadFile(
        ApiConstants.upload,
        _selectedImage!.path,
      );
      final imageUrl = uploadResponse.data['url'];

      // Generate staging
      final response = await widget.apiClient.post(
        ApiConstants.aiStaging,
        data: {
          'imageUrl': imageUrl,
          'style': _selectedStyle,
          'roomType': 'sala de estar',
        },
      );

      setState(() {
        _resultImageUrl = response.data['outputImageUrl'];
      });
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
        title: const Text('Home Staging'),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppColors.stagingGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  const Icon(Iconsax.brush_1, color: Colors.white, size: 32),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Home Staging Virtual',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'Transforme ambientes vazios em decorados',
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

            // Image selection
            Text('Foto do Ambiente', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),

            if (_selectedImage == null)
              GestureDetector(
                onTap: _pickImage,
                child: Container(
                  height: 220,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Theme.of(context).dividerColor,
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
                      Icon(Iconsax.camera, size: 48, color: AppColors.primary.withValues(alpha: 0.5)),
                      SizedBox(height: 12),
                      Text(
                        'Toque para selecionar uma foto',
                        style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildImageButton(Iconsax.gallery, 'Galeria', _pickImage),
                          const SizedBox(width: 16),
                          _buildImageButton(Iconsax.camera, 'Câmera', _takePhoto),
                        ],
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(delay: 200.ms, duration: 500.ms)
            else
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Image.file(
                      _selectedImage!,
                      height: 220,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: () => setState(() {
                        _selectedImage = null;
                        _resultImageUrl = null;
                      }),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Theme.of(context).brightness == Brightness.dark
                              ? Colors.white.withValues(alpha: 0.2)
                              : Colors.black.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(Iconsax.close_circle, color: Theme.of(context).brightness == Brightness.dark ? Colors.white : Colors.white, size: 20),
                      ),
                    ),
                  ),
                ],
              ),

            const SizedBox(height: 24),

            // Style selection
            Text('Estilo de Decoração', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),

            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: _styles.map((style) {
                final isSelected = _selectedStyle == style['key'];
                return GestureDetector(
                  onTap: () => setState(() => _selectedStyle = style['key']),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary.withValues(alpha: 0.1)
                          : AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          style['icon'] as IconData,
                          size: 18,
                          color: isSelected ? AppColors.primary : Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          style['label'] as String,
                          style: TextStyle(
                            color: isSelected ? AppColors.primary : Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 28),

            // Generate button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: _selectedImage == null || _isLoading ? null : _generate,
                icon: _isLoading
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Theme.of(context).brightness == Brightness.dark ? Colors.white : Colors.white, strokeWidth: 2),
                      )
                    : Icon(Iconsax.magic_star, color: Theme.of(context).brightness == Brightness.dark ? Colors.white : Colors.white),
                label: Text(_isLoading ? 'Gerando...' : 'Gerar Staging'),
              ),
            ),

            // Result
            if (_resultImageUrl != null) ...[
              SizedBox(height: 28),
              Row(
                children: [
                  const Icon(Iconsax.tick_circle, color: AppColors.success, size: 20),
                  SizedBox(width: 8),
                  Text('Resultado', style: Theme.of(context).textTheme.titleMedium),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Image.network(
                  _resultImageUrl!,
                  height: 260,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Text('Imagem salva na galeria!'),
                            backgroundColor: AppColors.success,
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        );
                      },
                      icon: const Icon(Iconsax.document_download),
                      label: const Text('Salvar'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Text('Link copiado! Compartilhe com seu cliente.'),
                            backgroundColor: AppColors.primary,
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        );
                      },
                      icon: const Icon(Iconsax.share),
                      label: const Text('Compartilhar'),
                    ),
                  ),
                ],
              ),
            ],

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildImageButton(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: AppColors.primary),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
