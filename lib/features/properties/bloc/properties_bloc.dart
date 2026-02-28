import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../data/models/property_model.dart';
import 'properties_event.dart';
import 'properties_state.dart';

class PropertiesBloc extends Bloc<PropertiesEvent, PropertiesState> {
  final ApiClient apiClient;

  PropertiesBloc({required this.apiClient}) : super(PropertiesInitial()) {
    on<PropertiesLoadRequested>(_onLoadRequested);
    on<PropertyCreateRequested>(_onCreateRequested);
    on<PropertyDeleteRequested>(_onDeleteRequested);
    on<PropertiesSearchRequested>(_onSearchRequested);
    on<PropertiesFilterRequested>(_onFilterRequested);
  }

  Future<void> _onLoadRequested(
    PropertiesLoadRequested event,
    Emitter<PropertiesState> emit,
  ) async {
    emit(PropertiesLoading());
    try {
      final response = await apiClient.get(ApiConstants.properties);
      final List<dynamic> data = response.data is List ? response.data : [];
      final properties = data.map((e) => PropertyModel.fromJson(e)).toList();
      emit(PropertiesLoaded(
        properties: properties,
        filteredProperties: properties,
      ));
    } catch (e) {
      emit(PropertiesError(message: 'Erro ao carregar imóveis: ${e.toString()}'));
    }
  }

  Future<void> _onCreateRequested(
    PropertyCreateRequested event,
    Emitter<PropertiesState> emit,
  ) async {
    try {
      await apiClient.post(ApiConstants.properties, data: event.data);
      add(PropertiesLoadRequested());
    } catch (e) {
      emit(PropertiesError(message: 'Erro ao criar imóvel: ${e.toString()}'));
    }
  }

  Future<void> _onDeleteRequested(
    PropertyDeleteRequested event,
    Emitter<PropertiesState> emit,
  ) async {
    try {
      await apiClient.delete('${ApiConstants.properties}/${event.id}');
      add(PropertiesLoadRequested());
    } catch (e) {
      emit(PropertiesError(message: 'Erro ao excluir imóvel: ${e.toString()}'));
    }
  }

  void _onSearchRequested(
    PropertiesSearchRequested event,
    Emitter<PropertiesState> emit,
  ) {
    if (state is PropertiesLoaded) {
      final currentState = state as PropertiesLoaded;
      final query = event.query.toLowerCase();
      final filtered = currentState.properties.where((p) {
        return p.title.toLowerCase().contains(query) ||
            (p.address?.toLowerCase().contains(query) ?? false) ||
            (p.city?.toLowerCase().contains(query) ?? false) ||
            (p.neighborhood?.toLowerCase().contains(query) ?? false);
      }).toList();
      emit(PropertiesLoaded(
        properties: currentState.properties,
        filteredProperties: filtered,
      ));
    }
  }

  void _onFilterRequested(
    PropertiesFilterRequested event,
    Emitter<PropertiesState> emit,
  ) {
    if (state is PropertiesLoaded) {
      final currentState = state as PropertiesLoaded;
      var filtered = currentState.properties;

      if (event.type != null && event.type!.isNotEmpty) {
        filtered = filtered.where((p) => p.type == event.type).toList();
      }
      if (event.status != null && event.status!.isNotEmpty) {
        filtered = filtered.where((p) => p.status == event.status).toList();
      }

      emit(PropertiesLoaded(
        properties: currentState.properties,
        filteredProperties: filtered,
        activeFilter: event.type,
      ));
    }
  }
}
