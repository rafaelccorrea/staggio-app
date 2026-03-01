import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

class AiPhotoEnhanceScreen extends StatefulWidget {
  final ApiClient apiClient;
  const AiPhotoEnhanceScreen({super.key, required this.apiClient});

  @override
  State<AiPhotoEnhanceScreen> createState() => _AiPhotoEnhanceScreenState();
}

class _AiPhotoEnhanceScreenState extends State<AiPhotoEnhanceScreen> {
  File? _selectedImage;
  String? _resultImageUrl;
  bool _isLoading = false;
  String _selectedEnhancement = 'auto';

  final List<Map<String, dynamic>> _enhancements = [
    {'key': 'auto', 'label': 'Automático', 'icon': Iconsax.magic_star},
    {'key': 'brightness', 'label': 'Iluminação', 'icon': Iconsax.sun_1},
    {'key': 'hdr', 'label': 'HDR', 'icon': Iconsax.image},
    {'key': 'sky', 'label': 'Céu Azul', 'icon': Iconsax.cloud},
    {'key': 'twilight', 'label': 'Crepúsculo', 'icon': Iconsax.moon},
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

  Future<void> _enhance() async {
    if (_selectedImage == null) return;
    setState(() => _isLoading = true);
    try {
      final uploadResponse = await widget.apiClient.uploadFile(
        ApiConstants.upload,
        _selectedImage!.path,
      );
      final imageUrl = uploadResponse.data['url'];

      final response = await widget.apiClient.post(
        ApiConstants.aiPhotoEnhance,
        data: {
          'imageUrl': imageUrl,
          'enhancementType': _selectedEnhancement,
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
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Melhorar Foto'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Info card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: AppColors.cardGradient,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Iconsax.camera, color: Colors.white, size: 22),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Fotos Profissionais',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16),
                        ),
                        Text(
                          'Melhore a qualidade das fotos dos seus imóveis com IA',
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 400.ms),
            const SizedBox(height: 24),

            // Enhancement type selector
            Text('Tipo de Melhoria', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            SizedBox(
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _enhancements.length,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (context, index) {
                  final enhancement = _enhancements[index];
                  final isSelected = enhancement['key'] == _selectedEnhancement;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedEnhancement = enhancement['key']),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : Theme.of(context).cardColor,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : Theme.of(context).dividerColor,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(enhancement['icon'], size: 16, color: isSelected ? Colors.white : AppColors.primary),
                          const SizedBox(width: 6),
                          Text(
                            enhancement['label'],
                            style: TextStyle(
                              color: isSelected ? Colors.white : Theme.of(context).textTheme.bodyMedium?.color,
                              fontWeight: FontWeight.w500,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

            // Image picker
            Text('Foto Original', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            if (_selectedImage == null)
              GestureDetector(
                onTap: _pickImage,
                child: Container(
                  height: 200,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Theme.of(context).cardColor,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Theme.of(context).dividerColor),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Iconsax.gallery_add, size: 48, color: AppColors.primary.withValues(alpha: 0.5)),
                      const SizedBox(height: 12),
                      Text('Toque para selecionar', style: TextStyle(color: Theme.of(context).textTheme.bodySmall?.color)),
                    ],
                  ),
                ),
              )
            else
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Image.file(_selectedImage!, height: 220, width: double.infinity, fit: BoxFit.cover),
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
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.5),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.close, color: Colors.white, size: 18),
                      ),
                    ),
                  ),
                ],
              ),
            if (_selectedImage == null) ...[
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildImageButton(Iconsax.gallery, 'Galeria', _pickImage),
                  const SizedBox(width: 12),
                  _buildImageButton(Iconsax.camera, 'Câmera', _takePhoto),
                ],
              ),
            ],
            const SizedBox(height: 24),

            // Enhance button
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton.icon(
                onPressed: _selectedImage == null || _isLoading ? null : _enhance,
                icon: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Icon(Iconsax.magic_star, color: Colors.white),
                label: Text(_isLoading ? 'Melhorando...' : 'Melhorar Foto'),
              ),
            ),

            // Before/After comparison
            if (_resultImageUrl != null && _selectedImage != null) ...[
              const SizedBox(height: 28),
              Row(
                children: [
                  const Icon(Iconsax.tick_circle, color: AppColors.success, size: 20),
                  const SizedBox(width: 8),
                  Text('Antes e Depois', style: Theme.of(context).textTheme.titleMedium),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.file(_selectedImage!, height: 150, width: double.infinity, fit: BoxFit.cover),
                        ),
                        const SizedBox(height: 6),
                        Text('Antes', style: TextStyle(fontSize: 12, color: Theme.of(context).textTheme.bodySmall?.color)),
                      ],
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Icon(Iconsax.arrow_right_3, color: AppColors.primary),
                  ),
                  Expanded(
                    child: Column(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.network(_resultImageUrl!, height: 150, width: double.infinity, fit: BoxFit.cover),
                        ),
                        const SizedBox(height: 6),
                        Text('Depois', style: TextStyle(fontSize: 12, color: AppColors.success, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ],
              ).animate().fadeIn(duration: 500.ms),
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
                            content: const Text('Link copiado!'),
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
