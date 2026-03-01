import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/theme/app_theme.dart';
import 'core/network/api_client.dart';
import 'features/auth/bloc/auth_bloc.dart';
import 'features/auth/bloc/auth_event.dart';
import 'features/auth/bloc/auth_state.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/register_screen.dart';
import 'features/onboarding/screens/onboarding_screen.dart';
import 'features/shell/screens/app_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: AppColors.surface,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  final prefs = await SharedPreferences.getInstance();
  final onboardingDone = prefs.getBool('onboarding_done') ?? false;

  runApp(StaggioApp(onboardingDone: onboardingDone));
}

class StaggioApp extends StatelessWidget {
  final bool onboardingDone;

  const StaggioApp({super.key, this.onboardingDone = false});

  @override
  Widget build(BuildContext context) {
    final apiClient = ApiClient();

    return BlocProvider(
      create: (_) => AuthBloc(apiClient: apiClient)..add(AuthCheckRequested()),
      child: MaterialApp(
        title: 'Staggio',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: _AppRoot(apiClient: apiClient, onboardingDone: onboardingDone),
      ),
    );
  }
}

class _AppRoot extends StatefulWidget {
  final ApiClient apiClient;
  final bool onboardingDone;

  const _AppRoot({required this.apiClient, required this.onboardingDone});

  @override
  State<_AppRoot> createState() => _AppRootState();
}

class _AppRootState extends State<_AppRoot> {
  bool _initialCheckDone = false;

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
      listenWhen: (previous, current) =>
          current is AuthAuthenticated || current is AuthUnauthenticated,
      listener: (context, state) {
        setState(() => _initialCheckDone = true);
      },
      buildWhen: (previous, current) =>
          current is AuthInitial ||
          current is AuthAuthenticated ||
          current is AuthUnauthenticated,
      builder: (context, state) {
        if (!_initialCheckDone || state is AuthInitial) {
          return const _SplashScreen();
        }
        if (state is AuthAuthenticated) {
          return AppShell(user: state.user, apiClient: widget.apiClient);
        }
        return _AuthFlow(
          apiClient: widget.apiClient,
          onboardingDone: widget.onboardingDone,
        );
      },
    );
  }
}

class _SplashScreen extends StatefulWidget {
  const _SplashScreen();

  @override
  State<_SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<_SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _rotateController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    _rotateController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    )..repeat();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _rotateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0A1628),
              Color(0xFF0D2137),
              Color(0xFF0F2B46),
            ],
          ),
        ),
        child: Stack(
          children: [
            Positioned(
              top: -80,
              right: -80,
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  return Container(
                    width: 250 + (_pulseController.value * 30),
                    height: 250 + (_pulseController.value * 30),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          AppColors.primary.withValues(alpha: 0.15),
                          AppColors.primary.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            Positioned(
              bottom: -100,
              left: -100,
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  return Container(
                    width: 300 + (_pulseController.value * 40),
                    height: 300 + (_pulseController.value * 40),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          AppColors.accent.withValues(alpha: 0.1),
                          AppColors.accent.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Color(0xFF1E88E5),
                          Color(0xFF00ACC1),
                          Color(0xFF26A69A),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(36),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.4),
                          blurRadius: 40,
                          offset: const Offset(0, 20),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        'S',
                        style: TextStyle(
                          fontSize: 56,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          fontFamily: 'Poppins',
                          letterSpacing: -2,
                        ),
                      ),
                    ),
                  )
                      .animate()
                      .fadeIn(duration: 800.ms)
                      .scale(
                        begin: const Offset(0.3, 0.3),
                        end: const Offset(1.0, 1.0),
                        curve: Curves.elasticOut,
                        duration: 1200.ms,
                      ),
                  const SizedBox(height: 32),
                  const Text(
                    'Staggio',
                    style: TextStyle(
                      fontSize: 42,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      fontFamily: 'Poppins',
                      letterSpacing: -1.5,
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 400.ms, duration: 600.ms)
                      .slideY(begin: 0.5),
                  const SizedBox(height: 8),
                  const Text(
                    'IA para Corretores de Imóveis',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w400,
                      color: Color(0xFF90CAF9),
                      letterSpacing: 0.5,
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 700.ms, duration: 600.ms)
                      .slideY(begin: 0.3),
                  const SizedBox(height: 56),
                  SizedBox(
                    width: 36,
                    height: 36,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      color: AppColors.primary.withValues(alpha: 0.7),
                    ),
                  ).animate().fadeIn(delay: 1000.ms, duration: 500.ms),
                  const SizedBox(height: 16),
                  const Text(
                    'Carregando...',
                    style: TextStyle(
                      fontSize: 13,
                      color: Color(0xFF64B5F6),
                      fontWeight: FontWeight.w400,
                    ),
                  ).animate().fadeIn(delay: 1200.ms, duration: 500.ms),
                ],
              ),
            ),
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: const Text(
                'v1.0.0',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  color: Color(0xFF546E7A),
                ),
              ).animate().fadeIn(delay: 1500.ms, duration: 500.ms),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthFlow extends StatefulWidget {
  final ApiClient apiClient;
  final bool onboardingDone;

  const _AuthFlow({required this.apiClient, required this.onboardingDone});

  @override
  State<_AuthFlow> createState() => _AuthFlowState();
}

class _AuthFlowState extends State<_AuthFlow> {
  late bool _showOnboarding;
  bool _showLogin = true;

  @override
  void initState() {
    super.initState();
    _showOnboarding = !widget.onboardingDone;
  }

  Future<void> _completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding_done', true);
    setState(() => _showOnboarding = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_showOnboarding) {
      return OnboardingScreen(onComplete: _completeOnboarding);
    }

    if (_showLogin) {
      return LoginScreen(
        onRegisterTap: () => setState(() => _showLogin = false),
      );
    }

    return RegisterScreen(
      onLoginTap: () => setState(() => _showLogin = true),
    );
  }
}
