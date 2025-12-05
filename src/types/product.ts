
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  weight: number; // em gramas
  rating: number;
  reviews: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
}
