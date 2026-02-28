import 'package:flutter_test/flutter_test.dart';
import 'package:staggio/data/models/property_model.dart';

void main() {
  group('PropertyModel', () {
    test('should create from JSON', () {
      final json = {
        'id': '456',
        'title': 'Casa moderna com piscina',
        'description': 'Linda casa com 3 quartos',
        'type': 'house',
        'status': 'active',
        'price': 850000.0,
        'area': 250.0,
        'bedrooms': 3,
        'bathrooms': 2,
        'parkingSpots': 2,
        'address': 'Rua das Flores, 123',
        'city': 'São Paulo',
        'state': 'SP',
        'neighborhood': 'Jardins',
        'images': ['img1.jpg', 'img2.jpg'],
        'createdAt': '2026-01-15T00:00:00.000Z',
      };

      final property = PropertyModel.fromJson(json);

      expect(property.id, '456');
      expect(property.title, 'Casa moderna com piscina');
      expect(property.type, 'house');
      expect(property.price, 850000.0);
      expect(property.bedrooms, 3);
      expect(property.images.length, 2);
    });

    test('should return correct type display name', () {
      final house = PropertyModel(
        id: '1', title: 'Test', type: 'house', status: 'active',
        images: [], createdAt: DateTime.now(),
      );
      final apartment = PropertyModel(
        id: '2', title: 'Test', type: 'apartment', status: 'active',
        images: [], createdAt: DateTime.now(),
      );
      final land = PropertyModel(
        id: '3', title: 'Test', type: 'land', status: 'active',
        images: [], createdAt: DateTime.now(),
      );
      final commercial = PropertyModel(
        id: '4', title: 'Test', type: 'commercial', status: 'active',
        images: [], createdAt: DateTime.now(),
      );

      expect(house.typeDisplayName, 'Casa');
      expect(apartment.typeDisplayName, 'Apartamento');
      expect(land.typeDisplayName, 'Terreno');
      expect(commercial.typeDisplayName, 'Comercial');
    });

    test('should return correct status display name', () {
      final active = PropertyModel(
        id: '1', title: 'Test', type: 'house', status: 'active',
        images: [], createdAt: DateTime.now(),
      );
      final sold = PropertyModel(
        id: '2', title: 'Test', type: 'house', status: 'sold',
        images: [], createdAt: DateTime.now(),
      );

      expect(active.statusDisplayName, 'Disponível');
      expect(sold.statusDisplayName, 'Vendido');
    });

    test('should format price correctly', () {
      final property = PropertyModel(
        id: '1', title: 'Test', type: 'house', status: 'active',
        price: 850000.0, images: [], createdAt: DateTime.now(),
      );

      expect(property.formattedPrice, contains('850'));
    });

    test('should handle null optional fields', () {
      final property = PropertyModel(
        id: '1', title: 'Test', type: 'land', status: 'active',
        images: [], createdAt: DateTime.now(),
      );

      expect(property.price, isNull);
      expect(property.bedrooms, isNull);
      expect(property.bathrooms, isNull);
      expect(property.area, isNull);
      expect(property.address, isNull);
    });
  });
}
