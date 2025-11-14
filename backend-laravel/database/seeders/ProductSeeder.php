<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // Electronics
            [
                'name' => 'iPhone 15 Pro',
                'description' => 'Le dernier iPhone avec puce A17 Pro, appareil photo 48MP et écran Super Retina XDR de 6.1 pouces. Design en titane premium.',
                'price' => 1229.00,
                'stock' => 50,
                'category' => 'Electronics',
                'image' => 'iphone-15-pro.jpg',
                'active' => true,
            ],
            [
                'name' => 'MacBook Pro 14"',
                'description' => 'MacBook Pro avec puce M3 Pro, 18GB RAM, 512GB SSD. Écran Liquid Retina XDR. Parfait pour les créatifs et développeurs.',
                'price' => 2499.00,
                'stock' => 30,
                'category' => 'Electronics',
                'image' => 'macbook-pro.jpg',
                'active' => true,
            ],
            [
                'name' => 'AirPods Pro 2',
                'description' => 'Écouteurs sans fil avec réduction de bruit active avancée, son spatial personnalisé et étui de charge USB-C.',
                'price' => 279.00,
                'stock' => 100,
                'category' => 'Electronics',
                'image' => 'airpods-pro.jpg',
                'active' => true,
            ],
            [
                'name' => 'iPad Air M2',
                'description' => 'iPad Air avec puce M2, écran Liquid Retina 10.9", compatible Apple Pencil. Idéal pour la créativité et la productivité.',
                'price' => 699.00,
                'stock' => 45,
                'category' => 'Electronics',
                'image' => 'ipad-air.jpg',
                'active' => true,
            ],
            [
                'name' => 'Apple Watch Series 9',
                'description' => 'Montre connectée avec écran toujours actif, suivi santé avancé, GPS et résistance à l\'eau. Plusieurs couleurs disponibles.',
                'price' => 449.00,
                'stock' => 60,
                'category' => 'Electronics',
                'image' => 'apple-watch.jpg',
                'active' => true,
            ],

            // Fashion
            [
                'name' => 'Nike Air Max 90',
                'description' => 'Sneakers iconiques avec unité Air visible, design rétro et confort optimal. Disponible en plusieurs coloris.',
                'price' => 139.99,
                'stock' => 75,
                'category' => 'Fashion',
                'image' => 'nike-airmax.jpg',
                'active' => true,
            ],
            [
                'name' => 'Levi\'s 501 Original',
                'description' => 'Le jean emblématique depuis 1873. Coupe droite, 100% coton denim, boutons à la braguette. Un classique intemporel.',
                'price' => 89.99,
                'stock' => 120,
                'category' => 'Fashion',
                'image' => 'levis-501.jpg',
                'active' => true,
            ],
            [
                'name' => 'Ray-Ban Wayfarer',
                'description' => 'Lunettes de soleil iconiques avec monture en acétate et verres cristal. Protection UV 100%. Style indémodable.',
                'price' => 159.00,
                'stock' => 85,
                'category' => 'Fashion',
                'image' => 'rayban-wayfarer.jpg',
                'active' => true,
            ],

            // Home & Living
            [
                'name' => 'Dyson V15 Detect',
                'description' => 'Aspirateur sans fil avec technologie laser pour révéler la poussière invisible. Autonomie 60 minutes, filtration HEPA.',
                'price' => 699.00,
                'stock' => 35,
                'category' => 'Home',
                'image' => 'dyson-v15.jpg',
                'active' => true,
            ],
            [
                'name' => 'Nespresso Vertuo Next',
                'description' => 'Machine à café avec technologie Centrifusion. Prépare 5 tailles de tasses différentes. Design compact et élégant.',
                'price' => 179.00,
                'stock' => 55,
                'category' => 'Home',
                'image' => 'nespresso.jpg',
                'active' => true,
            ],
            [
                'name' => 'Philips Hue Starter Kit',
                'description' => 'Kit d\'éclairage connecté avec 3 ampoules LED couleur et pont. Contrôle via app, compatible Alexa et Google Home.',
                'price' => 199.99,
                'stock' => 40,
                'category' => 'Home',
                'image' => 'philips-hue.jpg',
                'active' => true,
            ],

            // Sports & Fitness
            [
                'name' => 'Peloton Bike+',
                'description' => 'Vélo d\'appartement connecté avec écran rotatif 24", accès aux cours en direct et à la demande. Résistance automatique.',
                'price' => 2495.00,
                'stock' => 15,
                'category' => 'Sports',
                'image' => 'peloton-bike.jpg',
                'active' => true,
            ],
            [
                'name' => 'Tapis de Yoga Premium',
                'description' => 'Tapis de yoga antidérapant 6mm, en TPE écologique. Avec sac de transport. Idéal pour yoga, pilates et fitness.',
                'price' => 49.99,
                'stock' => 90,
                'category' => 'Sports',
                'image' => 'yoga-mat.jpg',
                'active' => true,
            ],

            // Books & Media
            [
                'name' => 'Kindle Paperwhite',
                'description' => 'Liseuse avec écran 6.8" sans reflet, éclairage ajustable automatiquement. Étanche IPX8, 16GB de stockage.',
                'price' => 149.99,
                'stock' => 70,
                'category' => 'Books',
                'image' => 'kindle-paperwhite.jpg',
                'active' => true,
            ],
            [
                'name' => 'Sony WH-1000XM5',
                'description' => 'Casque audio sans fil avec la meilleure réduction de bruit du marché. Son Hi-Res, autonomie 30h, confort premium.',
                'price' => 399.00,
                'stock' => 45,
                'category' => 'Electronics',
                'image' => 'sony-wh1000xm5.jpg',
                'active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
