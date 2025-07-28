// Centralized categories array for Navbar, Home, Products, etc.
const categories = [
  { id: 'all', name: 'All Products' },
  {
    id: 'Electronics',
    name: 'Electronics',
    subcategories: [
      { id: 'TVs', name: 'TVs' },
      { id: 'Audio', name: 'Audio' },
      { id: 'Cameras', name: 'Cameras & Photography' },
      { id: 'Wearables', name: 'Wearables' },
      { id: 'Smart Home', name: 'Smart Home Devices' },
      { id: 'Drones', name: 'Drones' },
    ],
  },
  {
    id: 'Computers & Laptops',
    name: 'Computers & Laptops',
    subcategories: [
      { id: 'Laptops', name: 'Laptops' },
      { id: 'Desktops', name: 'Desktops' },
      { id: 'Monitors', name: 'Monitors' },
      { id: 'Components', name: 'Components' },
      { id: 'Accessories', name: 'Computer Accessories' },
      { id: 'Printers', name: 'Printers & Scanners' },
    ],
  },
  {
    id: 'Mobile Phones',
    name: 'Mobile Phones',
    subcategories: [
      { id: 'Smartphones', name: 'Smartphones' },
      { id: 'Feature Phones', name: 'Feature Phones' },
      { id: 'Accessories', name: 'Mobile Accessories' },
      { id: 'Tablets', name: 'Tablets' },
    ],
  },
  { id: 'Home & Kitchen', name: 'Home & Kitchen', subcategories: [
      { id: 'Appliances', name: 'Appliances' },
      { id: 'Cookware', name: 'Cookware' },
      { id: 'Furniture', name: 'Furniture' },
      { id: 'Decor', name: 'Decor' },
      { id: 'Lighting', name: 'Lighting' },
      { id: 'Storage', name: 'Storage & Organization' },
    ] },
  { id: 'Fashion', name: 'Fashion', subcategories: [
      { id: 'Men', name: 'Men' },
      { id: 'Women', name: 'Women' },
      { id: 'Kids', name: 'Kids' },
      { id: 'Accessories', name: 'Fashion Accessories' },
      { id: 'Shoes', name: 'Shoes' },
      { id: 'Jewelry', name: 'Jewelry' },
      { id: 'Bags', name: 'Bags & Luggage' },
      { id: 'Watches', name: 'Watches' },
    ] },
  { id: 'Beauty', name: 'Beauty & Personal Care', subcategories: [
      { id: 'Makeup', name: 'Makeup' },
      { id: 'Skin Care', name: 'Skin Care' },
      { id: 'Hair Care', name: 'Hair Care' },
      { id: 'Fragrances', name: 'Fragrances' },
      { id: 'Tools', name: 'Beauty Tools' },
    ] },
  { id: 'Sports', name: 'Sports', subcategories: [
      { id: 'Outdoor', name: 'Outdoor Sports' },
      { id: 'Indoor', name: 'Indoor Sports' },
      { id: 'Fitness', name: 'Fitness Equipment' },
      { id: 'Team Sports', name: 'Team Sports' },
    ] },
  { id: 'Toys', name: 'Toys & Games', subcategories: [
      { id: 'Educational', name: 'Educational Toys' },
      { id: 'Board Games', name: 'Board Games' },
      { id: 'Action Figures', name: 'Action Figures' },
      { id: 'Puzzles', name: 'Puzzles' },
    ] },
  { id: 'Books', name: 'Books', subcategories: [
      { id: 'Fiction', name: 'Fiction' },
      { id: 'Non-Fiction', name: 'Non-Fiction' },
      { id: 'Children', name: 'Children Books' },
      { id: 'Comics', name: 'Comics & Graphic Novels' },
    ] },
  { id: 'Automotive', name: 'Automotive', subcategories: [
      { id: 'Car Accessories', name: 'Car Accessories' },
      { id: 'Motorcycle', name: 'Motorcycle Parts' },
      { id: 'Tools', name: 'Automotive Tools' },
    ] },
  { id: 'Groceries', name: 'Groceries', subcategories: [
      { id: 'Beverages', name: 'Beverages' },
      { id: 'Snacks', name: 'Snacks' },
      { id: 'Pantry', name: 'Pantry Staples' },
      { id: 'Fresh', name: 'Fresh Produce' },
    ] },
  { id: 'Health', name: 'Health & Wellness', subcategories: [
      { id: 'Supplements', name: 'Supplements' },
      { id: 'Medical', name: 'Medical Supplies' },
      { id: 'Personal Care', name: 'Personal Care' },
    ] },
  { id: 'Office', name: 'Office Supplies', subcategories: [
      { id: 'Stationery', name: 'Stationery' },
      { id: 'Electronics', name: 'Office Electronics' },
      { id: 'Furniture', name: 'Office Furniture' },
    ] },
  { id: 'Garden', name: 'Garden & Outdoors', subcategories: [
      { id: 'Plants', name: 'Plants' },
      { id: 'Tools', name: 'Garden Tools' },
      { id: 'Outdoor Furniture', name: 'Outdoor Furniture' },
    ] },
  { id: 'Pets', name: 'Pet Supplies', subcategories: [
      { id: 'Food', name: 'Pet Food' },
      { id: 'Toys', name: 'Pet Toys' },
      { id: 'Grooming', name: 'Pet Grooming' },
    ] },
  { id: 'Baby', name: 'Baby & Kids', subcategories: [
      { id: 'Clothing', name: 'Clothing' },
      { id: 'Gear', name: 'Baby Gear' },
      { id: 'Toys', name: 'Baby Toys' },
    ] },
  { id: 'Music', name: 'Music & Instruments', subcategories: [
      { id: 'Instruments', name: 'Instruments' },
      { id: 'Audio', name: 'Audio Equipment' },
      { id: 'Sheet Music', name: 'Sheet Music' },
    ] },
  { id: 'Art', name: 'Art & Craft', subcategories: [
      { id: 'Supplies', name: 'Art Supplies' },
      { id: 'Crafts', name: 'Crafts & DIY' },
      { id: 'Painting', name: 'Painting' },
    ] },
  { id: 'Gaming', name: 'Gaming', subcategories: [
      { id: 'Consoles', name: 'Consoles' },
      { id: 'Games', name: 'Video Games' },
      { id: 'Accessories', name: 'Gaming Accessories' },
    ] },
  { id: 'Travel', name: 'Travel', subcategories: [
      { id: 'Luggage', name: 'Luggage' },
      { id: 'Travel Accessories', name: 'Travel Accessories' },
      { id: 'Outdoor', name: 'Outdoor & Adventure' },
    ] },
];

export default categories;
