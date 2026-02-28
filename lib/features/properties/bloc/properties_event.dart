import 'package:equatable/equatable.dart';

abstract class PropertiesEvent extends Equatable {
  const PropertiesEvent();

  @override
  List<Object?> get props => [];
}

class PropertiesLoadRequested extends PropertiesEvent {}

class PropertyCreateRequested extends PropertiesEvent {
  final Map<String, dynamic> data;

  const PropertyCreateRequested({required this.data});

  @override
  List<Object?> get props => [data];
}

class PropertyDeleteRequested extends PropertiesEvent {
  final String id;

  const PropertyDeleteRequested({required this.id});

  @override
  List<Object?> get props => [id];
}

class PropertiesSearchRequested extends PropertiesEvent {
  final String query;

  const PropertiesSearchRequested({required this.query});

  @override
  List<Object?> get props => [query];
}

class PropertiesFilterRequested extends PropertiesEvent {
  final String? type;
  final String? status;

  const PropertiesFilterRequested({this.type, this.status});

  @override
  List<Object?> get props => [type, status];
}
