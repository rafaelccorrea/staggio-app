import 'dart:developer' as dev;

import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb;
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../data/models/user_model.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final ApiClient apiClient;
  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);

  AuthBloc({required this.apiClient}) : super(AuthInitial()) {
    on<AuthCheckRequested>(_onCheckRequested);
    on<AuthLoginRequested>(_onLoginRequested);
    on<AuthRegisterRequested>(_onRegisterRequested);
    on<AuthGoogleLoginRequested>(_onGoogleLoginRequested);
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
      final response = await apiClient.post(
        ApiConstants.login,
        data: {
          'email': event.email,
          'password': event.password,
        },
      );

      final body = response.data['data'] ?? response.data;
      final token = body['accessToken'];
      await apiClient.saveToken(token);

      final user = UserModel.fromJson(body['user']);
      dev.log('[AUTH] Login bem-sucedido para: ${user.email}', name: 'AuthBloc');
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      dev.log('[AUTH] Erro no login: $e', name: 'AuthBloc', error: e);
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

  Future<void> _onGoogleLoginRequested(
    AuthGoogleLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    dev.log('[AUTH] Google Sign-In iniciado...', name: 'AuthBloc');
    emit(AuthLoading());
    try {
      // 1. Trigger Google Sign-In flow
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        dev.log('[AUTH] Google Sign-In cancelado pelo usuário', name: 'AuthBloc');
        emit(AuthUnauthenticated());
        return;
      }

      // 2. Get Google auth details
      final googleAuth = await googleUser.authentication;
      dev.log('[AUTH] Google token obtido, autenticando com Firebase...', name: 'AuthBloc');

      // 3. Sign in to Firebase with Google credential
      final credential = fb.GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      final fbUser = await fb.FirebaseAuth.instance.signInWithCredential(credential);
      final idToken = await fbUser.user?.getIdToken();

      if (idToken == null) {
        throw Exception('Não foi possível obter o token do Firebase');
      }

      dev.log('[AUTH] Firebase autenticado, enviando para backend...', name: 'AuthBloc');

      // 4. Send Firebase idToken to our backend
      final response = await apiClient.post(
        ApiConstants.googleAuth,
        data: {
          'idToken': idToken,
          'name': googleUser.displayName ?? 'Usuário Google',
          'email': googleUser.email,
          'avatarUrl': googleUser.photoUrl,
        },
      );

      final body = response.data['data'] ?? response.data;
      final token = body['accessToken'];
      await apiClient.saveToken(token);

      final user = UserModel.fromJson(body['user']);
      dev.log('[AUTH] Google login bem-sucedido para: ${user.email}', name: 'AuthBloc');
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      dev.log('[AUTH] Erro no Google Sign-In: $e', name: 'AuthBloc', error: e);
      String message = 'Erro ao fazer login com Google';
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
    try {
      await _googleSignIn.signOut();
      await fb.FirebaseAuth.instance.signOut();
    } catch (_) {}
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
