import 'package:equatable/equatable.dart';
import '../../../data/models/property_model.dart';

abstract class PropertiesState extends Equatable {
  const PropertiesState();

  @override
  List<Object?> get props => [];
}

class PropertiesInitial extends PropertiesState {}

class PropertiesLoading extends PropertiesState {}

class PropertiesLoaded extends PropertiesState {
  final List<PropertyModel> properties;
  final List<PropertyModel> filteredProperties;
  final String? activeFilter;

  const PropertiesLoaded({
    required this.properties,
    this.filteredProperties = const [],
    this.activeFilter,
  });

  @override
  List<Object?> get props => [properties, filteredProperties, activeFilter];
}

class PropertiesError extends PropertiesState {
  final String message;

  const PropertiesError({required this.message});

  @override
  List<Object?> get props => [message];
}
