import 'package:equatable/equatable.dart';

class PropertyModel extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String type;
  final String status;
  final double? price;
  final double? area;
  final int? bedrooms;
  final int? bathrooms;
  final int? parkingSpots;
  final String? address;
  final String? city;
  final String? state;
  final String? neighborhood;
  final List<String> images;
  final List<String> features;
  final String? aiDescription;
  final DateTime? createdAt;

  const PropertyModel({
    required this.id,
    required this.title,
    this.description,
    this.type = 'house',
    this.status = 'available',
    this.price,
    this.area,
    this.bedrooms,
    this.bathrooms,
    this.parkingSpots,
    this.address,
    this.city,
    this.state,
    this.neighborhood,
    this.images = const [],
    this.features = const [],
    this.aiDescription,
    this.createdAt,
  });

  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    return PropertyModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      type: json['type'] ?? 'house',
      status: json['status'] ?? 'available',
      price: json['price'] != null ? double.tryParse(json['price'].toString()) : null,
      area: json['area'] != null ? double.tryParse(json['area'].toString()) : null,
      bedrooms: json['bedrooms'],
      bathrooms: json['bathrooms'],
      parkingSpots: json['parkingSpots'],
      address: json['address'],
      city: json['city'],
      state: json['state'],
      neighborhood: json['neighborhood'],
      images: json['images'] != null ? List<String>.from(json['images']) : [],
      features: json['features'] != null ? List<String>.from(json['features']) : [],
      aiDescription: json['aiDescription'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'type': type,
      'status': status,
      'price': price,
      'area': area,
      'bedrooms': bedrooms,
      'bathrooms': bathrooms,
      'parkingSpots': parkingSpots,
      'address': address,
      'city': city,
      'state': state,
      'neighborhood': neighborhood,
      'features': features,
    };
  }

  String get typeDisplayName {
    switch (type) {
      case 'apartment': return 'Apartamento';
      case 'land': return 'Terreno';
      case 'commercial': return 'Comercial';
      case 'farm': return 'Fazenda';
      default: return 'Casa';
    }
  }

  String get statusDisplayName {
    switch (status) {
      case 'sold': return 'Vendido';
      case 'rented': return 'Alugado';
      case 'inactive': return 'Inativo';
      default: return 'Disponível';
    }
  }

  String get formattedPrice {
    if (price == null) return 'Sob consulta';
    return 'R\$ ${price!.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  @override
  List<Object?> get props => [id, title, status, price];
}
