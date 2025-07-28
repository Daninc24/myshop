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
    ],
  },
  {
    id: 'Mobile Phones',
    name: 'Mobile Phones',
    subcategories: [
      { id: 'Smartphones', name: 'Smartphones' },
      { id: 'Feature Phones', name: 'Feature Phones' },
      { id: 'Accessories', name: 'Mobile Accessories' },
    ],
  },
  { id: 'Home & Kitchen', name: 'Home & Kitchen', subcategories: [
      { id: 'Appliances', name: 'Appliances' },
      { id: 'Cookware', name: 'Cookware' },
      { id: 'Furniture', name: 'Furniture' },
      { id: 'Decor', name: 'Decor' },
    ] },
  { id: 'Fashion', name: 'Fashion', subcategories: [
      { id: 'Men', name: 'Men' },
      { id: 'Women', name: 'Women' },
      { id: 'Kids', name: 'Kids' },
      { id: 'Accessories', name: 'Fashion Accessories' },
    ] },
  { id: 'Beauty', name: 'Beauty & Personal Care', subcategories: [
      { id: 'Makeup', name: 'Makeup' },
      { id: 'Skin Care', name: 'Skin Care' },
      { id: 'Hair Care', name: 'Hair Care' },
      { id: 'Fragrances', name: 'Fragrances' },
    ] },
  { id: 'Sports', name: 'Sports' },
  { id: 'Toys', name: 'Toys & Games' },
  { id: 'Books', name: 'Books' },
  { id: 'Automotive', name: 'Automotive' },
  { id: 'Groceries', name: 'Groceries' },
  { id: 'Health', name: 'Health & Wellness' },
  { id: 'Office', name: 'Office Supplies' },
  { id: 'Garden', name: 'Garden & Outdoors' },
  { id: 'Pets', name: 'Pet Supplies' },
  { id: 'Baby', name: 'Baby & Kids' },
  { id: 'Music', name: 'Music & Instruments' },
  { id: 'Art', name: 'Art & Craft' },
  { id: 'Jewelry', name: 'Jewelry' },
  { id: 'Shoes', name: 'Shoes' },
  { id: 'Bags', name: 'Bags & Luggage' },
  { id: 'Watches', name: 'Watches' },
  { id: 'Phones', name: 'Phones & Tablets' },
  { id: 'Gaming', name: 'Gaming' },
  { id: 'Stationery', name: 'Stationery' },
  { id: 'Food', name: 'Food & Beverages' },
  { id: 'Tools', name: 'Tools & Hardware' },
  { id: 'Travel', name: 'Travel' },
  { id: 'Fitness', name: 'Fitness & Exercise' }
];

export default categories;
