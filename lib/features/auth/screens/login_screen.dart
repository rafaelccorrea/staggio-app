import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback onRegisterTap;

  const LoginScreen({super.key, required this.onRegisterTap});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onLogin() {
    if (_formKey.currentState!.validate()) {
      context.read<AuthBloc>().add(AuthLoginRequested(
            email: _emailController.text.trim(),
            password: _passwordController.text,
          ));
    }
  }

  @override
  Widget build(BuildContext context) {
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
        },
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 60),

                // Logo
                Center(
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.3),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Iconsax.magic_star,
                      size: 40,
                      color: Colors.white,
                    ),
                  ),
                ).animate().fadeIn(duration: 600.ms).scale(
                      begin: const Offset(0.5, 0.5),
                      curve: Curves.elasticOut,
                      duration: 800.ms,
                    ),

                const SizedBox(height: 40),

                // Welcome text
                Center(
                  child: Text(
                    'Bem-vindo de volta',
                    style: Theme.of(context).textTheme.headlineLarge,
                  ),
                )
                    .animate()
                    .fadeIn(delay: 200.ms, duration: 600.ms)
                    .slideY(begin: 0.3),

                const SizedBox(height: 8),

                Center(
                  child: Text(
                    'Entre na sua conta Staggio',
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                )
                    .animate()
                    .fadeIn(delay: 300.ms, duration: 600.ms)
                    .slideY(begin: 0.3),

                const SizedBox(height: 48),

                // Form
                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      // Email
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          hintText: 'Email',
                          prefixIcon: Icon(
                            Iconsax.sms,
                            color: AppColors.textTertiary,
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Informe seu email';
                          }
                          if (!value.contains('@')) {
                            return 'Email inválido';
                          }
                          return null;
                        },
                      )
                          .animate()
                          .fadeIn(delay: 400.ms, duration: 600.ms)
                          .slideX(begin: -0.1),

                      const SizedBox(height: 16),

                      // Password
                      TextFormField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          hintText: 'Senha',
                          prefixIcon: Icon(
                            Iconsax.lock,
                            color: AppColors.textTertiary,
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword
                                  ? Iconsax.eye_slash
                                  : Iconsax.eye,
                              color: AppColors.textTertiary,
                            ),
                            onPressed: () {
                              setState(
                                  () => _obscurePassword = !_obscurePassword);
                            },
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Informe sua senha';
                          }
                          if (value.length < 6) {
                            return 'Mínimo 6 caracteres';
                          }
                          return null;
                        },
                      )
                          .animate()
                          .fadeIn(delay: 500.ms, duration: 600.ms)
                          .slideX(begin: -0.1),

                      const SizedBox(height: 12),

                      // Forgot password
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {},
                          child: Text(
                            'Esqueceu a senha?',
                            style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Login button
                      BlocBuilder<AuthBloc, AuthState>(
                        builder: (context, state) {
                          return SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton(
                              onPressed:
                                  state is AuthLoading ? null : _onLogin,
                              child: state is AuthLoading
                                  ? const SizedBox(
                                      height: 24,
                                      width: 24,
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2.5,
                                      ),
                                    )
                                  : const Text('Entrar'),
                            ),
                          );
                        },
                      )
                          .animate()
                          .fadeIn(delay: 600.ms, duration: 600.ms)
                          .slideY(begin: 0.3),

                      const SizedBox(height: 32),

                      // Divider
                      Row(
                        children: [
                          Expanded(
                              child: Divider(color: AppColors.surfaceVariant)),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              'ou',
                              style: TextStyle(color: AppColors.textTertiary),
                            ),
                          ),
                          Expanded(
                              child: Divider(color: AppColors.surfaceVariant)),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // Google login button
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: OutlinedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Iconsax.google, size: 22),
                          label: const Text('Continuar com Google'),
                        ),
                      ),

                      const SizedBox(height: 40),

                      // Register link
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Não tem conta? ',
                            style: TextStyle(color: AppColors.textSecondary),
                          ),
                          GestureDetector(
                            onTap: widget.onRegisterTap,
                            child: Text(
                              'Criar conta',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600,
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
          ),
        ),
      ),
    );
  }
}
