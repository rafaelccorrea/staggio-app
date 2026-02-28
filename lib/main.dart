import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/theme/app_theme.dart';
import 'core/network/api_client.dart';
import 'features/auth/bloc/auth_bloc.dart';
import 'features/auth/bloc/auth_event.dart';
import 'features/auth/bloc/auth_state.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/register_screen.dart';
import 'features/onboarding/screens/onboarding_screen.dart';
import 'features/shell/screens/app_shell.dart';

void main() {
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

  runApp(const StaggioApp());
}

class StaggioApp extends StatelessWidget {
  const StaggioApp({super.key});

  @override
  Widget build(BuildContext context) {
    final apiClient = ApiClient();

    return BlocProvider(
      create: (_) => AuthBloc(apiClient: apiClient)..add(AuthCheckRequested()),
      child: MaterialApp(
        title: 'Staggio',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            if (state is AuthInitial || state is AuthLoading) {
              return const _SplashScreen();
            }
            if (state is AuthAuthenticated) {
              return AppShell(user: state.user, apiClient: apiClient);
            }
            return _AuthFlow(apiClient: apiClient);
          },
        ),
      ),
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(32),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3),
                    blurRadius: 30,
                    offset: const Offset(0, 15),
                  ),
                ],
              ),
              child: const Icon(
                Icons.auto_awesome,
                size: 48,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Staggio',
              style: Theme.of(context).textTheme.displayMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'IA para Corretores',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 32),
            const SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthFlow extends StatefulWidget {
  final ApiClient apiClient;

  const _AuthFlow({required this.apiClient});

  @override
  State<_AuthFlow> createState() => _AuthFlowState();
}

class _AuthFlowState extends State<_AuthFlow> {
  bool _showOnboarding = true;
  bool _showLogin = true;

  @override
  Widget build(BuildContext context) {
    if (_showOnboarding) {
      return OnboardingScreen(
        onComplete: () => setState(() => _showOnboarding = false),
      );
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
