import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  bool _emailSent = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _sendResetEmail() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final apiClient = ApiClient();
      await apiClient.post(
        ApiConstants.forgotPassword,
        data: {'email': _emailController.text.trim()},
      );
    } catch (e) {
      // Even if the backend returns an error (e.g., email not found),
      // we show success to avoid leaking whether an email exists.
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
        _emailSent = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF6C5CE7),
              Color(0xFF8B5CF6),
              Color(0xFFEDE9FE),
              Color(0xFFF8F7FF),
            ],
            stops: [0.0, 0.12, 0.35, 0.55],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28),
            child: Column(
              children: [
                const SizedBox(height: 16),

                // Back button
                Align(
                  alignment: Alignment.centerLeft,
                  child: IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Iconsax.arrow_left, color: Colors.white),
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.white.withValues(alpha: 0.15),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Icon
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(28),
                  ),
                  child: Icon(
                    _emailSent ? Iconsax.tick_circle : Iconsax.lock,
                    size: 40,
                    color: Colors.white,
                  ),
                ).animate().fadeIn(duration: 600.ms).scale(
                      begin: const Offset(0.5, 0.5),
                      curve: Curves.elasticOut,
                      duration: 1000.ms,
                    ),

                const SizedBox(height: 24),

                Text(
                  _emailSent ? 'Email Enviado!' : 'Recuperar Senha',
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ).animate().fadeIn(delay: 200.ms, duration: 600.ms),

                const SizedBox(height: 8),

                Text(
                  _emailSent
                      ? 'Verifique sua caixa de entrada'
                      : 'Informe seu email para recuperar',
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.white.withValues(alpha: 0.85),
                  ),
                ).animate().fadeIn(delay: 300.ms, duration: 600.ms),

                const SizedBox(height: 40),

                // Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 30,
                        offset: const Offset(0, 12),
                      ),
                    ],
                  ),
                  child: _emailSent ? _buildSuccessContent() : _buildFormContent(),
                )
                    .animate()
                    .fadeIn(delay: 400.ms, duration: 700.ms)
                    .slideY(begin: 0.15, curve: Curves.easeOutCubic),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFormContent() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Digite seu email',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Enviaremos um link para redefinir sua senha',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 24),

          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            style: const TextStyle(fontSize: 15),
            decoration: InputDecoration(
              labelText: 'Email',
              hintText: 'seu@email.com',
              prefixIcon: Icon(Iconsax.sms,
                  color: AppColors.primary.withValues(alpha: 0.7)),
              filled: true,
              fillColor: const Color(0xFFF8F7FF),
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
            ),
            validator: (v) {
              if (v == null || v.isEmpty) return 'Informe o email';
              if (!v.contains('@')) return 'Email inválido';
              return null;
            },
          ),

          const SizedBox(height: 28),

          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _sendResetEmail,
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
                      'Enviar Link',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessContent() {
    return Column(
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: AppColors.success.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Iconsax.tick_circle,
            color: AppColors.success,
            size: 32,
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'Verifique seu email',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Enviamos um link de recuperação para\n${_emailController.text}',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            color: AppColors.textSecondary,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 28),
        SizedBox(
          width: double.infinity,
          height: 54,
          child: ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 0,
            ),
            child: const Text(
              'Voltar ao Login',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () {
            setState(() => _emailSent = false);
          },
          child: Text(
            'Reenviar email',
            style: TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
