import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../data/models/user_model.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final ApiClient apiClient;

  AuthBloc({required this.apiClient}) : super(AuthInitial()) {
    on<AuthCheckRequested>(_onCheckRequested);
    on<AuthLoginRequested>(_onLoginRequested);
    on<AuthRegisterRequested>(_onRegisterRequested);
    on<AuthLogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    final token = await apiClient.getToken();
    if (token == null) {
      emit(AuthUnauthenticated());
      return;
    }

    try {
      final response = await apiClient.get(ApiConstants.me);
      final user = UserModel.fromJson(response.data);
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      await apiClient.clearToken();
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final response = await apiClient.post(
        ApiConstants.login,
        data: {
          'email': event.email,
          'password': event.password,
        },
      );

      final token = response.data['accessToken'];
      await apiClient.saveToken(token);

      final user = UserModel.fromJson(response.data['user']);
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      String message = 'Erro ao fazer login';
      if (e is Exception) {
        message = _extractErrorMessage(e);
      }
      emit(AuthError(message: message));
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onRegisterRequested(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final response = await apiClient.post(
        ApiConstants.register,
        data: {
          'name': event.name,
          'email': event.email,
          'password': event.password,
          if (event.phone != null) 'phone': event.phone,
          if (event.creci != null) 'creci': event.creci,
        },
      );

      final token = response.data['accessToken'];
      await apiClient.saveToken(token);

      final user = UserModel.fromJson(response.data['user']);
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      String message = 'Erro ao criar conta';
      if (e is Exception) {
        message = _extractErrorMessage(e);
      }
      emit(AuthError(message: message));
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await apiClient.clearToken();
    emit(AuthUnauthenticated());
  }

  String _extractErrorMessage(dynamic error) {
    try {
      if (error.toString().contains('DioException')) {
        return 'Erro de conexão. Verifique sua internet.';
      }
      return 'Credenciais inválidas';
    } catch (_) {
      return 'Erro inesperado';
    }
  }
}
