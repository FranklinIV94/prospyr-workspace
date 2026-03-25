// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * InvoiceOracle — ALBS verification layer for InvoiceFi
 *
 * ALBS acts as the trusted oracle:
 * - Verifies invoice authenticity (KYC on issuer/payer)
 * - Confirms services were rendered
 * - Marks payment as received
 *
 * This contract bridges real-world invoice data to on-chain InvoiceTokens.
 */
contract InvoiceOracle is Ownable {
    enum VerificationStatus {
        Pending,
        Verified,
        Rejected,
        Paid,
        Defaulted
    }

    struct InvoiceVerification {
        address issuer;          // SMB submitting invoice
        address payer;            // Client who owes
        uint256 faceValue;        // Invoice amount
        uint256 maturityDate;     // Due date
        VerificationStatus status;
        string  ipfsHash;        // Off-chain invoice document
        uint256 verifiedAt;
        uint256 paidAt;
    }

    uint256 public verificationId;
    mapping(uint256 => InvoiceVerification) public verifications;
    mapping(address => bool) public authorizedIssuers;

    event InvoiceSubmitted(uint256 indexed verificationId, address indexed issuer, uint256 faceValue);
    event InvoiceVerified(uint256 indexed verificationId);
    event InvoiceRejected(uint256 indexed verificationId, string reason);
    event PaymentConfirmed(uint256 indexed verificationId);
    event DefaultReported(uint256 indexed verificationId);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Submit invoice for ALBS verification
     */
    function submitInvoice(
        address payer,
        uint256 faceValue,
        uint256 maturityDate,
        string calldata ipfsHash
    ) external returns (uint256) {
        require(authorizedIssuers[msg.sender] || owner() == msg.sender, "Not authorized");
        require(faceValue > 0, "Invalid face value");
        require(maturityDate > block.timestamp, "Maturity must be future");

        verificationId++;
        uint256 id = verificationId;

        verifications[id] = InvoiceVerification({
            issuer: msg.sender,
            payer: payer,
            faceValue: faceValue,
            maturityDate: maturityDate,
            status: VerificationStatus.Pending,
            ipfsHash: ipfsHash,
            verifiedAt: 0,
            paidAt: 0
        });

        emit InvoiceSubmitted(id, msg.sender, faceValue);
        return id;
    }

    /**
     * @dev ALBS verifies invoice is legitimate (services rendered, documents valid)
     */
    function verify(uint256 id) external onlyOwner {
        require(verifications[id].issuer != address(0), "Verification doesn't exist");
        require(verifications[id].status == VerificationStatus.Pending, "Not pending");

        verifications[id].status = VerificationStatus.Verified;
        verifications[id].verifiedAt = block.timestamp;

        emit InvoiceVerified(id);
    }

    /**
     * @dev ALBS rejects invoice (fraudulent, documents invalid, etc.)
     */
    function reject(uint256 id, string calldata reason) external onlyOwner {
        require(verifications[id].issuer != address(0), "Verification doesn't exist");

        verifications[id].status = VerificationStatus.Rejected;
        emit InvoiceRejected(id, reason);
    }

    /**
     * @dev ALBS confirms payment received → triggers token redemption
     */
    function confirmPayment(uint256 id) external onlyOwner {
        require(verifications[id].status == VerificationStatus.Verified, "Not verified");
        require(verifications[id].faceValue > 0, "Already paid or invalid");

        verifications[id].status = VerificationStatus.Paid;
        verifications[id].paidAt = block.timestamp;

        emit PaymentConfirmed(id);
    }

    /**
     * @dev ALBS reports default (payer didn't pay by maturity)
     */
    function reportDefault(uint256 id) external onlyOwner {
        require(verifications[id].status == VerificationStatus.Verified, "Not verified");

        verifications[id].status = VerificationStatus.Defaulted;
        emit DefaultReported(id);
    }

    /**
     * @dev Authorize an issuer to submit invoices
     */
    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
    }

    /**
     * @dev Revoke issuer authorization
     */
    function revokeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
    }

    /**
     * @dev Get verification details
     */
    function getVerification(uint256 id) external view returns (InvoiceVerification memory) {
        return verifications[id];
    }
}
