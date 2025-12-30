# 👗 Stylair

Stylair is a smart mobile application for managing a personal digital wardrobe, combining a clean user experience with AI-powered clothing tagging and outfit recommendations.

## ✨ Features

- 📸 **Upload Clothes** - Add items via camera or gallery
- 🏷️ **Smart Tagging** - Automatic categorization: clothing type, color, season, formality
- 👚 **Digital Wardrobe** - Manage your personal closet with ease
- 🤖 **AI Outfit Recommendations** - Get personalized outfit suggestions based on weather
- 🔐 **User Authentication** - Secure login and registration with AWS Cognito
- ☁️ **Cloud Storage** - All your wardrobe data stored securely

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

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- .NET 9.0 SDK
- PostgreSQL database (or Supabase account)
- AWS Cognito user pool

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

3. **Configure AWS Cognito**
   
   Edit `stylair-frontend/services/auth/cognito.ts`:
   ```typescript
   export const poolData = {
     UserPoolId: 'YOUR_USER_POOL_ID',
     ClientId: 'YOUR_CLIENT_ID',
   };
   ```

4. **Start the app**
   ```bash
   npm start
   ```

### Backend Setup

1. **Set environment variable**
   
   **Windows (PowerShell):**
   ```powershell
   $env:DB_PASSWORD="your_database_password"
   ```
   
   **Mac/Linux:**
   ```bash
   export DB_PASSWORD="your_database_password"
   ```

2. **Configure database**
   
   Edit `stylair-api/appsettings.json` with your PostgreSQL connection string.

3. **Run the API**
   ```bash
   cd stylair-api
   dotnet run
   ```
   
   API will be available at `http://localhost:5292`

## 📱 Main Screens

- **Home** - Welcome screen with weather-based recommendations
- **Add Item** - Upload and tag clothing items
- **Choose Today's Look** - AI-powered outfit recommendations
- **My Closet** - View and manage your wardrobe
- **Archive** - View archived items

## 🔧 Configuration

- **API Port:** Default is `5292`
- **Database:** PostgreSQL via Supabase
- **Authentication:** AWS Cognito
- **CORS:** Already configured for frontend access

## 📝 Environment Variables

- `DB_PASSWORD` - PostgreSQL database password (required for backend)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Note:** Make sure to configure your API URL and Cognito credentials before running the application.
