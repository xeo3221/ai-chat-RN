# AI Chat

A modern mobile chat application built with React Native, Expo, and Appwrite. The app offers a seamless experience for interacting with AI using AI SDK, featuring a clean and intuitive interface, real-time chat functionality, and robust message management.

## Expo GO Demo
![Capture-2025-04-18-194335](https://github.com/user-attachments/assets/f252d401-c10e-472b-926d-7e87ee7fc053)

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#-tech-stack">Tech Stack</a>
    </li>
    <li>
      <a href="#-features">Features</a>
    </li>
    <li>
      <a href="#-getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#-project-structure">Project Structure</a></li>
    <li><a href="#-key-components">Key Components</a></li>
    <li><a href="#-utils">Utils</a></li>
    <li><a href="#-design">Design</a></li>
    <li><a href="#-future-improvements">Future Improvements</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## 🚀 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Backend**: Appwrite

## 🛠 Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI
  ```sh
  npm install -g expo-cli
  ```

### Installation

1. **Clone the repository**

```sh
git clone https://github.com/your-username/ai-chat.git
cd ai-chat
```

2. **Install dependencies**

```sh
npm install
```

- or

```sh
yarn install
```

3. **Set up environment variables**

```sh
cp .env.example .env.local
```

```
# CLERK
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# APPWRITE
EXPO_PUBLIC_APPWRITE_APP_ID=your_appwrite_app_id_here
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_appwrite_database_id_here

# API
EXPO_PUBLIC_API_BASE_URL=your_api_base_url_here

# OPENAI
OPENAI_API_KEY=your_openai_api_key_here

# AI PROVIDERS
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key_here

```

4. **Start the development server**

```sh
npx expo start
```

- or

```sh
yarn expo start
```

## 🎨 Design

The application features a modern, clean design with:

- Minimalist interface
- Responsive layout
- Smooth transitions
- Dark mode
- Custom UI components
![IMG_5504](https://github.com/user-attachments/assets/b78f4c25-afd5-4b60-b1b5-e1a17e931a1e)
![IMG_5505](https://github.com/user-attachments/assets/2da5bb6f-1635-4b86-a7b8-9548659874ac)
![IMG_5507](https://github.com/user-attachments/assets/d836a409-3855-449d-b308-0457b0aafa1c)
![IMG_5509](https://github.com/user-attachments/assets/4d4e3bbb-23d2-4c66-ad3a-a94ec02f427c)
![IMG_5506](https://github.com/user-attachments/assets/29e5abb7-8b0f-47e4-84e2-a072b10346f2)
![IMG_5511](https://github.com/user-attachments/assets/6b679ddb-2baa-421a-9e12-4e018d85f8bb)

  

## 🌟 Features

- **Chat Interface**

  - Clean and intuitive chat interface
  - Real-time message updates
  - Message history management
  - Dark mode

- **Authentication**

  - Secure user authentication
  - Session management
  - Protected routes

- **User Experience**
  - Responsive design
  - Smooth animations
  - Offline support

## 📦 Key Components

- `Button`: Custom button component with various styles and states
- `Input`: Custom input component with validation support
- `Text`: Custom text component with typography styles
- `IconSymbol`: Custom icon component for consistent iconography

## 🔧 Utils

- `appwrite.ts`: Appwrite client configuration and API methods
- `cache.ts`: Local storage and caching utilities
- `colors.ts`: Color palette and theme constants
- `date.ts`: Date formatting and manipulation utilities
- `generate-api-url.ts`: API endpoint generation utilities
- `mock-data.ts`: Development mock data
- `types.ts`: TypeScript type definitions

## 🔮 Future Improvements

- **Enhanced AI Features**

  - Multiple AI model support
  - Custom AI model integration
  - Advanced context management

- **User Features**

  - Profile customization
  - Chat history export
  - Custom AI settings

- **Performance Improvements**
  - Message caching
  - Optimized rendering
  - Better state management

## Acknowledgments

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Appwrite](https://appwrite.io/)
- [TypeScript](https://www.typescriptlang.org/)
