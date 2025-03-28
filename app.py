import os
import json
import hashlib
from flask import Flask, request, jsonify, render_template
from web3 import Web3

# Connect to Ganache
ganache_url = "HTTP://127.0.0.1:8545"  # Ensure this matches Ganache's RPC URL
web3 = Web3(Web3.HTTPProvider(ganache_url))

contract_address = "0x23C96a601A8BB84Bda6906113c4CAC78968482A2"
contract_abi = json.loads(open("build/contracts/DocumentVerification.json").read())["abi"]
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

app = Flask(__name__, static_folder="static", template_folder="templates")

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Function to generate file hash
def generate_hash(file_path):
    hasher = hashlib.sha256()
    with open(file_path, 'rb') as f:
        while chunk := f.read(4096):
            hasher.update(chunk)
    
    file_hash = hasher.hexdigest()
    os.remove(file_path)  # Remove file after hashing
    return file_hash

# Serve Frontend
@app.route("/")
def home():
    return render_template("index.html")

# Upload & Add to Blockchain
@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    sender = request.form.get('sender')  # Get sender address from MetaMask frontend
    
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400
    if not sender:
        return jsonify({'error': 'Sender address required'}), 400
    
    try:
        sender = web3.to_checksum_address(sender)  # Convert to checksum format
    except ValueError:
        return jsonify({'error': 'Invalid Ethereum address'}), 400
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)
    file_hash = generate_hash(file_path)
    
    # Check if document already exists
    exists, _ = contract.functions.verifyDocument(file_hash).call()
    if exists:
        return jsonify({'error': 'Document already exists'}), 400
    
    # Interact with Smart Contract using MetaMask address
    nonce = web3.eth.get_transaction_count(sender)
    tx = contract.functions.addDocument(file_hash).build_transaction({
        'from': sender,
        'gas': 500000,
        'gasPrice': web3.to_wei('10', 'gwei'),
        'nonce': nonce
    })
    
    # Ensure all transaction parameters are properly formatted for MetaMask
    formatted_tx = {
        'from': tx['from'],
        'to': tx['to'],
        'gas': hex(tx['gas']),
        'gasPrice': hex(tx['gasPrice']),
        'data': tx['data'],
        'nonce': hex(tx['nonce']),
        'value': '0x0'
    }
    
    return jsonify({'message': 'Sign this transaction in MetaMask', 'tx': formatted_tx}), 200

# Verify Document
@app.route('/verify', methods=['POST'])
def verify_document():
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)
    file_hash = generate_hash(file_path)
    
    exists, timestamp = contract.functions.verifyDocument(file_hash).call()
    if exists:
        return jsonify({'message': 'Document verified!', 'file_hash': file_hash, 'timestamp': timestamp}), 200
    else:
        return jsonify({'message': 'Document not found in blockchain'}), 404

# Run Flask App
if __name__ == '__main__':
    app.run(debug=True)