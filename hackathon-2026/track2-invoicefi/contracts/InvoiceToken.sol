// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * InvoiceToken — ERC-20 representing a single invoice as RWA
 *
 * Each invoice becomes a token with:
 * - Face value (the amount owed)
 * - Maturity date (when payment is due)
 * - Issuer (the SMB that issued the invoice)
 * - Status (pending, paid, defaulted)
 */
contract InvoiceToken is ERC20, Ownable {
    struct Invoice {
        uint256 faceValue;      // In USDC (6 decimals)
        uint256 maturityDate;   // Unix timestamp
        address issuer;         // SMB that issued invoice
        address payer;         // Client that owes the money
        bool isPaid;
        bool isVerified;
    }

    uint256 public tokenId;
    mapping(uint256 => Invoice) public invoices;

    event InvoiceCreated(uint256 indexed tokenId, address indexed issuer, uint256 faceValue);
    event InvoicePaid(uint256 indexed tokenId);
    event InvoiceVerified(uint256 indexed tokenId);

    constructor() ERC20("Invoice Token", "INV") Ownable(msg.sender) {}

    /**
     * @dev ALBS oracle verifies invoice → mints token to investor
     */
    function createInvoice(
        address issuer,
        address payer,
        uint256 faceValue,
        uint256 maturityDate
    ) external onlyOwner returns (uint256) {
        require(faceValue > 0, "Invalid face value");
        require(maturityDate > block.timestamp, "Maturity must be future");

        tokenId++;
        uint256 id = tokenId;

        _mint(msg.sender, id); // Mint to sender (will transfer to investor)

        invoices[id] = Invoice({
            faceValue: faceValue,
            maturityDate: maturityDate,
            issuer: issuer,
            payer: payer,
            isPaid: false,
            isVerified: false
        });

        emit InvoiceCreated(id, issuer, faceValue);
        return id;
    }

    /**
     * @dev ALBS oracle marks invoice as verified (KYC passed, invoice is real)
     */
    function verifyInvoice(uint256 id) external onlyOwner {
        require(invoices[id].faceValue > 0, "Invoice doesn't exist");
        invoices[id].isVerified = true;
        emit InvoiceVerified(id);
    }

    /**
     * @dev Payer confirms payment → oracle confirms → token redeemed
     */
    function confirmPayment(uint256 id) external onlyOwner {
        require(invoices[id].faceValue > 0, "Invoice doesn't exist");
        require(!invoices[id].isPaid, "Already paid");
        invoices[id].isPaid = true;
        emit InvoicePaid(id);
    }

    /**
     * @dev Get invoice details
     */
    function getInvoice(uint256 id) external view returns (Invoice memory) {
        return invoices[id];
    }

    /**
     * @dev Get current price (discount based on time to maturity)
     * Investors buy at discount → yield = (faceValue - purchasePrice)
     */
    function getCurrentPrice(uint256 id) external view returns (uint256) {
        Invoice memory inv = invoices[id];
        require(inv.faceValue > 0, "Invoice doesn't exist");

        uint256 timeToMaturity = inv.maturityTimestamp > block.timestamp
            ? inv.maturityDate - block.timestamp
            : 0;

        // Simplified: 10% annual discount
        uint256 annualDiscount = inv.faceValue * 10 / 100;
        uint256 dailyDiscount = annualDiscount / 365;
        uint256 discount = dailyDiscount * timeToMaturity / 86400;

        return inv.faceValue > discount ? inv.faceValue - discount : 0;
    }
}
