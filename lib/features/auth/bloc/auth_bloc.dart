import 'dart:developer' as dev;

import 'package:dio/dio.dart';
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
    dev.log('[AUTH] Verificando token salvo...', name: 'AuthBloc');
    final token = await apiClient.getToken();
    if (token == null) {
      dev.log('[AUTH] Nenhum token encontrado → unauthenticated', name: 'AuthBloc');
      emit(AuthUnauthenticated());
      return;
    }

    dev.log('[AUTH] Token encontrado, verificando com /me...', name: 'AuthBloc');
    try {
      final response = await apiClient.get(ApiConstants.me);
      final body = response.data['data'] ?? response.data;
      final user = UserModel.fromJson(body);
      dev.log('[AUTH] Token válido, usuário: ${user.email}', name: 'AuthBloc');
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      dev.log('[AUTH] Token inválido, limpando: $e', name: 'AuthBloc', error: e);
      await apiClient.clearToken();
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    dev.log('[AUTH] Login iniciado para: ${event.email}', name: 'AuthBloc');
    emit(AuthLoading());
    try {
      dev.log('[AUTH] POST ${ApiConstants.baseUrl}${ApiConstants.login}', name: 'AuthBloc');

      final response = await apiClient.post(
        ApiConstants.login,
        data: {
          'email': event.email,
          'password': event.password,
        },
      );

      dev.log('[AUTH] Resposta recebida - status: ${response.statusCode}', name: 'AuthBloc');
      dev.log('[AUTH] Body: ${response.data}', name: 'AuthBloc');

      final body = response.data['data'] ?? response.data;
      dev.log('[AUTH] Body desempacotado: $body', name: 'AuthBloc');

      final token = body['accessToken'];
      dev.log('[AUTH] Token: ${token != null ? "${token.toString().substring(0, 20)}..." : "NULL"}', name: 'AuthBloc');

      await apiClient.saveToken(token);

      final user = UserModel.fromJson(body['user']);
      dev.log('[AUTH] Login bem-sucedido para: ${user.email}', name: 'AuthBloc');
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      dev.log('[AUTH] Erro no login: $e', name: 'AuthBloc', error: e);
      if (e is DioException) {
        dev.log('[AUTH] DioException type: ${e.type}', name: 'AuthBloc');
        dev.log('[AUTH] DioException status: ${e.response?.statusCode}', name: 'AuthBloc');
        dev.log('[AUTH] DioException response: ${e.response?.data}', name: 'AuthBloc');
        dev.log('[AUTH] DioException message: ${e.message}', name: 'AuthBloc');
      }
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

      final body = response.data['data'] ?? response.data;
      final token = body['accessToken'];
      await apiClient.saveToken(token);

      final user = UserModel.fromJson(body['user']);
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
      if (error is DioException) {
        final response = error.response;
        if (response != null) {
          final body = response.data;
          if (body is Map) {
            return body['message']?.toString() ??
                body['data']?['message']?.toString() ??
                'Credenciais inválidas';
          }
        }
        if (error.type == DioExceptionType.connectionTimeout ||
            error.type == DioExceptionType.receiveTimeout ||
            error.type == DioExceptionType.connectionError) {
          return 'Sem conexão com o servidor. Verifique sua internet.';
        }
      }
      return 'Erro inesperado. Tente novamente.';
    } catch (_) {
      return 'Erro inesperado';
    }
  }
}
