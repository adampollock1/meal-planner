# MealPlanner

A modern, beautiful meal planning web application built with React + Vite. Plan your weekly meals with AI assistance, organize ingredients, and generate smart grocery lists.

## Features

- **AI Meal Planner**: Chat with an AI assistant (powered by Llama 3.1 via Groq) to create personalized meal plans
  - Natural conversation interface
  - Generates complete meals with ingredients
  - One-click add to your meal plan
- **CSV Import**: Import your meal plans from CSV files with drag-and-drop support
- **Weekly & Daily Views**: View your meals in a calendar-style weekly grid or detailed daily format
- **Smart Grocery List**: Automatically generated from your meals with:
  - Ingredients grouped by category (Produce, Dairy, Meat, etc.)
  - Quantities combined across meals
  - Checkable items with progress tracking
  - Print-friendly view
- **Local Storage**: All data persists in your browser - no account needed
- **Responsive Design**: Works beautifully on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up your API key (for AI features):
   - Get a free API key from [Groq Console](https://console.groq.com/)
   - Copy `.env.example` to `.env`
   - Replace `your_api_key_here` with your actual API key

4. Start the development server:

```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## CSV Format

Your meal plan CSV should have these columns:

| Column | Description | Example |
|--------|-------------|---------|
| meal_name | Name of the meal | Scrambled Eggs |
| day | Day of week | Monday |
| meal_type | Breakfast, Lunch, Dinner, or Snack | Breakfast |
| ingredient | Ingredient name | Eggs |
| quantity | Numeric amount | 3 |
| unit | Unit of measurement | pcs |
| category | Grocery category | Dairy & Eggs |

### Example CSV

```csv
meal_name,day,meal_type,ingredient,quantity,unit,category
Scrambled Eggs,Monday,Breakfast,Eggs,3,pcs,Dairy & Eggs
Scrambled Eggs,Monday,Breakfast,Butter,1,tbsp,Dairy & Eggs
Grilled Chicken Salad,Monday,Lunch,Chicken Breast,6,oz,Meat
Grilled Chicken Salad,Monday,Lunch,Mixed Greens,3,cups,Produce
```

### Valid Categories

- Produce
- Dairy & Eggs
- Meat
- Seafood
- Pantry
- Frozen
- Bakery
- Spices
- Beverages
- Other

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **Groq + Llama 3.1** - AI meal planning

## Project Structure

```
src/
├── components/
│   ├── layout/      # Layout components (Sidebar, MobileNav)
│   ├── meals/       # Meal-related components
│   ├── grocery/     # Grocery list components
│   ├── import/      # CSV import components
│   ├── chat/        # AI chat components
│   └── ui/          # Reusable UI components
├── context/         # React Context providers
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API services (Gemini)
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## License

MIT
