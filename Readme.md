# CloudThat Demos Platform

The CloudThat Demos Platform is an interactive React-based web application that showcases live demonstrations of AWS and cloud technology solutions. This comprehensive platform serves as a centralized hub for experiencing CloudThat's expertise across various domains including artificial intelligence, healthcare technology, and enterprise applications.

## Key Capabilities

- **Multi-Domain Demonstrations**: GenAI, PharmaBot, OCR processing, Interview tracking, Real-time analytics
- **User Authentication**: Secure login system powered by AWS Cognito
- **Interactive Experiences**: Live demos with real-time processing and feedback
- **Admin Management**: Content management panel for demo configurations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Document Processing**: PDF generation, file uploads, and data extraction
- **Modern UI/UX**: Built with React, Vite, and Tailwind CSS

## Available Demos

| Demo | Description | Path |
|------|-------------|------|
| **IntelliDoc** | AI-powered document processing platform | `/intellidoc` |
| **Vistora** | Smart video creation platform | `/vistora` |
| **VendorIQ** | Supplier cost management system | `/vendoriq` |
| **GenAI Docs** | Intelligent document automation | `/genai/doc` |
| **QUESTA** | AI-powered assessment platform | `/questa` |
| **Generative AI Resumes** | Dynamic resume analysis platform | `/genai/resumes` |
| **Data Orchestration** | Enterprise knowledge management | `https://datasymphonys.movetoaws.com` |
| **ElevateSEO** | AI-powered SEO optimization | `/elevateseo` |
| **SOW Automation** | Automated statement of work creation | `https://d1ev4685a7dj0s.cloudfront.net/` |
| **MINIQ** | Content analysis and insights platform | `https://d21f3o8hvyitp3.cloudfront.net` |
| **Arogya Mitra** | AI healthcare assistant | `/arogya-mitra` |
| **HiRE** | AI hiring assistant | `/hire` |
| **VOCAL** | Real-time call center analytics | `/vocal` |
| **Data Mosaic** | Business intelligence platform | `/quicksight` |

## Tech Stack

### Frontend Architecture
- **React 18**: Modern component-based architecture for scalable UI development
- **Vite**: Fast build tool with hot module replacement for improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for consistent, responsive design
- **React Router**: Client-side routing for single-page application navigation
- **UI Components**: Lucide Icons, React Icons

### Component Structure
- **Modular Design**: Each demo module (GenAI, PharmaBot, OCR) as independent components
- **Layout System**: Flexible layouts supporting sidebar, top navigation, and responsive designs



## AWS Architecture

The platform leverages AWS cloud services following AWS Well-Architected Framework principles, utilizing managed services to minimize operational overhead while ensuring high availability and performance.

### AWS Services Used

- **Amazon S3** - Static website hosting and asset storage
- **AWS Lambda** - Serverless backend functions for demo data processing and management
- **Amazon DynamoDB** - NoSQL database for storing project data, industry information, and demo configurations
- **Amazon API Gateway** - RESTful API endpoints for frontend-backend communication
- **Amazon SES** - Email notifications and demo booking communication
- **Amazon CloudFront** - Content Delivery Network (CDN) for global performance
- **AWS Cognito** - User authentication and authorization
- **AWS CodeBuild** - Compile, build, and package both frontend and backend code
- **AWS CodePipeline** - Orchestration layer for GitLab integration and deployment automation
- **AWS IAM** - Access control and permissions management
- **AWS Route 53** - DNS management for custom domain

### Architecture Flow

1. **User Access**: End users access through browser with static content delivered via CloudFront backed by S3
2. **Authentication**: Cognito handles user authentication
3. **API Gateway**: Validates tokens using Cognito Authorizer and routes requests to Lambda functions
4. **Backend Processing**: Lambda functions process business logic and interact with DynamoDB
5. **Email Notifications**: SES handles email communications for demo bookings and notifications
6. **CI/CD Pipeline**: GitLab triggers CodePipeline which uses CodeBuild for automated deployments

## Prerequisites

- Node.js 18+
- npm or yarn
- AWS account (for deployment)


### Installation

```bash
# Clone the repository
git clone <repository-url>
cd demos.cloudthat.com

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build the application
npm run build
```
This creates a `dist` folder with production-ready files.

 ## Deployment

Deployment for both frontend and backend is fully automated using **AWS CodePipeline** and **AWS CodeBuild**.

### CI/CD Workflow

1. **Commit to GitLab**
   - Any push to the configured branch triggers the pipeline.

2. **Source Stage (CodePipeline)**
   - Pulls the latest code from the GitLab repository.

3. **Build Stage (CodeBuild)**
   - Installs dependencies
   - Builds the React application
   - Packages Lambda backend functions

4. **Deploy Stage**
   - Uploads the frontend build output to the designated **S3 bucket**
   - Updates **CloudFront** distribution (cache invalidation)
   - Deploys backend Lambda artifacts

5. **Validation**
   - Health checks
   - Post-deployment verification


## Project Structure

```
src/
├── AdminPanel/          # Admin dashboard and management
├── AIContentVideoGenerator/  # AI content creation tools
├── ArogyaMitra/        # Healthcare management system
├── assets/             # Static assets (CSS, fonts, images, JSON)
├── base-components/    # Base UI components (accordion, alert, chart, etc.)
├── components/         # Shared UI components
├── config/             # Configuration files (API, Auth, endpoints)
├── Context/            # React context providers
├── EY/                 # EY-specific demo pages
├── Fintech/            # Fintech demo pages
├── GenAi/              # Generative AI demonstrations
├── GenAI_JAM/          # GenAI JAM demo pages
├── GenAIStack/         # GenAI Stack demo pages
├── hooks/              # Custom React hooks
├── InterviewTrack/     # AI recruitment platform
├── ITC/                # ITC-specific demo pages
├── layouts/            # Application layouts
├── Metropolis/         # Metropolis demo pages
├── NTT/                # NTT-specific demo pages
├── Observability/      # Observability demo pages
├── OCR/                # Document processing tools
├── PharmaBot/          # Healthcare chatbot
├── router/             # Application routing
├── RTCCA/              # Call center analytics
├── SEOOptimization/    # SEO content tools
├── stores/             # State management stores
├── utils/              # Utility functions
├── views/              # Main application views
├── Wipro/              # Wipro-specific demo pages
├── App.css             # Main application styles
├── App.jsx             # Main application component
├── CustomMauticForm.jsx # Custom form component
├── Dashboard.jsx       # Main dashboard component
├── ForgotPassword.jsx  # Password reset component
├── index.css           # Global styles
├── Login.jsx           # Login component
├── main.jsx            # Application entry point
├── PdfViewer.jsx       # PDF viewer component
├── polyfills.ts        # Browser polyfills
└── TestDashboard.jsx   # Test dashboard component
```

## Configuration

### Environment Setup
Configure AWS Amplify authentication in `src/config/AuthConfig.jsx`

### Resources Deployed

#### AWS Lambda Functions
- **demos-user-dashboard**: Handles demo booking requests, project retrieval, and email notifications
- **demos-admin-dashboard**: Complete backend controller for project management, industry operations, media uploads, and infrastructure deployment

#### AWS S3 Buckets
- **demos-revamp**: Stores project images, industry GIFs, and other media assets with organized folder structure

#### Amazon DynamoDB Tables
- **demos-dashboard**: Stores project metadata, industry mappings, stakeholder information, and deployment configurations

#### CI/CD Resources
- **CodeBuild**: `demos` - Installs dependencies, runs production build, packages Lambda functions
- **CodePipeline**: `demos.cloudthat.com` - Automates deployment flow from GitLab to AWS

## Authentication

The platform uses AWS Cognito for comprehensive authentication:
- **User Pool**: Centralized user management with email verification
- **Identity Pool**: Federated identities for AWS service access
- **JWT Tokens**: Secure authentication flow with automatic token refresh
- **Role-Based Access**: Admin panel access control based on user attributes
- **Session Management**: Automatic token refresh and secure logout

## Contributing 
1. Fork the repository 
2. Create a feature branch 
3. Commit changes following conventional commits 
4. Submit a pull request
