document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const connectWalletBtn = document.getElementById('connectWallet');
    const walletStatus = document.getElementById('walletStatus');
    const uploadForm = document.getElementById('uploadForm');
    const uploadFile = document.getElementById('uploadFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadLoader = document.getElementById('uploadLoader');
    const uploadStatus = document.getElementById('uploadStatus');
    const verifyForm = document.getElementById('verifyForm');
    const verifyFile = document.getElementById('verifyFile');
    const verifyBtn = document.getElementById('verifyBtn');
    const verifyLoader = document.getElementById('verifyLoader');
    const verifyStatus = document.getElementById('verifyStatus');

    // Application state
    let currentAccount = null;

    // Check if MetaMask is installed
    const checkMetaMaskInstalled = () => {
        return typeof window.ethereum !== 'undefined';
    };

    // Connect to MetaMask
    const connectWallet = async () => {
        if (!checkMetaMaskInstalled()) {
            showAlert(walletStatus, 'MetaMask is not installed. Please install MetaMask to use this application.', 'danger');
            return;
        }
        try {
            connectWalletBtn.disabled = true;
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            currentAccount = accounts[0];
            
            showAlert(
                walletStatus, 
                `Connected: <span id="walletAddress">${currentAccount}</span>`, 
                'success'
            );
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    // User disconnected
                    currentAccount = null;
                    showAlert(walletStatus, 'Wallet disconnected.', 'info');
                    connectWalletBtn.disabled = false;
                    connectWalletBtn.textContent = 'Connect Wallet';
                } else {
                    // User switched accounts
                    currentAccount = accounts[0];
                    showAlert(
                        walletStatus, 
                        `Connected: <span id="walletAddress">${currentAccount}</span>`, 
                        'success'
                    );
                }
            });
            
            connectWalletBtn.textContent = 'Wallet Connected';
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            showAlert(walletStatus, 'Failed to connect wallet. Please try again.', 'danger');
            connectWalletBtn.disabled = false;
        }
    };

    // Upload and register document
    const uploadDocument = async (event) => {
        event.preventDefault();
        
        if (!currentAccount) {
            showAlert(uploadStatus, 'Please connect your MetaMask wallet first.', 'danger');
            return;
        }
        
        if (!uploadFile.files[0]) {
            showAlert(uploadStatus, 'Please select a file to upload.', 'danger');
            return;
        }
        try {
            // Show loader
            uploadBtn.disabled = true;
            uploadLoader.classList.remove('hidden');
            
            // Create FormData and append file and sender
            const formData = new FormData();
            formData.append('file', uploadFile.files[0]);
            formData.append('sender', currentAccount);
            
            // Send to backend
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Check for specific error messages
                if (data.error === 'Document already exists') {
                    showAlert(uploadStatus, 'This document has already been registered on the blockchain.', 'info');
                    return;
                }
                throw new Error(data.error || 'Error uploading document');
            }
            
            showAlert(uploadStatus, 'Please sign the transaction in MetaMask...', 'info');
            
            // Handle the tx object correctly
            const txParams = {
                from: data.tx.from,
                to: data.tx.to,
                gas: data.tx.gas,
                gasPrice: data.tx.gasPrice,
                data: data.tx.data,
                nonce: data.tx.nonce,
                value: '0x0' // Explicitly set value to 0
            };
            
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [txParams],
            });
            
            showAlert(uploadStatus, `Document successfully registered!`, 'success');
            
            // Reset file input
            uploadFile.value = '';
        } catch (txError) {
            console.error('Transaction error:', txError);
            const errorMessage = txError.message || 'Transaction failed or was rejected';
            showAlert(uploadStatus, errorMessage, 'danger');
        } finally {
            uploadBtn.disabled = false;
            uploadLoader.classList.add('hidden');
        }
    };

    // Verify document
    const verifyDocument = async (event) => {
        event.preventDefault();
        
        if (!verifyFile.files[0]) {
            showAlert(verifyStatus, 'Please select a file to verify.', 'danger');
            return;
        }
        try {
            // Show loader
            verifyBtn.disabled = true;
            verifyLoader.classList.remove('hidden');
            
            // Create FormData and append file
            const formData = new FormData();
            formData.append('file', verifyFile.files[0]);
            
            // Send to backend
            const response = await fetch('/verify', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Format timestamp from Unix timestamp
                const date = new Date(data.timestamp * 1000);
                const formattedDate = date.toLocaleString();
                
                showAlert(
                    verifyStatus, 
                    `Document verified! <br>Registered on: ${formattedDate}`, 
                    'success'
                );
                
                // Reset file input
                verifyFile.value = '';
            } else {
                showAlert(verifyStatus, data.message, 'danger');
            }
        } catch (error) {
            console.error('Verification error:', error);
            showAlert(verifyStatus, 'Error verifying document. Please try again.', 'danger');
        } finally {
            verifyBtn.disabled = false;
            verifyLoader.classList.add('hidden');
        }
    };

    // Helper function to show alerts
    const showAlert = (element, message, type = 'info') => {
        // Remove any existing alerts
        const existingAlerts = element.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = message;
        
        // Append alert to element
        element.appendChild(alert);
    };

    // Event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    uploadForm.addEventListener('submit', uploadDocument);
    verifyForm.addEventListener('submit', verifyDocument);

    // Check if MetaMask is installed on page load
    if (!checkMetaMaskInstalled()) {
        showAlert(walletStatus, 'MetaMask is not installed. Please install MetaMask to use this application.', 'danger');
        connectWalletBtn.disabled = true;
    }
});