# 👗 Stylair

Stylair is a smart mobile application for managing a personal digital wardrobe, combining a clean user experience with AI-powered clothing tagging and outfit recommendations.

## ✨ Features

- 📸 **Upload Clothes** - Add items via camera or gallery
- 🏷️ **Smart Tagging** - AI-powered automatic categorization: clothing type, color, season, style
  - Manual entry option
  - AI image analysis for automatic tagging
- 👚 **Digital Wardrobe** - Manage your personal closet with ease
  - View all items in your closet
  - Edit item details
  - Delete items
- 💬 **AI Outfit Chat** - Interactive chat-based outfit recommendations
  - Context-aware conversations
  - Weather-based suggestions
  - Multiple event handling
  - Item-specific modifications
- 🔐 **User Authentication** - Secure login and registration with AWS Cognito
- ☁️ **Cloud Storage** - All your wardrobe data stored securely in Supabase

## 🛠️ Tech Stack

### Frontend
- React Native with Expo
- TypeScript
- Expo Router
- AWS Cognito for authentication

### Backend
- .NET 9.0 / C#
- ASP.NET Core Web API
- PostgreSQL (Supabase)
- Entity Framework Core
- OpenAI API (for image analysis and outfit recommendations)

## 🚀 Getting Started

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd stylair-frontend
   npm install
   ```

2. **Configure API URL**
   
   Edit `stylair-frontend/constants/config.ts`:
   ```typescript
   export const API_BASE_URL = "http://YOUR_LOCAL_IP:5292";
   ```
   > **Note:** Use your local machine's IP address (not localhost) if testing on a physical device.
   ```

3. **Start the app**
   ```bash
   npm start
   ```

### Backend Setup

1. **Set environment variables**
   
   **Windows (PowerShell):**
   ```powershell
   setx $env:DB_PASSWORD
   setx $env:OPENAI_API_KEY
   ```
   
   **Mac/Linux:**
   ```bash
   export DB_PASSWORD
   export OPENAI_API_KEY
   ```

2. **Run the API**
   ```bash
   cd stylair-api
   dotnet run
   ```
   
   API will be available at `http://localhost:5292`

## 🔧 Configuration

- **API Port:** Default is `5292`
- **Database:** PostgreSQL via Supabase
- **Authentication:** AWS Cognito
- **AI Services:** OpenAI API for image analysis and outfit recommendations

## 📝 Environment Variables

### Backend
- `DB_PASSWORD` - PostgreSQL database password (required)
- `OPENAI_API_KEY` - OpenAI API key for AI features (required for image analysis and outfit chat)

### Frontend
- Configure API URL in `stylair-frontend/constants/config.ts`

## 🎯 Key Features Details

### AI Image Analysis
- Automatically detects clothing category (top, bottom, shoes, accessories, dress)
- Identifies colors, styles, and seasons
- Validates and suggests corrections for better accuracy

### AI Outfit Chat
- Semantic relevance detection (only responds to outfit-related queries)
- Context-aware conversations (remembers previous outfits)
- Item-specific modifications (change only specific items)
- Weather-based recommendations
- Avoids repeating recently saved outfits

---

**Note:** Make sure to configure your API URL, Cognito credentials, and OpenAI API key before running the application.
