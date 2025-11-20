<div align="center">

# 🏥 Veil: Decentralized Medical Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Blockchain-purple?style=for-the-badge&logo=ethereum)](https://ethereum.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE.md)

**Empowering Healthcare Through Blockchain Technology**

[Live Demo](https://veil-org.vercel.app) · [Report Bug](https://github.com/rohansen856/Veil/issues) · [Request Feature](https://github.com/rohansen856/Veil/issues)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Smart Contracts](#-smart-contracts)
- [Zero-Knowledge Proofs](#-zero-knowledge-proofs)
- [User Guides](#-user-guides)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [Security](#-security)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 Overview

**Veil** is a revolutionary decentralized healthcare platform that leverages blockchain technology and zero-knowledge proofs to transform how medical data is managed, shared, and secured. Built on Ethereum-compatible networks, Veil empowers patients with complete ownership of their health records while enabling healthcare providers to deliver secure, transparent, and efficient care globally.

### Why Veil?

Traditional healthcare systems face critical challenges:
- **Data Silos**: Medical records scattered across different providers
- **Privacy Concerns**: Centralized databases vulnerable to breaches
- **Limited Access**: Difficulty accessing your own health data
- **Lack of Interoperability**: Systems that don't communicate with each other
- **Trust Issues**: Inability to verify prescription authenticity

Veil solves these problems by:
- ✅ Storing medical records on an immutable blockchain ledger
- ✅ Giving patients full control over their health data
- ✅ Enabling anonymous prescription verification using zero-knowledge proofs
- ✅ Facilitating global healthcare consultations with tokenized payments
- ✅ Ensuring tamper-proof, verifiable medical documentation

---

## 🚀 Key Features

### For Patients

#### 🔐 **Secure Medical Record Management**
- **Blockchain Storage**: All medical records encrypted and stored on a decentralized network
- **Complete Ownership**: You control who accesses your health data and for how long
- **Immutable History**: Tamper-proof medical history accessible anytime, anywhere
- **Privacy-First**: End-to-end encryption ensures data confidentiality

#### 🌍 **Global Healthcare Access**
- **Worldwide Doctor Network**: Connect with verified healthcare professionals globally
- **Borderless Consultations**: Receive care regardless of geographic location
- **Multi-language Support**: Platform available in multiple languages
- **24/7 Availability**: Access healthcare services around the clock

#### 🔍 **Anonymous Prescription Verification**
- **Zero-Knowledge Proofs**: Verify prescription authenticity without revealing patient identity
- **Instant Validation**: Check if a prescription is legitimate in seconds
- **Fraud Prevention**: Cryptographic guarantees prevent counterfeit prescriptions

#### 📊 **AI-Powered Health Insights**
- **Real-time Monitoring**: Integrate wearable devices for continuous health tracking
- **Symptom Checker**: Quick AI-powered health assessments
- **Personalized Recommendations**: Data-driven insights tailored to your health profile
- **Early Detection**: Predictive analytics for potential health issues

### For Healthcare Providers

#### 💊 **Digital Prescription Management**
- **Blockchain-Based Prescriptions**: Issue tamper-proof prescriptions stored on-chain
- **Anonymous Options**: Create privacy-preserving prescriptions using ZK proofs
- **Digital Signatures**: Cryptographically signed for authenticity
- **Audit Trail**: Complete history of all prescriptions issued

#### 💰 **HTK Token Payment System**
- **Cryptocurrency Payments**: Receive payments in HTK (Health Token) tokens
- **Custom Rates**: Set your own consultation fees and pricing
- **Fast Transactions**: Near-instant payment settlement
- **Transparent Conversion**: Real-time ETH to HTK conversion (1 ETH = 100 HTK)
- **Low Fees**: Minimal transaction costs compared to traditional payment processors

#### 📋 **Patient Record Access**
- **Authorized Access**: View patient records with explicit consent
- **Comprehensive History**: Access complete medical histories, allergies, and medications
- **Real-time Updates**: Instant synchronization of patient data
- **Structured Data**: Well-organized information including demographics, diagnoses, and treatments

#### 🔬 **Professional Tools**
- **Consultation Management**: Schedule and manage patient appointments
- **Diagnostic Support**: Access to patient test results and imaging
- **Treatment Planning**: Document care plans and follow-up schedules
- **Collaboration**: Securely share patient data with other healthcare providers (with consent)

---

## 🏗️ Architecture

Veil employs a modern, scalable architecture combining Web3 and traditional web technologies:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  Next.js 14 + React + TypeScript + Tailwind CSS            │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                  Application Layer                          │
│  • Authentication (NextAuth.js)                             │
│  • API Routes & Server Components                           │
│  • Real-time Updates                                        │
└───────────┬──────────────────────┬──────────────────────────┘
            │                      │
┌───────────▼──────────┐  ┌───────▼──────────────────────────┐
│   Blockchain Layer   │  │    Database Layer                │
│                      │  │                                   │
│  • Ethereum Network  │  │  • MongoDB (Off-chain metadata)  │
│  • Smart Contracts:  │  │  • Patient Demographics          │
│    - Medical.sol     │  │  • Medical Histories             │
│    - HealthToken.sol │  │  • User Profiles                 │
│    - Verifier.sol    │  │                                   │
│  • Web3 Integration  │  │                                   │
└──────────────────────┘  └──────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────┐
│              Zero-Knowledge Proof Layer                      │
│  • ZK Circuit Compilation                                    │
│  • Proof Generation & Verification                           │
│  • Anonymous Prescription System                             │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**: MetaMask wallet connection + NextAuth session management
2. **Smart Contract Interaction**: Ethers.js facilitates blockchain transactions
3. **Off-chain Storage**: MongoDB stores non-critical metadata and user profiles
4. **ZK Proof Generation**: Anonymous prescriptions generate cryptographic proofs
5. **On-chain Verification**: Smart contracts verify proofs and execute transactions

---

## 💻 Technology Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI component library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component collection
- **[Lucide React](https://lucide.dev/)** - Icon library

### Blockchain & Web3
- **[Ethers.js v6](https://docs.ethers.org/)** - Ethereum library
- **[Solidity](https://soliditylang.org/)** - Smart contract language
- **[MetaMask SDK](https://metamask.io/)** - Wallet integration
- **[Hardhat](https://hardhat.org/)** - Development environment (implied)

### Backend & Database
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB ODM
- **[Prisma](https://www.prisma.io/)** - Database ORM

### AI & Advanced Features
- **[Google Generative AI](https://ai.google.dev/)** - AI-powered health insights
- **Custom ZK Circuits** - Zero-knowledge proof generation

### Developer Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Vercel](https://vercel.com/)** - Deployment platform

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** >= 18.0.0
- **npm** or **yarn** or **pnpm**
- **MetaMask** browser extension
- **MongoDB** instance (local or cloud)
- **Git**

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/rohansen856/Veil.git
   cd veil-decentralised
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Configuration**

   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/veil"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Blockchain
   NEXT_PUBLIC_CONTRACT_ADDRESS=""
   NEXT_PUBLIC_TOKEN_ADDRESS=""
   NEXT_PUBLIC_CHAIN_ID="" # or your network ID
   
   # AI Services (Optional)
   GOOGLE_AI_API_KEY="your-google-ai-api-key"
   
   # Email (Optional)
   POSTMARK_API_TOKEN="your-postmark-token"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed database (optional)
   npm run seed
   ```

5. **Smart Contract Deployment** (if setting up locally)
   ```bash
   # In a separate terminal, start local blockchain
   npx hardhat node
   
   # Deploy contracts
   npx hardhat run scripts/deploy.js --network localhost
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   # or for turbo mode
   npm run turbo
   ```

7. **Open Application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Quick Setup with Docker (Coming Soon)

```bash
docker-compose up -d
```

---

## 📜 Smart Contracts

Veil utilizes three core smart contracts deployed on Ethereum-compatible networks:

### 1. **Medical.sol** - Main Medical Records Contract

**Key Functions:**
- `registerDoctor(string name, string speciality, uint256 fees)` - Register as a healthcare provider
- `registerPatient(string name)` - Register as a patient
- `issuePrescription(address patient, Medication[] memory medications)` - Issue a prescription
- `getPrescriptionsByPatient(address patient)` - Retrieve patient prescriptions
- `authorizeDoctor(address doctor)` - Grant doctor access to records
- `revokeAuthorization(address doctor)` - Revoke doctor access

**Events:**
- `DoctorRegistered(address doctorAddress, string name, uint256 fees)`
- `PatientRegistered(address patientAddress, string name)`
- `PrescriptionIssued(uint256 prescriptionId, address doctor, address patient)`

### 2. **HealthToken.sol** - ERC-20 Payment Token

**Token Details:**
- **Symbol**: HTK
- **Decimals**: 18
- **Conversion**: 1 ETH = 100 HTK

**Key Functions:**
- `mint(address to, uint256 amount)` - Mint new tokens
- `transfer(address to, uint256 amount)` - Transfer tokens
- `approve(address spender, uint256 amount)` - Approve spending
- `balanceOf(address account)` - Check balance

### 3. **ZKPrescriptionVerifier.sol** - Zero-Knowledge Proof Verifier

**Purpose:** Verify anonymous prescriptions without revealing patient identity

**Key Functions:**
- `verifyProof(Proof memory proof, uint256[] memory inputs)` - Verify ZK proof
- `isValidPrescription(bytes32 commitment)` - Check prescription validity

**Contract Addresses** (Example - Local Development):
- HealthToken: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- Medical: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

> **Note:** Update these addresses in `src/contracts/address.ts` for your deployment

---

## 🔐 Zero-Knowledge Proofs

Veil implements zero-knowledge proofs for anonymous prescription verification, allowing pharmacies to validate prescriptions without knowing the patient's identity.

### How It Works

1. **Prescription Issuance**
   - Doctor creates prescription with patient medications and diagnosis
   - System generates a unique commitment hash combining prescription data + secret key
   - Commitment is stored on-chain, actual data remains off-chain

2. **Proof Generation**
   ```typescript
   const zkProof = await generateZKProof({
     medications: [...],
     diagnosis: "...",
     doctorId: "0x...",
     secretKey: "patient-secret"
   });
   ```

3. **Verification**
   - Patient presents proof + commitment to pharmacy
   - Smart contract verifies proof cryptographically
   - Pharmacy confirms prescription validity without seeing patient details

### ZK Circuit Components

- **Prescription Hash**: Cryptographic hash of medication details
- **Secret Key**: Patient-controlled secret for privacy
- **Public Commitment**: Publicly verifiable commitment on blockchain
- **Proof**: Zero-knowledge proof of knowledge

**File Reference:** [`src/lib/zkProofs.ts`](src/lib/zkProofs.ts)

---

## 👥 User Guides

### For Patients

#### Step 1: Connect Wallet & Register
1. Install MetaMask browser extension
2. Visit [https://veil-org.vercel.app](https://veil-org.vercel.app)
3. Click "Connect Wallet" and approve MetaMask connection
4. Navigate to "Register as Patient"
5. Fill in your details and submit transaction

#### Step 2: Manage Your Health Records
- Access dashboard to view medical history
- Update personal information and demographics
- Add allergies, medications, and chronic conditions
- Upload test results and medical documents

#### Step 3: Consult a Doctor
1. Browse verified doctors by specialty
2. Book consultation and pay in HTK tokens
3. Attend virtual consultation
4. Receive prescription on blockchain

#### Step 4: Verify Prescriptions
- Navigate to "Verify Prescription"
- Enter prescription ID or scan QR code
- View prescription details and authenticity status

### For Doctors

#### Step 1: Doctor Registration
1. Connect wallet via MetaMask
2. Select "Register as Doctor"
3. Provide credentials: name, specialty, consultation fees
4. Submit registration transaction (small gas fee)
5. Await verification (if required)

#### Step 2: Set Consultation Rates
```
Example: Set rate to 100 HTK/hour
Conversion: ~$267 USD (varies with ETH price)
```

#### Step 3: Issue Prescriptions
1. Access patient dashboard
2. Select patient (with authorization)
3. Fill prescription form:
   - Medication name, dosage, duration
   - Diagnosis and additional instructions
4. Choose prescription type:
   - **Standard**: Public, on-chain
   - **Anonymous**: ZK-proof enabled, privacy-preserving
5. Submit to blockchain

#### Step 4: Manage Earnings
- View HTK token balance in dashboard
- Convert HTK to ETH via integrated exchange
- Withdraw funds to wallet

---

## 📁 Project Structure

```
veil-decentralised/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── register-patient/
│   │   │   └── verification/
│   │   ├── (dashboard)/              # Dashboard routes
│   │   │   ├── dashboard/            # Patient dashboard
│   │   │   └── doctor/               # Doctor dashboard
│   │   ├── (marketing)/              # Marketing pages
│   │   │   ├── _components/          # Marketing components
│   │   │   └── page.tsx              # Homepage
│   │   ├── (jurisdiction)/           # Legal & info pages
│   │   │   ├── about-us/
│   │   │   ├── legal-help/
│   │   │   └── terms-and-services/
│   │   ├── api/                      # API routes
│   │   └── layout.tsx                # Root layout
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── magicui/                  # Custom UI components
│   │   ├── shared/                   # Shared components
│   │   ├── contract.tsx              # Smart contract interactions
│   │   ├── metamask.tsx              # MetaMask integration
│   │   ├── patient-form.tsx          # Patient registration form
│   │   ├── doctor-form.tsx           # Doctor registration form
│   │   └── patient-detail-schema.ts  # TypeScript schemas
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── auth.ts                   # Authentication logic
│   │   ├── contract.ts               # Contract ABIs & addresses
│   │   ├── web3.ts                   # Web3 utilities
│   │   ├── zkProofs.ts               # Zero-knowledge proof generation
│   │   ├── db.ts                     # Database connection
│   │   ├── mongo.ts                  # MongoDB utilities
│   │   └── utils.ts                  # General utilities
│   │
│   ├── config/                       # Configuration files
│   │   ├── site.ts                   # Site configuration
│   │   ├── dashboard.ts              # Dashboard config
│   │   └── marketing.ts              # Marketing config
│   │
│   ├── contracts/                    # Smart contract artifacts
│   │   ├── Medical.json              # Medical contract ABI
│   │   ├── HealthToken.json          # Token contract ABI
│   │   ├── Verifier.json             # Verifier contract ABI
│   │   └── address.ts                # Contract addresses
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── index.d.ts
│   │   └── next-auth.d.ts
│   │
│   └── styles/                       # Global styles
│       ├── globals.css
│       └── editor.css
│
├── prisma/                           # Prisma schema & migrations
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
│
├── public/                           # Static assets
│   ├── illustrations/
│   └── manifest.json
│
├── .env.local                        # Environment variables (create this)
├── next.config.mjs                   # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
└── README.md                         # This file
```

---

## 🔌 API Reference

### REST API Endpoints

#### Authentication
```typescript
POST /api/auth/register
Body: { name: string, email: string, walletAddress: string }
Response: { success: boolean, userId: string }
```

#### Patient Records
```typescript
GET /api/patients/:address
Response: PatientDemographics & MedicalHistory

POST /api/patients/update
Body: Partial<PatientDemographics>
Response: { success: boolean }
```

#### Prescriptions
```typescript
GET /api/prescriptions/:patientAddress
Response: Prescription[]

POST /api/prescriptions/verify
Body: { prescriptionId: string, proof?: ZKProofData }
Response: { valid: boolean, details?: PrescriptionDetails }
```

### Web3 Functions

#### Connect Wallet
```typescript
import { connectWallet } from '@/lib/web3';

const { address, provider, signer } = await connectWallet();
```

#### Interact with Medical Contract
```typescript
import { getMedicalContract } from '@/lib/web3';

const contract = await getMedicalContract();
await contract.registerPatient("John Doe");
```

#### Generate ZK Proof
```typescript
import { generateZKProof } from '@/lib/zkProofs';

const proof = await generateZKProof({
  medications: [...],
  diagnosis: "...",
  doctorId: "0x...",
  secretKey: "secret"
});
```
---
### Areas for Contribution

- 🐛 **Bug Fixes**: Report or fix bugs
- ✨ **Features**: Implement new features
- 📚 **Documentation**: Improve docs and examples
- 🎨 **UI/UX**: Enhance user interface
- 🔒 **Security**: Audit smart contracts and code
- 🌍 **Localization**: Add language support

---

### Security Measures

- **Smart Contract Audits**: Contracts audited for vulnerabilities
- **End-to-End Encryption**: All sensitive data encrypted
- **Zero-Knowledge Proofs**: Privacy-preserving verification
- **Access Control**: Role-based permissions
- **Secure Authentication**: MetaMask + NextAuth integration

 ---

## 🙏 Acknowledgments

### Core Technologies
- **[Next.js](https://nextjs.org/)** - The React Framework for Production
- **[Ethereum](https://ethereum.org/)** - Decentralized Platform
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI Components
- **[Vercel](https://vercel.com/)** - Deployment Platform

### Inspiration & Resources
- **[OpenZeppelin](https://openzeppelin.com/)** - Secure smart contract libraries
- **[ZoKrates](https://zokrates.github.io/)** - Zero-knowledge proof toolkit
- **[IPFS](https://ipfs.io/)** - Decentralized storage concepts

## 📊 Stats

![GitHub Stars](https://img.shields.io/github/stars/rohansen856/Veil?style=social)
![GitHub Forks](https://img.shields.io/github/forks/rohansen856/Veil?style=social)
![GitHub Issues](https://img.shields.io/github/issues/rohansen856/Veil)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/rohansen856/Veil)

---

<div align="center">

**Built with ❤️ by the Veil Team**

*Empowering Healthcare, One Block at a Time*

[⬆ Back to Top](#-veil-decentralized-medical-platform)

</div>
