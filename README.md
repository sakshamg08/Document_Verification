📄 Document Verification using Blockchain
A blockchain-powered web application that secures and verifies documents by storing their hashes on the blockchain, ensuring tamper-proof authenticity and easy verification.

🔐 Project Overview
In a world where digital documents are easily manipulated, this system uses blockchain technology to protect document integrity. It allows users to:

📥 Upload documents to generate and store a unique hash on the blockchain.

✅ Verify documents by comparing their hash with those already recorded — ensuring no tampering has occurred.

If a document has been modified in any way, its hash will not match the original one on the blockchain — thus, marking it as unauthentic.

🧰 Tech Stack
Layer	Technologies Used
Backend	Python, Flask
Frontend	HTML, CSS, JavaScript
Blockchain	Solidity, Ganache
Wallet & Auth	MetaMask
API Testing	Postman
Smart Contract	Ethereum-based via Remix / Truffle
✨ Key Features
Upload and hash document content.

Store document hash on a blockchain for immutability.

Verify uploaded documents against existing blockchain hashes.

Clean UI for upload & verification process.

📁 Project Structure
├── blockchain/
│   └── DocumentStore.sol          # Solidity smart contract
├── backend/
│   ├── app.py                     # Flask backend
│   ├── utils.py                   # Document hashing utility
│   └── routes/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── templates/
│   └── upload.html
├── static/
│   ├── css/
│   └── js/
├── requirements.txt
└── README.md

🚀 Getting Started
🔧 Prerequisites
Python 3.x

Node.js (optional if using web3 frontend)

Ganache (for local blockchain)

MetaMask browser extension

Flask

Postman (for API testing)

🧪 Usage
Navigate to the upload page.

Choose a document (PDF/DOC/Image etc.).

Upload the document — its hash will be stored on the blockchain.

To verify, upload a document again — the app will compute its hash and compare it with existing records.

⚠️ If the hashes match, the document is verified. If not, it's considered tampered or unauthorized.

🤝 Contributors
Saksham Gupta, Janeesh Reddy

📃 License
This project is for educational and research purposes only.
