import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

class VideoGenerationScreen extends StatefulWidget {
  final ApiClient apiClient;

  const VideoGenerationScreen({super.key, required this.apiClient});

  @override
  State<VideoGenerationScreen> createState() => _VideoGenerationScreenState();
}

class _VideoGenerationScreenState extends State<VideoGenerationScreen> {
  final List<File> _selectedImages = [];
  String? _videoUrl;
  bool _isLoading = false;
  bool _isLoadingStyles = true;
  double _progress = 0;

  // Configurações
  String _selectedStyle = 'cinematic';
  String _selectedTransition = 'crossfade';
  String _selectedResolution = '1080p';
  String _selectedAspectRatio = '16:9';
  double _durationPerImage = 4;
  double _transitionDuration = 1.5;

  // Dados do endpoint /video/styles
  List<Map<String, dynamic>> _styles = [];
  List<Map<String, dynamic>> _transitions = [];
  List<Map<String, dynamic>> _resolutions = [];
  List<Map<String, dynamic>> _aspectRatios = [];
  int _creditsRequired = 3;
  int _maxImages = 20;

  @override
  void initState() {
    super.initState();
    _loadStyles();
  }

  Future<void> _loadStyles() async {
    try {
      final response = await widget.apiClient.get(ApiConstants.videoStyles);
      final data = response.data['data'];

      setState(() {
        _styles = List<Map<String, dynamic>>.from(data['styles']);
        _transitions = List<Map<String, dynamic>>.from(data['transitions']);
        _resolutions = List<Map<String, dynamic>>.from(data['resolutions']);
        _aspectRatios = List<Map<String, dynamic>>.from(data['aspectRatios']);
        _creditsRequired = data['creditsRequired'] ?? 3;
        _maxImages = data['limits']?['maxImages'] ?? 20;
        _isLoadingStyles = false;
      });
    } catch (e) {
      // Fallback com dados padrão
      setState(() {
        _styles = [
          {'id': 'cinematic', 'name': 'Cinematográfico', 'description': 'Tons quentes, aspecto de filme'},
          {'id': 'modern', 'name': 'Moderno', 'description': 'Visual clean e contemporâneo'},
          {'id': 'elegant', 'name': 'Elegante', 'description': 'Suave e sofisticado'},
          {'id': 'warm', 'name': 'Acolhedor', 'description': 'Sensação de lar e conforto'},
        ];
        _transitions = [
          {'id': 'crossfade', 'name': 'Crossfade', 'description': 'Dissolução suave'},
          {'id': 'slide', 'name': 'Deslizar', 'description': 'Desliza para revelar'},
          {'id': 'zoom', 'name': 'Zoom', 'description': 'Zoom suave'},
          {'id': 'wipe', 'name': 'Cortina', 'description': 'Cortina lateral'},
        ];
        _resolutions = [
          {'id': '720p', 'name': 'HD (720p)'},
          {'id': '1080p', 'name': 'Full HD (1080p)'},
        ];
        _aspectRatios = [
          {'id': '16:9', 'name': 'Paisagem (16:9)'},
          {'id': '9:16', 'name': 'Retrato (9:16)'},
          {'id': '1:1', 'name': 'Quadrado (1:1)'},
        ];
        _isLoadingStyles = false;
      });
    }
  }

  Future<void> _pickImages() async {
    final picker = ImagePicker();
    final images = await picker.pickMultiImage(maxWidth: 1920);
    if (images.isNotEmpty) {
      setState(() {
        for (final img in images) {
          if (_selectedImages.length < _maxImages) {
            _selectedImages.add(File(img.path));
          }
        }
      });
    }
  }

  Future<void> _takePhoto() async {
    if (_selectedImages.length >= _maxImages) return;
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.camera, maxWidth: 1920);
    if (image != null) {
      setState(() {
        _selectedImages.add(File(image.path));
      });
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
      _videoUrl = null;
    });
  }

  void _reorderImages(int oldIndex, int newIndex) {
    setState(() {
      if (newIndex > oldIndex) newIndex--;
      final item = _selectedImages.removeAt(oldIndex);
      _selectedImages.insert(newIndex, item);
    });
  }

  Future<void> _generateVideo() async {
    if (_selectedImages.length < 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Selecione pelo menos 2 fotos'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
      _progress = 0;
      _videoUrl = null;
    });

    try {
      // Fase 1: Upload das imagens (0-60%)
      final imageUrls = <String>[];
      for (int i = 0; i < _selectedImages.length; i++) {
        setState(() {
          _progress = (i / _selectedImages.length) * 0.6;
        });

        final uploadResponse = await widget.apiClient.uploadFile(
          ApiConstants.upload,
          _selectedImages[i].path,
        );
        imageUrls.add(uploadResponse.data['url']);
      }

      // Fase 2: Gerar vídeo (60-95%)
      setState(() => _progress = 0.65);

      final response = await widget.apiClient.post(
        ApiConstants.videoGenerate,
        data: {
          'imageUrls': imageUrls,
          'style': _selectedStyle,
          'transition': _selectedTransition,
          'resolution': _selectedResolution,
          'aspectRatio': _selectedAspectRatio,
          'durationPerImage': _durationPerImage,
          'transitionDuration': _transitionDuration,
        },
      );

      setState(() => _progress = 1.0);

      final videoUrl = response.data['data']?['videoUrl'];
      if (videoUrl != null) {
        setState(() {
          _videoUrl = videoUrl;
        });
      }
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
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _openVideo() async {
    if (_videoUrl != null) {
      final uri = Uri.parse(_videoUrl!);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final estimatedDuration = _selectedImages.length * _durationPerImage -
        (_selectedImages.length > 1
            ? (_selectedImages.length - 1) * _transitionDuration
            : 0);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Vídeo Cinematográfico'),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoadingStyles
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  _buildHeader(isDark),
                  const SizedBox(height: 24),

                  // Fotos selecionadas
                  _buildPhotoSection(isDark),
                  const SizedBox(height: 24),

                  // Estilo Visual
                  _buildSectionTitle('Estilo Visual'),
                  const SizedBox(height: 12),
                  _buildOptionSelector(
                    options: _styles,
                    selectedId: _selectedStyle,
                    onSelect: (id) => setState(() => _selectedStyle = id),
                    showDescription: true,
                  ),
                  const SizedBox(height: 24),

                  // Transição
                  _buildSectionTitle('Transição'),
                  const SizedBox(height: 12),
                  _buildOptionSelector(
                    options: _transitions,
                    selectedId: _selectedTransition,
                    onSelect: (id) => setState(() => _selectedTransition = id),
                  ),
                  const SizedBox(height: 24),

                  // Formato
                  _buildSectionTitle('Formato do Vídeo'),
                  const SizedBox(height: 12),
                  _buildOptionSelector(
                    options: _aspectRatios,
                    selectedId: _selectedAspectRatio,
                    onSelect: (id) => setState(() => _selectedAspectRatio = id),
                  ),
                  const SizedBox(height: 24),

                  // Resolução
                  _buildSectionTitle('Resolução'),
                  const SizedBox(height: 12),
                  _buildOptionSelector(
                    options: _resolutions,
                    selectedId: _selectedResolution,
                    onSelect: (id) => setState(() => _selectedResolution = id),
                  ),
                  const SizedBox(height: 24),

                  // Duração por imagem
                  _buildSectionTitle('Duração por Foto: ${_durationPerImage.toStringAsFixed(1)}s'),
                  const SizedBox(height: 8),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: AppColors.primary,
                      inactiveTrackColor: AppColors.primary.withValues(alpha: 0.2),
                      thumbColor: AppColors.primary,
                      overlayColor: AppColors.primary.withValues(alpha: 0.1),
                    ),
                    child: Slider(
                      value: _durationPerImage,
                      min: 2,
                      max: 8,
                      divisions: 12,
                      onChanged: (v) => setState(() => _durationPerImage = v),
                    ),
                  ),

                  // Duração da transição
                  _buildSectionTitle('Duração da Transição: ${_transitionDuration.toStringAsFixed(1)}s'),
                  const SizedBox(height: 8),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: AppColors.primary,
                      inactiveTrackColor: AppColors.primary.withValues(alpha: 0.2),
                      thumbColor: AppColors.primary,
                      overlayColor: AppColors.primary.withValues(alpha: 0.1),
                    ),
                    child: Slider(
                      value: _transitionDuration,
                      min: 0.5,
                      max: 3,
                      divisions: 10,
                      onChanged: (v) => setState(() => _transitionDuration = v),
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Info resumo
                  if (_selectedImages.length >= 2)
                    _buildInfoCard(isDark, estimatedDuration),

                  const SizedBox(height: 24),

                  // Loading progress
                  if (_isLoading) _buildProgressSection(isDark),

                  // Botão gerar
                  if (!_isLoading)
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton.icon(
                        onPressed: _selectedImages.length >= 2 ? _generateVideo : null,
                        icon: const Icon(Iconsax.video, color: Colors.white),
                        label: Text(
                          'Gerar Vídeo ($_creditsRequired créditos)',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),

                  // Resultado
                  if (_videoUrl != null) ...[
                    const SizedBox(height: 24),
                    _buildResultSection(isDark),
                  ],

                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6366F1).withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Iconsax.video, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Vídeo Cinematográfico',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Crie vídeos profissionais com suas fotos',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.85),
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2);
  }

  Widget _buildPhotoSection(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildSectionTitle('Fotos do Imóvel'),
            Text(
              '${_selectedImages.length}/$_maxImages',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          'Arraste para reordenar. A ordem define a sequência do vídeo.',
          style: TextStyle(
            color: isDark ? Colors.white60 : Colors.grey[600],
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 12),

        if (_selectedImages.isEmpty)
          _buildEmptyPhotoArea(isDark)
        else
          _buildPhotoGrid(isDark),

        if (_selectedImages.isNotEmpty && _selectedImages.length < _maxImages) ...[
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildAddButton(
                  icon: Iconsax.gallery,
                  label: 'Galeria',
                  onTap: _pickImages,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildAddButton(
                  icon: Iconsax.camera,
                  label: 'Câmera',
                  onTap: _takePhoto,
                ),
              ),
            ],
          ),
        ],
      ],
    ).animate().fadeIn(delay: 200.ms, duration: 500.ms);
  }

  Widget _buildEmptyPhotoArea(bool isDark) {
    return GestureDetector(
      onTap: _pickImages,
      child: Container(
        height: 200,
        width: double.infinity,
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.grey[100],
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
            Icon(
              Iconsax.gallery_add,
              size: 48,
              color: AppColors.primary.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 12),
            Text(
              'Selecione as fotos do imóvel',
              style: TextStyle(
                color: isDark ? Colors.white60 : Colors.grey[600],
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Mínimo 2, máximo $_maxImages fotos',
              style: TextStyle(
                color: isDark ? Colors.white38 : Colors.grey[400],
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildSmallButton(Iconsax.gallery, 'Galeria', _pickImages),
                const SizedBox(width: 16),
                _buildSmallButton(Iconsax.camera, 'Câmera', _takePhoto),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoGrid(bool isDark) {
    return SizedBox(
      height: 120,
      child: ReorderableListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _selectedImages.length,
        onReorder: _reorderImages,
        proxyDecorator: (child, index, animation) {
          return AnimatedBuilder(
            animation: animation,
            builder: (context, child) {
              return Material(
                elevation: 4,
                borderRadius: BorderRadius.circular(14),
                child: child,
              );
            },
            child: child,
          );
        },
        itemBuilder: (context, index) {
          return Container(
            key: ValueKey(_selectedImages[index].path),
            width: 100,
            margin: const EdgeInsets.only(right: 10),
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: Image.file(
                    _selectedImages[index],
                    width: 100,
                    height: 120,
                    fit: BoxFit.cover,
                  ),
                ),
                // Número da ordem
                Positioned(
                  bottom: 6,
                  left: 6,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        '${index + 1}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
                // Botão remover
                Positioned(
                  top: 4,
                  right: 4,
                  child: GestureDetector(
                    onTap: () => _removeImage(index),
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.close, color: Colors.white, size: 14),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildOptionSelector({
    required List<Map<String, dynamic>> options,
    required String selectedId,
    required Function(String) onSelect,
    bool showDescription = false,
  }) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: options.map((option) {
        final isSelected = selectedId == option['id'];
        return GestureDetector(
          onTap: () => onSelect(option['id']),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.primary.withValues(alpha: 0.1)
                  : AppColors.adaptiveSurface(context),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isSelected ? AppColors.primary : AppColors.adaptiveSurfaceVariant(context),
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  option['name'] ?? '',
                  style: TextStyle(
                    color: isSelected
                        ? AppColors.primary
                        : Theme.of(context).textTheme.bodyMedium?.color,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    fontSize: 14,
                  ),
                ),
                if (showDescription && option['description'] != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    option['description'],
                    style: TextStyle(
                      color: isSelected
                          ? AppColors.primary.withValues(alpha: 0.7)
                          : Theme.of(context).textTheme.bodySmall?.color,
                      fontSize: 11,
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildInfoCard(bool isDark, double estimatedDuration) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
      ),
      child: Column(
        children: [
          _buildInfoRow(Iconsax.image, '${_selectedImages.length} fotos selecionadas'),
          const SizedBox(height: 8),
          _buildInfoRow(Iconsax.timer_1, 'Duração estimada: ${estimatedDuration.toStringAsFixed(1)}s'),
          const SizedBox(height: 8),
          _buildInfoRow(Iconsax.coin, '$_creditsRequired créditos serão consumidos'),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.primary),
        const SizedBox(width: 10),
        Text(
          text,
          style: TextStyle(
            color: AppColors.primary,
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildProgressSection(bool isDark) {
    final statusText = _progress < 0.6
        ? 'Enviando fotos... (${(_progress * 100).toInt()}%)'
        : _progress < 0.95
            ? 'Gerando vídeo cinematográfico...'
            : 'Finalizando...';

    return Container(
      padding: const EdgeInsets.all(24),
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.grey[50],
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        children: [
          SizedBox(
            width: 60,
            height: 60,
            child: CircularProgressIndicator(
              value: _progress > 0.6 ? null : _progress,
              color: AppColors.primary,
              strokeWidth: 4,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            statusText,
            style: TextStyle(
              color: Theme.of(context).textTheme.bodyLarge?.color,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Isso pode levar alguns minutos dependendo\nda quantidade de fotos.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isDark ? Colors.white54 : Colors.grey[500],
              fontSize: 12,
              height: 1.5,
            ),
          ),
          if (_progress <= 0.6) ...[
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: _progress,
                backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                color: AppColors.primary,
                minHeight: 6,
              ),
            ),
          ],
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  Widget _buildResultSection(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF10B981).withValues(alpha: 0.1),
            const Color(0xFF059669).withValues(alpha: 0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFF10B981).withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        children: [
          const Icon(
            Iconsax.tick_circle,
            color: Color(0xFF10B981),
            size: 48,
          ),
          const SizedBox(height: 12),
          const Text(
            'Vídeo Gerado com Sucesso!',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Color(0xFF10B981),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Seu vídeo cinematográfico está pronto.',
            style: TextStyle(
              color: isDark ? Colors.white70 : Colors.grey[600],
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _openVideo,
                  icon: const Icon(Iconsax.play_circle, size: 20),
                  label: const Text('Assistir'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF10B981),
                    side: const BorderSide(color: Color(0xFF10B981)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _openVideo,
                  icon: const Icon(Iconsax.export_1, size: 20, color: Colors.white),
                  label: const Text('Compartilhar'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms).scale(begin: const Offset(0.9, 0.9));
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
    );
  }

  Widget _buildAddButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.adaptiveSurface(context),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.adaptiveSurfaceVariant(context)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: AppColors.primary),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w500,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallButton(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: AppColors.primary),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w500,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
