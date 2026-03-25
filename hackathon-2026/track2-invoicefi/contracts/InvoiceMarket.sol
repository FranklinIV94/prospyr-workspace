// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./InvoiceToken.sol";

/**
 * InvoiceMarket — P2P trading of invoice tokens
 *
 * Investors can:
 * - List invoice tokens for sale
 * - Make offers on invoice tokens
 * - Buy at listed price
 *
 * ALBS oracle receives a fee on each trade.
 */
contract InvoiceMarket is Ownable {
    uint256 public constant FEE_PERCENT = 1; // 1% fee to ALBS
    address public feeRecipient; // ALBS treasury

    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    uint256 public listingId;
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => uint256) public offers; // tokenId => offer amount

    event Listed(uint256 indexed listingId, address indexed seller, uint256 tokenId, uint256 price);
    event OfferMade(uint256 indexed tokenId, address indexed buyer, uint256 amount);
    event Sold(uint256 indexed listingId, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed listingId);

    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev List an invoice token for sale
     */
    function listInvoice(uint256 tokenId, uint256 price) external returns (uint256) {
        require(price > 0, "Price must be positive");

        // Transfer token to market contract
        InvoiceToken token = InvoiceToken(msg.sender); // Assumes called with token address
        // In practice: use IERC721.safeTransferFrom

        listingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            isActive: true
        });

        emit Listed(listingId, msg.sender, tokenId, price);
        return listingId;
    }

    /**
     * @dev Make an offer on a token
     */
    function makeOffer(uint256 tokenId) external payable {
        require(msg.value > 0, "Must send value");
        offers[tokenId] = msg.value;
        emit OfferMade(tokenId, msg.sender, msg.value);
    }

    /**
     * @dev Buy at listed price
     */
    function buyInvoice(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        // Calculate fees
        uint256 fee = listing.price * FEE_PERCENT / 100;
        uint256 sellerProceeds = listing.price - fee;

        // Transfer to seller
        payable(listing.seller).transfer(sellerProceeds);

        // Fee to ALBS
        payable(feeRecipient).transfer(fee);

        // Transfer token (mock - would use IERC721 in production)
        // In practice: IERC721(listing.tokenAddress).safeTransferFrom(address(this), msg.sender, listing.tokenId);

        listing.isActive = false;
        emit Sold(listingId, msg.sender, listing.price);
    }

    /**
     * @dev Cancel listing
     */
    function cancelListing(uint256 listingId) external {
        require(listings[listingId].seller == msg.sender, "Not seller");
        listings[listingId].isActive = false;
        emit ListingCancelled(listingId);
    }

    /**
     * @dev Update fee recipient
     */
    function setFeeRecipient(address _recipient) external onlyOwner {
        feeRecipient = _recipient;
    }
}
