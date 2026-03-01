import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../data/models/user_model.dart';

class EditProfileScreen extends StatefulWidget {
  final UserModel? user;
  final ApiClient? apiClient;

  const EditProfileScreen({super.key, this.user, this.apiClient});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;
  late final TextEditingController _creciController;
  late final ApiClient _apiClient;
  bool _isLoading = false;
  bool _isLoadingProfile = true;
  UserModel? _currentUser;

  @override
  void initState() {
    super.initState();
    _apiClient = widget.apiClient ?? ApiClient();
    _nameController = TextEditingController();
    _emailController = TextEditingController();
    _phoneController = TextEditingController();
    _creciController = TextEditingController();

    if (widget.user != null) {
      _populateFields(widget.user!);
      _isLoadingProfile = false;
    } else {
      _loadProfile();
    }
  }

  void _populateFields(UserModel user) {
    _currentUser = user;
    _nameController.text = user.name;
    _emailController.text = user.email;
    _phoneController.text = user.phone ?? '';
    _creciController.text = user.creci ?? '';
  }

  Future<void> _loadProfile() async {
    try {
      final response = await _apiClient.get(ApiConstants.profile);
      final body = response.data;
      final data = body is Map && body.containsKey('data') ? body['data'] : body;
      final user = UserModel.fromJson(data as Map<String, dynamic>);
      if (mounted) {
        setState(() {
          _populateFields(user);
          _isLoadingProfile = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingProfile = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Erro ao carregar perfil'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  Future<void> _pickAvatar() async {
    try {
      final picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 85,
      );
      if (image == null || !mounted) return;
      setState(() => _isLoading = true);
      final response = await _apiClient.uploadFile(
        ApiConstants.upload,
        image.path,
        folder: 'avatars',
      );
      final body = response.data;
      String? url;
      if (body is Map) {
        url = body['data']?['url'] ?? body['url'] ?? body['data']?['publicUrl'] ?? body['publicUrl'];
      }
      if (url != null) {
        await _apiClient.patch(ApiConstants.updateProfile, data: {'avatarUrl': url});
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Foto atualizada!'),
              backgroundColor: AppColors.success,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Erro ao atualizar foto'),
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

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final data = <String, dynamic>{};
      if (_nameController.text.trim() != (_currentUser?.name ?? '')) {
        data['name'] = _nameController.text.trim();
      }
      if (_phoneController.text.trim() != (_currentUser?.phone ?? '')) {
        data['phone'] = _phoneController.text.trim();
      }
      if (_creciController.text.trim() != (_currentUser?.creci ?? '')) {
        data['creci'] = _creciController.text.trim();
      }

      if (data.isNotEmpty) {
        await _apiClient.patch(ApiConstants.updateProfile, data: data);
      }

      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Perfil atualizado com sucesso!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao atualizar: ${e.toString()}'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _creciController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingProfile) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8F7FF),
        appBar: AppBar(
          title: const Text('Editar Perfil'),
          leading: IconButton(
            icon: const Icon(Iconsax.arrow_left),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F7FF),
      appBar: AppBar(
        title: const Text('Editar Perfil'),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _saveProfile,
            child: _isLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(
                    'Salvar',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Avatar
            Center(
              child: Stack(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(32),
                    ),
                    child: _currentUser?.avatarUrl != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(32),
                            child: Image.network(
                              _currentUser!.avatarUrl!,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Center(
                                child: Text(
                                  _currentUser?.name.isNotEmpty == true
                                      ? _currentUser!.name[0].toUpperCase()
                                      : 'S',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 40,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),
                          )
                        : Center(
                            child: Text(
                              _currentUser?.name.isNotEmpty == true
                                  ? _currentUser!.name[0].toUpperCase()
                                  : 'S',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 40,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: GestureDetector(
                      onTap: _pickAvatar,
                      child: Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white, width: 3),
                        ),
                        child: const Icon(Iconsax.camera, color: Colors.white, size: 18),
                      ),
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 500.ms).scale(begin: const Offset(0.8, 0.8)),

            const SizedBox(height: 32),

            // Form fields
            _buildField(
              controller: _nameController,
              label: 'Nome Completo',
              icon: Iconsax.user,
              validator: (v) => v == null || v.isEmpty ? 'Informe o nome' : null,
            ).animate().fadeIn(delay: 200.ms, duration: 500.ms),

            const SizedBox(height: 16),

            _buildField(
              controller: _emailController,
              label: 'Email',
              icon: Iconsax.sms,
              keyboardType: TextInputType.emailAddress,
              enabled: false,
              validator: (v) {
                if (v == null || v.isEmpty) return 'Informe o email';
                if (!v.contains('@')) return 'Email inválido';
                return null;
              },
            ).animate().fadeIn(delay: 300.ms, duration: 500.ms),

            const SizedBox(height: 16),

            _buildField(
              controller: _phoneController,
              label: 'Telefone',
              icon: Iconsax.call,
              keyboardType: TextInputType.phone,
            ).animate().fadeIn(delay: 400.ms, duration: 500.ms),

            const SizedBox(height: 16),

            _buildField(
              controller: _creciController,
              label: 'CRECI',
              icon: Iconsax.card,
            ).animate().fadeIn(delay: 500.ms, duration: 500.ms),

            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2.5,
                        ),
                      )
                    : const Text(
                        'Salvar Alterações',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ).animate().fadeIn(delay: 600.ms, duration: 500.ms),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
    int maxLines = 1,
    bool enabled = true,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      enabled: enabled,
      style: TextStyle(
        fontSize: 15,
        color: enabled ? AppColors.textPrimary : AppColors.textTertiary,
      ),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.primary.withValues(alpha: 0.7)),
        filled: true,
        fillColor: enabled ? Colors.white : const Color(0xFFF0F0F0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: AppColors.surfaceVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: AppColors.primary, width: 1.5),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: AppColors.surfaceVariant),
        ),
        suffixIcon: !enabled
            ? Icon(Iconsax.lock, size: 18, color: AppColors.textTertiary)
            : null,
      ),
      validator: validator,
    );
  }
}
