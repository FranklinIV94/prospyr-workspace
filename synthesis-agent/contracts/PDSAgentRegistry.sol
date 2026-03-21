// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PDSAgentRegistry
 * @notice ERC-8004 compatible AI Agent Identity Registry
 *         Agents register onchain, build reputation, and can prove identity to other agents.
 *         Built for Prospyr / All Lines Business Solutions
 *
 * @dev Implements ERC-8004 (AI Agent Identity Standard):
 *      - Onchain agent registration with DID
 *      - Verifiable identity claims
 *      - Delegation support (agent-to-agent permissions)
 *      - Reputation scoring through successful interactions
 *
 * Audit Trail: https://eips.ethereum.org/EIPS/eip-8004
 * Registry:   https://etherscan.io/address/0x8111C4D3f89dCE1bD60eE16d2b8D16eF1f86fB8D
 */

interface IERC8004 {
    /// @notice Register a new agent with metadata
    function registerAgent(
        bytes32 agentId,
        bytes calldata metadata,
        uint8 capabilityFlags
    ) external returns (bool);

    /// @notice Get agent info
    function getAgent(bytes32 agentId) external view returns (
        address owner,
        bytes memory metadata,
        uint8 capabilityFlags,
        uint256 reputationScore,
        bool isActive
    );

    /// @notice Delegate authority to another agent
    function delegateTo(
        bytes32 agentId,
        address delegate,
        uint256 expiresAt,
        bytes calldata permissions
    ) external;
}

contract PDSAgentRegistry {
    // ERC-8004 compatibility
    IERC8004 public immutable ERC8004_REGISTRY = IERC8004(0x8111C4D3f89dCE1bD60eE16d2b8D16eF1f86fB8D);

    // Agent info
    struct AgentInfo {
        address owner;
        bytes metadata;         // IPFS hash or encoded JSON
        uint8 capabilityFlags;  // Bitfield: can_trade, can_sign, can_delegate, etc.
        uint256 reputationScore;
        uint256 totalInteractions;
        uint256 successfulInteractions;
        bool isRegistered;
        uint256 registeredAt;
    }

    // Delegation records
    struct Delegation {
        address delegate;
        uint256 expiresAt;
        bytes permissions;
        bool isActive;
    }

    // Agent ID -> AgentInfo
    mapping(bytes32 => AgentInfo) public agents;

    // Agent ID -> Delegate address -> Delegation
    mapping(bytes32 => mapping(address => Delegation)) public delegations;

    // Reputation events
    event AgentRegistered(bytes32 indexed agentId, address indexed owner, uint8 capabilities);
    event AgentUpdated(bytes32 indexed agentId, bytes metadata);
    event InteractionRecorded(bytes32 indexed agentId, bool success, uint256 newReputation);
    event DelegationGranted(bytes32 indexed agentId, address indexed delegate, uint256 expiresAt);
    event DelegationRevoked(bytes32 indexed agentId, address indexed delegate);

    // Trusted assessors (for external reputation oracles)
    mapping(address => bool) public trustedAssessors;

    modifier onlyAgentOwner(bytes32 agentId) {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        _;
    }

    /**
     * @notice Register a new AI agent onchain
     * @param agentId  Unique agent identifier (bytes32, e.g. IPFS hash of agent DID)
     * @param metadata IPFS hash pointing to agent metadata JSON
     * @param capabilityFlags Bitfield of agent capabilities (1=can_trade, 2=can_sign, 4=can_delegate, 8=is_financial)
     */
    function registerAgent(
        bytes32 agentId,
        bytes calldata metadata,
        uint8 capabilityFlags
    ) external returns (bool) {
        require(!agents[agentId].isRegistered, "Agent already registered");
        require(metadata.length > 0, "Metadata required");

        agents[agentId] = AgentInfo({
            owner: msg.sender,
            metadata: metadata,
            capabilityFlags: capabilityFlags,
            reputationScore: 100, // Start at 100 (out of 1000)
            totalInteractions: 0,
            successfulInteractions: 0,
            isRegistered: true,
            registeredAt: block.timestamp
        });

        emit AgentRegistered(agentId, msg.sender, capabilityFlags);
        return true;
    }

    /**
     * @notice Update agent metadata (IPFS hash)
     */
    function updateMetadata(bytes32 agentId, bytes calldata newMetadata)
        external
        onlyAgentOwner(agentId)
    {
        require(newMetadata.length > 0, "Metadata required");
        agents[agentId].metadata = newMetadata;
        emit AgentUpdated(agentId, newMetadata);
    }

    /**
     * @notice Record an interaction and update reputation
     * @param agentId Agent that was involved
     * @param success Whether the interaction succeeded
     * @param weight Optional weight (1-10 scale, defaults to 5)
     */
    function recordInteraction(
        bytes32 agentId,
        bool success,
        uint256 weight
    ) external {
        require(agents[agentId].isRegistered, "Agent not registered");

        AgentInfo storage agent = agents[agentId];
        agent.totalInteractions++;

        // Weighted reputation: +10 * weight for success, -5 * weight for failure
        uint256 delta = success ? (10 * weight) : (5 * weight);
        agent.successfulInteractions += success ? 1 : 0;

        if (success) {
            agent.reputationScore = min(1000, agent.reputationScore + delta);
        } else {
            agent.reputationScore = agent.reputationScore > delta ? agent.reputationScore - delta : 0;
        }

        emit InteractionRecorded(agentId, success, agent.reputationScore);
    }

    /**
     * @notice Grant delegation to another agent/wallet
     */
    function grantDelegation(
        bytes32 agentId,
        address delegate,
        uint256 expiresAt,
        bytes calldata permissions
    ) external onlyAgentOwner(agentId) {
        require(delegate != address(0), "Invalid delegate");
        require(expiresAt > block.timestamp, "Invalid expiry");

        // Check agent has delegation capability
        require(agents[agentId].capabilityFlags & 4 != 0, "Cannot delegate");

        delegations[agentId][delegate] = Delegation({
            delegate: delegate,
            expiresAt: expiresAt,
            permissions: permissions,
            isActive: true
        });

        emit DelegationGranted(agentId, delegate, expiresAt);
    }

    /**
     * @notice Revoke delegation
     */
    function revokeDelegation(bytes32 agentId, address delegate)
        external
        onlyAgentOwner(agentId)
    {
        delete delegations[agentId][delegate];
        emit DelegationRevoked(agentId, delegate);
    }

    /**
     * @notice Check if an agent can be trusted based on reputation
     * @param agentId Agent to check
     * @param threshold Minimum reputation score required
     */
    function canTrust(bytes32 agentId, uint256 threshold) external view returns (bool) {
        if (!agents[agentId].isRegistered) return false;
        return agents[agentId].reputationScore >= threshold;
    }

    /**
     * @notice Get agent trust score (0-100)
     */
    function getTrustScore(bytes32 agentId) external view returns (uint256) {
        if (!agents[agentId].isRegistered) return 0;
        return agents[agentId].reputationScore / 10; // Normalize to 0-100
    }

    /**
     * @notice Generate a verifiable claim about this agent (for cross-agent communication)
     */
    function generateAttestation(
        bytes32 agentId,
        string calldata claimType
    ) external view returns (bytes memory) {
        require(agents[agentId].isRegistered, "Agent not registered");
        AgentInfo memory agent = agents[agentId];

        return abi.encode(
            claimType,
            agentId,
            agent.owner,
            agent.reputationScore,
            agent.capabilityFlags,
            block.chainid,
            address(this),
            keccak256(abi.encode(agentId, msg.sender, block.timestamp))
        );
    }

    // Read functions
    function getAgent(bytes32 agentId) external view returns (AgentInfo memory) {
        return agents[agentId];
    }

    function isValidDelegation(bytes32 agentId, address delegate) external view returns (bool) {
        Delegation memory d = delegations[agentId][delegate];
        return d.isActive && d.expiresAt > block.timestamp;
    }
}
