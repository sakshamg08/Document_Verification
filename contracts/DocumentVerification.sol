// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentVerification {
    struct Document {
        string fileHash;
        uint256 timestamp;
    }

    mapping(string => Document) private documents;

    event DocumentAdded(string fileHash, uint256 timestamp);

    function addDocument(string memory _fileHash) public {
        require(bytes(documents[_fileHash].fileHash).length == 0, "Document already exists!");

        documents[_fileHash] = Document({
            fileHash: _fileHash,
            timestamp: block.timestamp
        });

        emit DocumentAdded(_fileHash, block.timestamp);
    }

    function verifyDocument(string memory _fileHash) public view returns (bool, uint256) {
        Document memory doc = documents[_fileHash];
        if (bytes(doc.fileHash).length == 0) {
            return (false, 0);
        }
        return (true, doc.timestamp);
    }
}
