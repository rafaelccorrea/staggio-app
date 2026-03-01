import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'core/contexts/theme_context.dart';
import 'core/network/api_client.dart';
import 'features/auth/bloc/auth_bloc.dart';
import 'features/auth/bloc/auth_event.dart';
import 'features/auth/bloc/auth_state.dart';
import 'features/onboarding/screens/onboarding_screen.dart';
import 'features/shell/screens/app_shell.dart';
import 'data/models/user_model.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('[FIREBASE] Erro ao inicializar: $e');
  }

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0A1628),
      systemNavigationBarIconBrightness: Brightness.light,
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

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        BlocProvider(
          create: (_) => AuthBloc(apiClient: apiClient)..add(AuthCheckRequested()),
        ),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, _) {
          return MaterialApp(
            title: 'Staggio',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeProvider.isDarkMode ? ThemeMode.dark : ThemeMode.light,
            home: _AppRoot(apiClient: apiClient, onboardingDone: onboardingDone),
          );
        },
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
  bool _splashMinTimePassed = false;

  @override
  void initState() {
    super.initState();
    // Minimum splash screen duration of 2.5 seconds
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted) {
        setState(() => _splashMinTimePassed = true);
      }
    });
  }

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
        // Show splash until both auth check is done AND minimum time has passed
        if (!_initialCheckDone || !_splashMinTimePassed || state is AuthInitial) {
          return const _SplashScreen();
        }
        // Show onboarding only on first launch
        if (!widget.onboardingDone) {
          return OnboardingScreen(
            onComplete: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.setBool('onboarding_done', true);
              if (context.mounted) {
                // After onboarding, go to app shell as guest
                Navigator.of(context).pushReplacementNamed('/');
              }
            },
          );
        }
        if (state is AuthAuthenticated) {
          return AppShell(user: state.user, apiClient: widget.apiClient);
        }
        // Lazy login: show app as guest, login prompted on action
        return AppShell(user: UserModel.guest(), apiClient: widget.apiClient);
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
  late AnimationController _glowController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _glowController.dispose();
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
            // Animated glow orb top-right
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
                          const Color(0xFF1E88E5).withValues(alpha: 0.15),
                          const Color(0xFF1E88E5).withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            // Animated glow orb bottom-left
            Positioned(
              bottom: -100,
              left: -100,
              child: AnimatedBuilder(
                animation: _glowController,
                builder: (context, child) {
                  return Container(
                    width: 300 + (_glowController.value * 50),
                    height: 300 + (_glowController.value * 50),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          const Color(0xFF6C5CE7).withValues(alpha: 0.1),
                          const Color(0xFF6C5CE7).withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            // Logo with pulse animation
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ScaleTransition(
                    scale: Tween<double>(begin: 0.8, end: 1.0).animate(
                      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
                    ),
                    child: Image.asset(
                      'assets/images/staggio_logo.png',
                      width: 120,
                      height: 120,
                    ),
                  ),

                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
