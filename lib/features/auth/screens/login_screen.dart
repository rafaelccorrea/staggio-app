import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import 'forgot_password_screen.dart';
import '../../../core/services/biometric_service.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback onRegisterTap;

  const LoginScreen({super.key, required this.onRegisterTap});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _biometricAvailable = false;
  late AnimationController _glowController;

  @override
  void initState() {
    super.initState();
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    )..repeat(reverse: true);
    _checkBiometric();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  Future<void> _checkBiometric() async {
    final available = await BiometricService.isAvailable();
    final enabled = await BiometricService.isEnabled();
    if (mounted) {
      setState(() => _biometricAvailable = available && enabled);
    }
  }

  Future<void> _onBiometricLogin() async {
    try {
      final credentials = await BiometricService.authenticate();
      if (credentials != null && mounted) {
        // Trigger login with biometric credentials
        context.read<AuthBloc>().add(AuthLoginRequested(
          email: credentials['email']!,
          password: credentials['password']!,
        ));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Erro ao usar biometria'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
      }
    }
  }

  void _onLogin() {
    if (_formKey.currentState!.validate()) {
      context.read<AuthBloc>().add(AuthLoginRequested(
            email: _emailController.text.trim(),
            password: _passwordController.text,
          ));
    }
  }

  void _onGoogleLogin() {
    context.read<AuthBloc>().add(AuthGoogleLoginRequested());
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.error,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            );
          }
          if (state is AuthAuthenticated) {
            // Save credentials for biometric login
            BiometricService.saveCredentials(
              email: _emailController.text.trim(),
              password: _passwordController.text,
            );
            // Navigate to home (app shell will handle this via main.dart)
            Navigator.of(context).pushReplacementNamed('/');
          }
        },
        child: Container(
          width: double.infinity,
          height: double.infinity,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF0A1628),
                Color(0xFF0D2137),
                Color(0xFF0F2B46),
                Color(0xFF0A1628),
              ],
              stops: [0.0, 0.3, 0.6, 1.0],
            ),
          ),
          child: Stack(
            children: [
              // Animated gradient orb top-right
              Positioned(
                top: -60,
                right: -60,
                child: AnimatedBuilder(
                  animation: _glowController,
                  builder: (context, child) {
                    return Container(
                      width: 200 + (_glowController.value * 30),
                      height: 200 + (_glowController.value * 30),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            const Color(0xFF1E88E5)
                                .withValues(alpha: 0.12 + _glowController.value * 0.08),
                            const Color(0xFF1E88E5).withValues(alpha: 0.0),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              // Animated gradient orb bottom-left
              Positioned(
                bottom: -80,
                left: -80,
                child: AnimatedBuilder(
                  animation: _glowController,
                  builder: (context, child) {
                    return Container(
                      width: 250 + (_glowController.value * 40),
                      height: 250 + (_glowController.value * 40),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            const Color(0xFF26A69A)
                                .withValues(alpha: 0.1 + _glowController.value * 0.06),
                            const Color(0xFF26A69A).withValues(alpha: 0.0),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              // Main content
              SafeArea(
                child: SingleChildScrollView(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight:
                          size.height - MediaQuery.of(context).padding.top,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 28),
                      child: Column(
                        children: [
                          SizedBox(height: size.height * 0.06),

                          // Logo with glow
                          AnimatedBuilder(
                            animation: _glowController,
                            builder: (context, child) {
                              return Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(32),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF1E88E5).withValues(
                                        alpha: 0.15 +
                                            (_glowController.value * 0.1),
                                      ),
                                      blurRadius:
                                          30 + (_glowController.value * 15),
                                      spreadRadius: 3,
                                    ),
                                    BoxShadow(
                                      color: const Color(0xFF26A69A).withValues(
                                        alpha: 0.1 +
                                            (_glowController.value * 0.08),
                                      ),
                                      blurRadius:
                                          50 + (_glowController.value * 20),
                                      spreadRadius: 8,
                                    ),
                                  ],
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(28),
                                  child: Image.asset(
                                    'assets/images/staggio_icon.png',
                                    width: 100,
                                    height: 100,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              );
                            },
                          )
                              .animate()
                              .fadeIn(duration: 600.ms)
                              .scale(
                                begin: const Offset(0.5, 0.5),
                                curve: Curves.elasticOut,
                                duration: 1000.ms,
                              ),

                          const SizedBox(height: 20),

                          // App name
                          const Text(
                            'Staggio',
                            style: TextStyle(
                              fontSize: 34,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              fontFamily: 'Poppins',
                              letterSpacing: -1,
                            ),
                          )
                              .animate()
                              .fadeIn(delay: 200.ms, duration: 600.ms),

                          const SizedBox(height: 6),

                          // Tagline with gradient
                          ShaderMask(
                            shaderCallback: (bounds) =>
                                const LinearGradient(
                              colors: [
                                Color(0xFF64B5F6),
                                Color(0xFF4DD0E1),
                              ],
                            ).createShader(bounds),
                            child: const Text(
                              'IA para Corretores de Imóveis',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.white,
                                fontWeight: FontWeight.w500,
                                letterSpacing: 0.5,
                              ),
                            ),
                          )
                              .animate()
                              .fadeIn(delay: 300.ms, duration: 600.ms),

                          SizedBox(height: size.height * 0.04),

                          // Login card - frosted glass effect
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.06),
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.1),
                                width: 1,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Theme.of(context).brightness == Brightness.dark ? Colors.black.withValues(alpha: 0.2 * 0.3) : Colors.black.withValues(alpha: 0.2),
                                  blurRadius: 30,
                                  offset: const Offset(0, 10),
                                ),
                              ],
                            ),
                            child: Form(
                              key: _formKey,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Bem-vindo de volta',
                                    style: TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Faça login para continuar',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.white
                                          .withValues(alpha: 0.5),
                                    ),
                                  ),
                                  const SizedBox(height: 28),

                                  // Email field
                                  TextFormField(
                                    controller: _emailController,
                                    keyboardType:
                                        TextInputType.emailAddress,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      color: Colors.white,
                                    ),
                                    decoration: _inputDecoration(
                                      label: 'Email',
                                      hint: 'seu@email.com',
                                      icon: Iconsax.sms,
                                    ),
                                    validator: (v) {
                                      if (v == null || v.isEmpty) {
                                        return 'Informe o email';
                                      }
                                      if (!v.contains('@')) {
                                        return 'Email inválido';
                                      }
                                      return null;
                                    },
                                  ),

                                  const SizedBox(height: 16),

                                  // Password field
                                  TextFormField(
                                    controller: _passwordController,
                                    obscureText: _obscurePassword,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      color: Colors.white,
                                    ),
                                    decoration: _inputDecoration(
                                      label: 'Senha',
                                      hint: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
                                      icon: Iconsax.lock,
                                      suffixIcon: IconButton(
                                        icon: Icon(
                                          _obscurePassword
                                              ? Iconsax.eye_slash
                                              : Iconsax.eye,
                                          color: Colors.white
                                              .withValues(alpha: 0.4),
                                          size: 20,
                                        ),
                                        onPressed: () => setState(() =>
                                            _obscurePassword =
                                                !_obscurePassword),
                                      ),
                                    ),
                                    validator: (v) {
                                      if (v == null || v.isEmpty) {
                                        return 'Informe a senha';
                                      }
                                      if (v.length < 6) {
                                        return 'Mínimo 6 caracteres';
                                      }
                                      return null;
                                    },
                                  ),

                                  const SizedBox(height: 12),

                                  // Forgot password
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: TextButton(
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) =>
                                                const ForgotPasswordScreen(),
                                          ),
                                        );
                                      },
                                      style: TextButton.styleFrom(
                                        padding: EdgeInsets.zero,
                                        minimumSize: const Size(0, 0),
                                        tapTargetSize:
                                            MaterialTapTargetSize
                                                .shrinkWrap,
                                      ),
                                      child: const Text(
                                        'Esqueceu a senha?',
                                        style: TextStyle(
                                          color: Color(0xFF64B5F6),
                                          fontSize: 13,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                  ),

                                  const SizedBox(height: 20),

                                  // Login button with gradient
                                  BlocBuilder<AuthBloc, AuthState>(
                                    builder: (context, state) {
                                      return SizedBox(
                                        width: double.infinity,
                                        height: 54,
                                        child: DecoratedBox(
                                          decoration: BoxDecoration(
                                            gradient:
                                                const LinearGradient(
                                              colors: [
                                                Color(0xFF1E88E5),
                                                Color(0xFF00ACC1),
                                              ],
                                            ),
                                            borderRadius:
                                                BorderRadius.circular(16),
                                            boxShadow: [
                                              BoxShadow(
                                                color: const Color(
                                                        0xFF1E88E5)
                                                    .withValues(
                                                        alpha: 0.3),
                                                blurRadius: 12,
                                                offset:
                                                    const Offset(0, 6),
                                              ),
                                            ],
                                          ),
                                          child: ElevatedButton(
                                            onPressed:
                                                state is AuthLoading
                                                    ? null
                                                    : _onLogin,
                                            style:
                                                ElevatedButton.styleFrom(
                                              backgroundColor:
                                                  Colors.transparent,
                                              shadowColor:
                                                  Colors.transparent,
                                              foregroundColor:
                                                  Colors.white,
                                              shape:
                                                  RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(
                                                        16),
                                              ),
                                            ),
                                            child: state is AuthLoading
                                                ? const SizedBox(
                                                    width: 22,
                                                    height: 22,
                                                    child:
                                                        CircularProgressIndicator(
                                                      color: Colors.white,
                                                      strokeWidth: 2.5,
                                                    ),
                                                  )
                                                : const Text(
                                                    'Entrar',
                                                    style: TextStyle(
                                                      fontSize: 16,
                                                      fontWeight:
                                                          FontWeight.w600,
                                                    ),
                                                  ),
                                          ),
                                        ),
                                      );
                                    },
                                  ),

                                  const SizedBox(height: 24),

                                  // Divider
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Divider(
                                          color: Colors.white
                                              .withValues(alpha: 0.1),
                                        ),
                                      ),
                                      Padding(
                                        padding:
                                            const EdgeInsets.symmetric(
                                                horizontal: 16),
                                        child: Text(
                                          'ou continue com',
                                          style: TextStyle(
                                            color: Colors.white
                                                .withValues(alpha: 0.35),
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        child: Divider(
                                          color: Colors.white
                                              .withValues(alpha: 0.1),
                                        ),
                                      ),
                                    ],
                                  ),

                                  const SizedBox(height: 24),

                                  // Google Sign-In button
                                  SizedBox(
                                    width: double.infinity,
                                    height: 52,
                                    child: OutlinedButton.icon(
                                      onPressed: _onGoogleLogin,
                                      icon: Image.network(
                                        'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
                                        width: 20,
                                        height: 20,
                                        errorBuilder:
                                            (context, error, stackTrace) {
                                          return const Icon(
                                            Icons.g_mobiledata_rounded,
                                            size: 24,
                                            color: Colors.white,
                                          );
                                        },
                                      ),
                                      label: const Text(
                                        'Continuar com Google',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: Colors.white,
                                        padding:
                                            const EdgeInsets.symmetric(
                                                vertical: 14),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(14),
                                        ),
                                        side: BorderSide(
                                          color: Colors.white
                                              .withValues(alpha: 0.15),
                                        ),
                                      ),
                                    ),
                                  ),

                                  const SizedBox(height: 12),

                                  // Apple Sign-In button
                                  SizedBox(
                                    width: double.infinity,
                                    height: 52,
                                    child: OutlinedButton.icon(
                                      onPressed: () {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(
                                            content: const Text(
                                                'Login com Apple em breve!'),
                                            behavior:
                                                SnackBarBehavior.floating,
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(
                                                      12),
                                            ),
                                          ),
                                        );
                                      },
                                      icon: const Icon(Icons.apple,
                                          size: 22),
                                      label: const Text(
                                        'Continuar com Apple',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: Colors.white,
                                        padding:
                                            const EdgeInsets.symmetric(
                                                vertical: 14),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(14),
                                        ),
                                        side: BorderSide(
                                          color: Colors.white
                                              .withValues(alpha: 0.15),
                                        ),
                                      ),
                                    ),
                                  ),

                                  // Biometric login button
                                  if (_biometricAvailable) ...[
                                    const SizedBox(height: 12),
                                    SizedBox(
                                      width: double.infinity,
                                      height: 52,
                                      child: OutlinedButton.icon(
                                        onPressed: _onBiometricLogin,
                                        icon: const Icon(Icons.fingerprint, size: 22),
                                        label: const Text(
                                          'Entrar com Biometria',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(vertical: 14),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(14),
                                          ),
                                          side: BorderSide(
                                            color: const Color(0xFF1E88E5).withValues(alpha: 0.4),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          )
                              .animate()
                              .fadeIn(delay: 400.ms, duration: 700.ms)
                              .slideY(
                                  begin: 0.15,
                                  curve: Curves.easeOutCubic),

                          const SizedBox(height: 28),

                          // Register link
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Não tem conta? ',
                                style: TextStyle(
                                  color:
                                      Colors.white.withValues(alpha: 0.5),
                                  fontSize: 14,
                                ),
                              ),
                              GestureDetector(
                                onTap: widget.onRegisterTap,
                                child: const Text(
                                  'Criar conta',
                                  style: TextStyle(
                                    color: Color(0xFF64B5F6),
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          )
                              .animate()
                              .fadeIn(delay: 600.ms, duration: 600.ms),

                          const SizedBox(height: 32),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration({
    required String label,
    required String hint,
    required IconData icon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(
        color: Colors.white.withValues(alpha: 0.5),
        fontSize: 14,
      ),
      hintText: hint,
      hintStyle: TextStyle(
        color: Colors.white.withValues(alpha: 0.2),
      ),
      prefixIcon: Icon(
        icon,
        color: const Color(0xFF64B5F6).withValues(alpha: 0.7),
      ),
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: Colors.white.withValues(alpha: 0.05),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(
          color: Colors.white.withValues(alpha: 0.08),
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: Color(0xFF1E88E5),
          width: 1.5,
        ),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.error, width: 1.5),
      ),
      errorStyle: const TextStyle(color: AppColors.error),
    );
  }
}
