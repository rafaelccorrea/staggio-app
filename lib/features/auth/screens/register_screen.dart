import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

class RegisterScreen extends StatefulWidget {
  final VoidCallback onLoginTap;

  const RegisterScreen({super.key, required this.onLoginTap});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _creciController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _creciController.dispose();
    super.dispose();
  }

  void _onRegister() {
    if (_formKey.currentState!.validate()) {
      context.read<AuthBloc>().add(AuthRegisterRequested(
            name: _nameController.text.trim(),
            email: _emailController.text.trim(),
            password: _passwordController.text,
            phone: _phoneController.text.isNotEmpty
                ? _phoneController.text.trim()
                : null,
            creci: _creciController.text.isNotEmpty
                ? _creciController.text.trim()
                : null,
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
                const SizedBox(height: 40),

                // Back button
                IconButton(
                  onPressed: widget.onLoginTap,
                  icon: const Icon(Iconsax.arrow_left),
                ),

                const SizedBox(height: 20),

                Text(
                  'Criar Conta',
                  style: Theme.of(context).textTheme.headlineLarge,
                ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.3),

                const SizedBox(height: 8),

                Text(
                  'Comece a usar IA nos seus imóveis',
                  style: Theme.of(context).textTheme.bodyLarge,
                )
                    .animate()
                    .fadeIn(delay: 100.ms, duration: 600.ms)
                    .slideY(begin: 0.3),

                const SizedBox(height: 36),

                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _nameController,
                        textCapitalization: TextCapitalization.words,
                        decoration: InputDecoration(
                          hintText: 'Nome completo',
                          prefixIcon:
                              Icon(Iconsax.user, color: AppColors.textTertiary),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Informe seu nome';
                          }
                          return null;
                        },
                      )
                          .animate()
                          .fadeIn(delay: 200.ms, duration: 500.ms)
                          .slideX(begin: -0.1),

                      const SizedBox(height: 16),

                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          hintText: 'Email',
                          prefixIcon:
                              Icon(Iconsax.sms, color: AppColors.textTertiary),
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
                          .fadeIn(delay: 300.ms, duration: 500.ms)
                          .slideX(begin: -0.1),

                      const SizedBox(height: 16),

                      TextFormField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          hintText: 'Senha (mínimo 6 caracteres)',
                          prefixIcon:
                              Icon(Iconsax.lock, color: AppColors.textTertiary),
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
                          .fadeIn(delay: 400.ms, duration: 500.ms)
                          .slideX(begin: -0.1),

                      const SizedBox(height: 16),

                      TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        decoration: InputDecoration(
                          hintText: 'Telefone (opcional)',
                          prefixIcon:
                              Icon(Iconsax.call, color: AppColors.textTertiary),
                        ),
                      )
                          .animate()
                          .fadeIn(delay: 500.ms, duration: 500.ms)
                          .slideX(begin: -0.1),

                      const SizedBox(height: 16),

                      TextFormField(
                        controller: _creciController,
                        decoration: InputDecoration(
                          hintText: 'CRECI (opcional)',
                          prefixIcon: Icon(Iconsax.card,
                              color: AppColors.textTertiary),
                        ),
                      )
                          .animate()
                          .fadeIn(delay: 600.ms, duration: 500.ms)
                          .slideX(begin: -0.1),

                      const SizedBox(height: 32),

                      BlocBuilder<AuthBloc, AuthState>(
                        builder: (context, state) {
                          return SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton(
                              onPressed:
                                  state is AuthLoading ? null : _onRegister,
                              child: state is AuthLoading
                                  ? const SizedBox(
                                      height: 24,
                                      width: 24,
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2.5,
                                      ),
                                    )
                                  : const Text('Criar Conta Grátis'),
                            ),
                          );
                        },
                      )
                          .animate()
                          .fadeIn(delay: 700.ms, duration: 500.ms)
                          .slideY(begin: 0.3),

                      const SizedBox(height: 24),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Já tem conta? ',
                            style: TextStyle(color: AppColors.textSecondary),
                          ),
                          GestureDetector(
                            onTap: widget.onLoginTap,
                            child: Text(
                              'Fazer login',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 40),
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
