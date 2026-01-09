# Overview

Goat Bot V2 is a comprehensive Facebook Messenger chatbot built with Node.js that operates using a personal Facebook account through an unofficial Facebook API. The bot provides extensive command handling, event management, user/thread data management, and a web-based dashboard for configuration. It supports multiple database backends (JSON, SQLite, MongoDB) and includes features like automated uptime monitoring, Google Drive integration, and extensive customization options.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Architecture
The application follows a modular architecture with clear separation of concerns:

- **Entry Point**: `index.js` serves as the main entry point, spawning the main bot process (`Goat.js`) with automatic restart capabilities
- **Main Bot Logic**: `Goat.js` handles initialization, configuration validation, and core bot startup
- **Modular Design**: Separated into distinct modules for bot functionality, dashboard, database operations, and utilities

## Bot Framework
- **Event-Driven Architecture**: The bot uses an event-driven model to handle incoming messages, reactions, and Facebook events
- **Command System**: Modular command system with dynamic loading from the `scripts/cmds/` directory
- **Event Handlers**: Separate event handlers in `scripts/events/` for non-command interactions
- **Handler Chain**: Multi-layered handler system including authentication, data validation, and command execution

## Database Layer
- **Multi-Database Support**: Flexible database abstraction supporting JSON files, SQLite, and MongoDB
- **Data Controllers**: Centralized data controllers for users, threads, dashboard, and global data
- **Task Queue System**: Implements task queuing for database operations to prevent conflicts
- **Auto-Sync**: Optional automatic synchronization with Facebook thread data

## Authentication & Security
- **Facebook Authentication**: Uses unofficial Facebook API with cookie-based authentication
- **Multi-Login Methods**: Supports email/password, cookie-based, and token-based login
- **Dashboard Authentication**: Separate authentication system for web dashboard access
- **Role-Based Access**: Hierarchical permission system (bot admin, thread admin, regular user)

## Web Dashboard
- **Express.js Backend**: Full-featured web interface for bot management
- **Session Management**: Secure session handling with passport.js
- **File Management**: Integration with Google Drive for file storage and management
- **Real-time Features**: Socket.io integration for real-time updates
- **Responsive UI**: Bootstrap-based responsive interface

## External Integrations
- **Google Services**: Deep integration with Google Drive API and Gmail for notifications
- **reCAPTCHA**: Google reCAPTCHA integration for security
- **Social Media**: Support for various social media content fetching
- **Uptime Monitoring**: Built-in uptime monitoring with external service integration

## Configuration Management
- **Environment-Aware**: Separate configurations for development and production
- **Hot Reloading**: Dynamic configuration updates without restart
- **Command Configuration**: Granular per-command configuration system
- **Global Settings**: Centralized global configuration management

## Error Handling & Logging
- **Comprehensive Logging**: Multi-level logging system with timestamps and color coding
- **Error Recovery**: Automatic restart mechanisms and error recovery
- **Notification System**: Email and Telegram notifications for critical errors
- **Debug Support**: Built-in debugging and development tools

# External Dependencies

## Core Dependencies
- **Node.js Runtime**: Requires Node.js 16.x+ for execution
- **Facebook Chat API**: Custom unofficial Facebook API (`fb-chat-api`) for Messenger integration
- **Express.js**: Web server framework for dashboard functionality

## Database Systems
- **MongoDB**: Optional NoSQL database with Mongoose ODM
- **SQLite**: Local database option using Sequelize ORM
- **JSON Files**: Simple file-based storage option

## Google Services
- **Google Drive API**: File storage and management through Google Drive
- **Gmail API**: Email notifications and verification codes
- **Google reCAPTCHA**: Bot protection and user verification

## Authentication & Security
- **Passport.js**: Authentication middleware for dashboard
- **bcrypt**: Password hashing and validation
- **express-session**: Session management for web interface

## Communication & Notifications
- **Nodemailer**: Email sending capabilities
- **Socket.io**: Real-time web communication
- **MQTT**: Message queuing for Facebook API communication

## Utility Services
- **Axios**: HTTP client for API requests
- **Cheerio**: HTML parsing and web scraping
- **Moment.js**: Date and time manipulation
- **Canvas**: Image processing and generation

## Development & Monitoring
- **Socket.io**: Real-time monitoring capabilities
- **Express Rate Limiting**: API rate limiting and protection
- **File Upload**: Multi-part file upload handling
- **CORS**: Cross-origin resource sharing support

## Media Processing
- **ytdl-core**: YouTube video downloading
- **Canvas**: Image manipulation and generation
- **Mime-DB**: File type detection and handling

## External Monitoring
- **Uptime Services**: Integration with UptimeRobot or Better Stack for monitoring
- **Replit/Glitch**: Cloud hosting platform compatibility
- **Telegram Bot API**: Alternative notification channel